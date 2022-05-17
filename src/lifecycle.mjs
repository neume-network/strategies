//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { once } from "events";
import EventEmitter from "events";
import { env } from "process";

import Ajv from "ajv";
import partition from "lodash.partition";
import {
  extraction as extractionMsg,
  transformation as transformationMsg,
} from "@music-os/message-schema";

import {
  NotImplementedError,
  NotFoundError,
  ValidationError,
} from "./errors.mjs";
import { getdirdirs, loadAll, write } from "./disc.mjs";
import logger from "./logger.mjs";

const log = logger("lifecycle");
const __dirname = dirname(fileURLToPath(import.meta.url));
const strategyDir = "./strategies";
// TODO: https://github.com/music-os/music-os-core/issues/33
const dataDir = resolve(__dirname, "../../..", env.DATA_DIR);
const fileNames = {
  transformer: "transformer.mjs",
  extractor: "extractor.mjs",
};
const ajv = new Ajv();
const validate = ajv.compile({
  oneOf: [extractionMsg, transformationMsg],
});
class LifeCycleHandler extends EventEmitter {}

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
    return strategies[1].module.transform(line);
  };
}

export const transformation = {
  lineReader,
  applyOnLine,
};

function extract(worker, extractor, state) {
  const step0 = extractor.module.init(state);
  state = step0.state;

  worker.on("message", async (message) => {
    if (message.error) {
      throw new Error(message.error);
    }

    const stepN = extractor.module.update(message, state);

    await write(resolve(dataDir, extractor.name), `${stepN.write}\n`);
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

export function route(message, worker, extractors, transformers) {
  if (message.type === "extraction") {
    const strategy = extractors.find(({ name }) => name === message.name);
    if (strategy && strategy.module) {
      // TODO: Figure out how to test invoking this function
      extract(worker, strategy, message.state);
    } else {
      throw new NotFoundError("Failed to find matching extraction strategy.");
    }
  } else if (message.type === "transformation") {
    const strategy = transformers.find(({ name }) => name === message.name);
    if (strategy && strategy.module) {
      // TODO
    } else {
      throw new NotFoundError(
        "Failed to find matching transformation strategy."
      );
    }
  } else {
    throw new NotImplementedError(
      `Failed to find strategy type for corresponding type submission: "${message.type}"`
    );
  }
}

export function launch(worker, router) {
  return async (message) => {
    const valid = validate(message);
    if (!valid) {
      log(validate.errors);
      throw new ValidationError(
        "Found 1 or more validation error when checking lifecycle message."
      );
    }

    const extractors = await loadStrategies(strategyDir, fileNames.extractor);
    const transformers = await loadStrategies(
      strategyDir,
      fileNames.transformer
    );
    router(message, worker, extractors, transformers);
  };
}

export async function init(worker) {
  const lch = new LifeCycleHandler();
  lch.on("message", launch(worker, route));
  //lch.emit("message", {
  //  type: "extraction",
  //  version: "0.0.1",
  //  name: "web3subgraph",
  //  state: null,
  //  results: null,
  //  error: null,
  //});
  lch.emit("message", {
    type: "transformation",
    version: "0.0.1",
    name: "web3subgraph",
    args: null,
    results: null,
    error: null,
  });
}

export const extraction = {
  extract,
};
