//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { once } from "events";

import partition from "lodash.partition";

import { getdirdirs, loadAll } from "./disc.mjs";
import logger from "./logger.mjs";

const log = logger("lifecycle");
const __dirname = dirname(fileURLToPath(import.meta.url));
const strategyDir = "./strategies";
const fileNames = {
  transformer: "transformer.mjs",
  extractor: "extractor.mjs",
};

async function lineReader(path, onLineHandler) {
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  rl.on("line", onLineHandler);
  return await once(rl, "close");
}

function applyOnLine(strategies) {
  return (line) => {
    return strategies[1].transform(line);
  };
}

export const transformation = {
  lineReader,
  applyOnLine,
};

function extract(worker, extractor, state) {
  const step0 = extractor.init(state);
  state = step0.state;

  worker.on("message", (message) => {
    if (message.error) {
      throw new Error(message.error);
    }

    const stepN = extractor.update(message, state);

    state = stepN.state;
    const [internal, external] = partition(
      stepN.messages,
      ({ type }) => type === "extraction"
    );
    external.forEach((message) => worker.postMessage(message));
  });

  const [internal, external] = partition(
    step0.messages,
    ({ type }) => type === "extraction"
  );
  external.forEach((message) => worker.postMessage(message));
}

export async function loadStrategies(pathTip, fileName) {
  const path = resolve(__dirname, pathTip);
  const paths = await getdirdirs(path);
  return await loadAll(paths, fileName);
}

async function init(worker) {
  const extractors = await loadStrategies(strategyDir, fileNames.extractor);
  for (const extractor of extractors) {
    if (extractor.props.autoStart) {
      let state = {};
      extract(worker, extractor, state);
    }
  }
}

export const extraction = {
  init,
  extract,
};
