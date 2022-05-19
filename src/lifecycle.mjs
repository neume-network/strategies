//@format
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { once } from "events";
import EventEmitter from "events";
import { env } from "process";

import Ajv from "ajv";
import partition from "lodash.partition";
import { extraction, transformation } from "@music-os/message-schema";

import {
  NotImplementedError,
  NotFoundError,
  ValidationError,
} from "./errors.mjs";
import { getdirdirs, loadAll, write } from "./disc.mjs";
import logger from "./logger.mjs";

const log = logger("lifecycle");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const strategyDir = "./strategies";
// TODO: https://github.com/music-os/music-os-core/issues/33
const dataDir = path.resolve(__dirname, "../../..", env.DATA_DIR);
const fileNames = {
  transformer: "transformer.mjs",
  extractor: "extractor.mjs",
};
const ajv = new Ajv();
const validate = ajv.compile({
  oneOf: [extraction, transformation],
});
class LifeCycleHandler extends EventEmitter {}
let lch;

export async function lineReader(path, onLineHandler) {
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  rl.on("line", onLineHandler);
  return await once(rl, "close");
}

async function transform(worker, strategy) {
  const filePath = path.resolve(dataDir, strategy.name);
  const onLineHandler = (line) => {
    const { write, messages } = strategy.module.transform(line);
    // TODO: Resolve callback properly
    const fakeCB = () => {};
    distribute(messages, worker, fakeCB);
    return write;
  };
  return await lineReader(filePath, onLineHandler);
}

export function distribute(messages, worker, resolve) {
  const [internal, external] = partition(
    messages,
    ({ type }) => type === "extraction" || type === "transformation"
  );
  if (!internal.length && !external.length) {
    return resolve();
  }
  internal.forEach((message) => lch.emit("message", message));
  external.forEach((message) => worker.postMessage(message));
}

export async function extract(worker, extractor, state) {
  return new Promise((resolve, reject) => {
    const step0 = extractor.module.init(state);
    state = step0.state;

    worker.on("message", async (message) => {
      if (message.error) {
        return reject(new Error(message.error));
      }
      if (message.commissioner !== extractor.name) {
        return;
      }

      const stepN = extractor.module.update(message, state);
      const filePath = path.resolve(dataDir, extractor.name);
      await write(filePath, `${stepN.write}\n`);
      state = stepN.state;

      distribute(stepN.messages, worker, resolve);
    });

    distribute(step0.messages, worker, resolve);
  });
}

export async function loadStrategies(pathTip, fileName) {
  const strategyDir = path.resolve(__dirname, pathTip);
  const strategies = await getdirdirs(strategyDir);
  return await loadAll(strategies, fileName);
}

export async function route(message, worker, extractors, transformers) {
  if (message.type === "extraction") {
    const strategy = extractors.find(({ name }) => name === message.name);
    if (strategy && strategy.module) {
      await extract(worker, strategy, message.state);
      lch.emit("message", {
        type: "transformation",
        version: "0.0.1",
        name: strategy.name,
        args: null,
        results: null,
        error: null,
      });
    } else {
      throw new NotFoundError("Failed to find matching extraction strategy.");
    }
  } else if (message.type === "transformation") {
    const strategy = transformers.find(({ name }) => name === message.name);
    if (strategy && strategy.module) {
      await transform(worker, strategy);
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

export async function launch(worker, router) {
  const extractors = await loadStrategies(strategyDir, fileNames.extractor);
  const transformers = await loadStrategies(strategyDir, fileNames.transformer);
  return async (message) => {
    const valid = validate(message);
    if (!valid) {
      log(validate.errors);
      throw new ValidationError(
        "Found 1 or more validation error when checking lifecycle message."
      );
    }

    return await router(message, worker, extractors, transformers);
  };
}

export async function init(worker) {
  lch = new LifeCycleHandler();
  lch.on("message", await launch(worker, route));
  lch.emit("message", {
    type: "extraction",
    version: "0.0.1",
    name: "web3subgraph",
    state: null,
    results: null,
    error: null,
  });
}
