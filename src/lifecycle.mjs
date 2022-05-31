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
import { lifecycleMessage } from "@neume-network/message-schema";

import {
  NotImplementedError,
  NotFoundError,
  ValidationError,
} from "./errors.mjs";
import { loadStrategies, write } from "./disc.mjs";
import logger from "./logger.mjs";

const log = logger("lifecycle");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const strategyDir = "./strategies";
// TODO: https://github.com/neume-network/core/issues/33
const dataDir = path.resolve(__dirname, "../../..", env.DATA_DIR);
const fileNames = {
  transformer: "transformer.mjs",
  extractor: "extractor.mjs",
};
const ajv = new Ajv();
const validate = ajv.compile(lifecycleMessage);
class LifeCycleHandler extends EventEmitter {}

export async function lineReader(path, onLineHandler) {
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  let writeBuff = "";
  let msgBuff = [];
  rl.on("line", (line) => {
    const { write, messages } = onLineHandler(line);
    if (write) {
      writeBuff += `${write}\n`;
    }
    msgBuff = [...msgBuff, ...messages];
  });
  await once(rl, "close");
  return {
    messages: msgBuff,
    write: writeBuff,
  };
}

export async function setupFinder() {
  const extractors = await loadStrategies(strategyDir, fileNames.extractor);
  const transformers = await loadStrategies(strategyDir, fileNames.transformer);
  return (type, name) => {
    let strategy;
    if (type === "extraction") {
      strategy = extractors.find((strategy) => strategy.name === name);
    } else if (type === "transformation") {
      strategy = transformers.find((strategy) => strategy.name === name);
    }

    if (strategy && strategy.module) {
      return strategy;
    } else {
      throw new NotFoundError("Failed to find matching strategy.");
    }
  };
}

export function check(message) {
  const valid = validate(message);
  if (!valid) {
    log(validate.errors);
    throw new ValidationError(
      "Found 1 or more validation error when checking lifecycle message."
    );
  }
}

export function filterLifeCycle(messages) {
  return messages.type === "extraction" || messages.type === "transformation";
}

export function generatePath(name, type) {
  return path.resolve(dataDir, `${name}-${type}`);
}

async function transform(handler, name, type) {
  const filePath = generatePath(name, type);
  return await lineReader(filePath, handler);
}

export async function run(strategy, type, fun, params) {
  let result;
  if (type === "extraction") {
    if (params) {
      result = await strategy.module[fun](...params);
    } else {
      result = await strategy.module[fun]();
    }
  } else if (type === "transformation") {
    result = await transform(
      strategy.module["transform"],
      strategy.name,
      "extraction"
    );
  }

  const filePath = generatePath(strategy.name, type);
  if (result && result.write) {
    await write(filePath, `${result.write}\n`);
  }
  const [lifecycle, worker] = partition(result.messages, filterLifeCycle);
  return {
    lifecycle,
    worker,
  };
}

export async function init(worker) {
  const lch = new LifeCycleHandler();
  const finder = await setupFinder();

  worker.on("message", async (message) => {
    if (message.error) {
      throw new Error(message.error);
    }

    const lifeCycleType = "extraction";
    const strategy = finder(lifeCycleType, message.commissioner);
    const messages = await run(strategy, lifeCycleType, "update", [message]);
    messages.worker.forEach((message) => worker.postMessage(message));
    messages.lifecycle.forEach((message) => lch.emit("message", message));
  });

  lch.on("message", async (message) => {
    check(message);
    const lifeCycleType = message.type;
    const strategy = finder(lifeCycleType, message.name);
    const messages = await run(strategy, lifeCycleType, "init", message.args);
    messages.worker.forEach((message) => worker.postMessage(message));
    messages.lifecycle.forEach((message) => lch.emit("message", message));
  });

  lch.emit("message", {
    type: "extraction",
    version: "0.0.1",
    name: "web3subgraph",
    args: [null],
  });
  //lch.emit("message", {
  //  type: "transformation",
  //  version: "0.0.1",
  //  name: "web3subgraph",
  //  args: null,
  //});
}
