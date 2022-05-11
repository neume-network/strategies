//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { once } from "events";
import EventEmitter from "events";

import Ajv from "ajv";
import partition from "lodash.partition";
import {
  extraction as extractionMsg,
  transformation as transformationMsg,
} from "@music-os/message-schema";

import { getdirdirs, loadAll } from "./disc.mjs";
import logger from "./logger.mjs";

const log = logger("lifecycle");
const __dirname = dirname(fileURLToPath(import.meta.url));
const strategyDir = "./strategies";
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

export function route(worker) {
  return async (message) => {
    const valid = validate(message);
    if (!valid) {
      // TODO: Add proper error
      throw new Error("invalid message schema");
    }

    const extractors = await loadStrategies(strategyDir, fileNames.extractor);
    const transformers = await loadStrategies(
      strategyDir,
      fileNames.transformer
    );
    if (message.type === "extraction") {
      const strategy = extractors.find(({ name }) => name === message.name);
      if (strategy && strategy.module) {
        extract(worker, strategy.module, message.state);
      } else {
        throw new Error("couldn't find matching strategy");
      }
    } else if (message.type === "transformation") {
      const strategy = transformers.find(({ name }) => name === message.name);
      if (strategy && strategy.module) {
        // TODO
        //const dataPath = resolve(__dirname, "../data");
        //const strategies = await loadStrategies("./strategies", "transformer.mjs");
        //const onLineHandler = transformation.applyOnLine(strategies);
        //const onLineHandlerProxy = (line) => {
        //  const result = onLineHandler(line);
        //  log(result);
        //};
        //await transformation.lineReader(dataPath, onLineHandlerProxy);
      } else {
        throw new Error("couldn't find matching strategy");
      }
    }
  };
}

async function init(worker) {
  const lch = new LifeCycleHandler();
  lch.on("message", route(worker));
  lch.emit("message", {
    type: "extraction",
    version: "0.0.1",
    name: "web3subgraph",
    state: null,
    results: null,
    error: null,
  });
}

export const extraction = {
  init,
  extract,
};
