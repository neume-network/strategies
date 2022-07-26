//@format
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { once } from "events";
import EventEmitter from "events";
import { env, exit } from "process";

import Ajv from "ajv";
import { lifecycleMessage } from "@neume-network/message-schema";

import { NotFoundError, ValidationError } from "./errors.mjs";
import { loadStrategies, write } from "./disc.mjs";
import logger from "./logger.mjs";

const log = logger("lifecycle");
const strategyDir = "./strategies";
// TODO: https://github.com/neume-network/core/issues/33
const dataDir = path.resolve(env.DATA_DIR);
const fileNames = {
  transformer: "transformer.mjs",
  extractor: "extractor.mjs",
};
const timeout = 3000;

function fill(buffer, write, messages) {
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

  let buffer = { write: "", messages: [] };
  rl.on("line", (line) => {
    const { write, messages } = strategy.onLine(line);
    buffer = fill(buffer, write, messages);
  });
  // TODO: Figure out how `onError` shall be handled.
  rl.on("error", (error) => {
    const { write, messages } = strategy.onError(error);
    buffer = fill(buffer, write, messages);
  });

  await once(rl, "close");
  const { write, messages } = strategy.onClose();
  buffer = fill(buffer, write, messages);
  return buffer;
}

export async function setupFinder() {
  const extractors = await loadStrategies(strategyDir, fileNames.extractor);
  const transformers = await loadStrategies(strategyDir, fileNames.transformer);
  return (type, name) => {
    let strategy;
    if (type === "extraction") {
      strategy = extractors.find((strategy) => strategy.module.name === name);
    } else if (type === "transformation") {
      strategy = transformers.find((strategy) => strategy.module.name === name);
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

export function generatePath(name, type) {
  return path.resolve(dataDir, `${name}-${type}`);
}

async function transform(strategy, name, type) {
  const filePath = generatePath(name, type);
  const result = await lineReader(filePath, strategy);

  if (result && result.write) {
    const filePath = generatePath(name, "transformation");
    await write(filePath, `${result.write}\n`);
  } else {
    throw new Error(
      `Strategy "${name}-tranformation" didn't return a valid result: "${JSON.stringify(
        result
      )}"`
    );
  }
}

function applyTimeout(message) {
  if (message.type === "https" || message.type === "json-rpc") {
    message.options.timeout = timeout;
  }
  return message;
}

export function extract(strategy, worker, messageRouter, args = []) {
  return new Promise(async (resolve, reject) => {
    let numberOfMessages = 0;
    const type = "extraction";
    const checkResult = (result) => {
      if (!result) {
        reject(
          `Strategy "${
            strategy.module.name
          }-extraction" didn't return a valid result: "${JSON.stringify(
            result
          )}"`
        );
        return;
      }
      return result;
    };

    const result = checkResult(await strategy.module.init(...args));

    if (result.write) {
      const filePath = generatePath(strategy.module.name, type);
      await write(filePath, `${result.write}\n`);
    }

    const callback = async (message) => {
      numberOfMessages--;

      if (message.error) {
        log(message.commissioner + ":" + message.error);
      } else {
        const result = checkResult(strategy.module.update(message));

        if (!result)
          reject(
            `Strategy "${
              strategy.module.name
            }" and call init didn't return a valid result: "${JSON.stringify(
              result
            )}"`
          );

        result.messages?.forEach((message) => {
          numberOfMessages++;
          worker.postMessage(applyTimeout(message));
        });

        if (result.write) {
          const filePath = generatePath(strategy.module.name, type);
          await write(filePath, `${result.write}\n`);
        }
      }

      if (numberOfMessages === 0) {
        messageRouter.off(`${strategy.module.name}-${type}`, callback);
        resolve();
      }
    };

    messageRouter.on(`${strategy.module.name}-${type}`, callback);

    if (result.messages.length !== 0) {
      result.messages.forEach((message) => {
        numberOfMessages++;
        worker.postMessage(applyTimeout(message));
      });
    } else {
      messageRouter.off(`${strategy.module.name}-${type}`, callback);
      resolve();
    }
  });
}

export async function init(worker, crawlPath) {
  const finder = await setupFinder();
  const messageRouter = new EventEmitter();

  worker.on("message", async (message) => {
    messageRouter.emit(`${message.commissioner}-extraction`, message);
  });

  log(
    `Starting to execute strategies with the following crawlPath ${JSON.stringify(
      crawlPath
    )}`
  );

  for await (const path of crawlPath) {
    await Promise.all(
      path.map(async (strategy) => {
        if (strategy.extractor) {
          const extractStrategy = finder("extraction", strategy.name);
          log(
            `Starting extractor strategy with name "${
              extractStrategy.module.name
            }" with params "${JSON.stringify(strategy.extractor.args)}"`
          );
          await extract(
            extractStrategy,
            worker,
            messageRouter,
            strategy.extractor.args
          );
        }

        if (strategy.transformer) {
          const transformStrategy = finder("transformation", strategy.name);
          log(
            `Starting transformer strategy with name "${transformStrategy.module.name}"`
          );
          await transform(
            transformStrategy.module,
            transformStrategy.module.name,
            "extraction"
          );
          log(
            `Ending transformer strategy with name "${transformStrategy.module.name}"`
          );
        }
      })
    );
  }

  log("All strategies executed");
  worker.postMessage({
    type: "exit",
    version: "0.0.1",
  });
}
