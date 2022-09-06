// @format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { once } from "events";
import { Worker } from "worker_threads";
import { prepareMessages } from "../src/lifecycle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

    const ret = extractor.update(message);
    if (ret.write) write(ret.write);

    prepareMessages(ret.messages, extractor.name)
      .filter(({ type }) => type !== "extraction" && type !== "transformation")
      .forEach((message) => {
        postMessage(message);
      });

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
