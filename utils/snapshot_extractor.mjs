// @format
import "dotenv/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { once } from "events";
import { Worker } from "worker_threads";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function snapshotExtractor2(
  extractor,
  { inputs, expect }
) {
  const map = new Map();
  expect.write.forEach((line) => map.set(line, false));

  const worker = new Worker(resolve(__dirname, "./worker_start.mjs"), {
    workerData: {
      concurrency: 20,
    },
  });

  let numberOfPostedMessages = 0;
  const postMessage = (message) => {
    numberOfPostedMessages++;
    worker.postMessage(message);
  };

  // Uncomment this to see what is being written
  const DEBUG = false;
  let writeResult = "";
  const write = (string) => {
    if (DEBUG && string) {
      writeResult += string + "\n";
    }
  };

  worker.on("message", (message) => {
    if (message.error) {
      worker.emit("exit");
      throw new Error(message.error);
    }

    const ret = extractor.update(message);
    write(ret.write);
    if (map.has(ret.write)) map.set(ret.write, true);

    ret.messages
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
  write(ret.write);
  if (map.has(ret.write)) map.set(ret.write, true);

  ret.messages
    .filter(({ type }) => type !== "extraction" && type !== "transformation")
    .forEach((message) => {
      postMessage(message);
    });

  await once(worker, "exit");

  DEBUG && console.log("writeResult\n", writeResult);

  let areAllLinesWritten = true;
  for (const [line, isLineWritten] of map) {
    if (!isLineWritten) {
      areAllLinesWritten = false;
      break;
    }
  }

  return areAllLinesWritten;
}
