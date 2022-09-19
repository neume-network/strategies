// @format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { once } from "events";
import { Worker } from "worker_threads";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { prepareMessages } from "../src/lifecycle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ajv = new Ajv();
addFormats(ajv);

export default async function snapshotExtractor(extractor, { inputs }) {
  const worker = new Worker(resolve(__dirname, "./worker_start.mjs"), {
    workerData: {
      queue: {
        options: {
          concurrent: 20,
        },
      },
    },
  });

  let numberOfPostedMessages = 0;
  const postMessage = (message) => {
    numberOfPostedMessages++;
    worker.postMessage(message);
  };

  let writeResult = "";
  const write = (string) => {
    writeResult += string + "\n";
  };

  worker.on("message", (message) => {
    if (message.error) {
      worker.emit("exit");
      console.error("Encountered error in SnapshotExtractor", message);
      throw new Error(message.error);
    }

    let valid = true;
    let validator;
    if (message.schema) {
      validator = ajv.compile(message.schema);
      valid = validator(message.results);
    }

    if (valid) {
      const ret = extractor.update(message);
      if (ret.write) write(ret.write);

      prepareMessages(ret.messages, extractor.name)
        .filter(
          ({ type }) => type !== "extraction" && type !== "transformation"
        )
        .forEach((message) => {
          postMessage(message);
        });
    }

    numberOfPostedMessages--;
    if (numberOfPostedMessages === 0) {
      worker.emit("exit");
    }
  });

  const ret = await extractor.init(...inputs);
  if (ret.write) write(ret.write);

  const preparedMessages = prepareMessages(ret.messages, extractor.name).filter(
    ({ type }) => type !== "extraction" && type !== "transformation"
  );

  if (preparedMessages.length) {
    preparedMessages.forEach((message) => {
      postMessage(message);
    });
    await once(worker, "exit");
  }

  return writeResult;
}
