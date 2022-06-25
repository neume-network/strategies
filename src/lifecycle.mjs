//@format
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { once } from "events";
import EventEmitter from "events";
import { env } from "process";
import { format } from "util";

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

function fill(buffer, write, messages, error) {
  if (error) {
    buffer.error ? buffer.error.push(error) : (buffer.error = [error]);
  }
  if (write) {
    buffer.write += `${write}\n`;
  }
  buffer.messages = [...buffer.messages, ...messages];

  return buffer;
}

export async function lineReader(path, strategy) {
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });

  let buffer = { write: "", messages: [], error: null };
  rl.on("line", (line) => {
    const { write, messages, error } = strategy.onLine(line);
    buffer = fill(buffer, write, messages, error);
  });
  // TODO: Figure out how `onError` shall be handled.
  rl.on("error", (error) => {
    const { write, messages } = strategy.onError(error);
    buffer = fill(buffer, write, messages);
  });

  await once(rl, "close");
  const { write, messages, error } = strategy.onClose();
  buffer = fill(buffer, write, messages, error);
  return buffer;
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
      throw new NotFoundError(
        `Failed to find matching strategy for name: "${name}" and type "${type}"`
      );
    }
  };
}

export function check(message) {
  const valid = validate(message);
  if (!valid) {
    log(JSON.stringify(message));
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

async function transform(strategy, name, type) {
  const filePath = generatePath(name, type);
  return await lineReader(filePath, strategy);
}

function formatError(error) {
  if (typeof error === "string") return format("%s\n", error);
  if (Array.isArray(error)) {
    return error.map((e) => format("%O\n", e)).join("");
  }
  return format("%O\n", error);
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
    result = await transform(strategy.module, strategy.name, "extraction");
  }

  const filePath = generatePath(strategy.name, type);
  if (result) {
    if (result.error) {
      await write(filePath + "-errors", `${formatError(result.error)}`);
    }
    if (result.write) {
      await write(filePath, `${result.write}\n`);
    }
  } else {
    throw new Error(
      `Strategy "${
        strategy.name
      }" and call "${fun}" didn't return a valid result: "${JSON.stringify(
        result
      )}"`
    );
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
    args: [],
  });
  //lch.emit("message", {
  //  type: "transformation",
  //  version: "0.0.1",
  //  name: "web3subgraph",
  //  args: null,
  //});
}
