//@format
import path from "path";
import { createInterface } from "readline";
import { createReadStream, appendFileSync } from "fs";
import EventEmitter, { once } from "events";
import { env } from "process";
import Ajv from "ajv";
import { workerMessage } from "@neume-network/message-schema";
import { crawlPath as crawlPathSchema } from "@neume-network/schema";
import util from "util";

import { NotFoundError } from "./errors.mjs";
import { fileExists, loadStrategies } from "./disc.mjs";
import logger from "./logger.mjs";

export const EXTRACTOR_CODES = {
  FAILURE: 1,
  SHUTDOWN_IN_INIT: 2,
  SHUTDOWN_IN_UPDATE: 3,
};

const log = logger("lifecycle");
const strategyDir = "./strategies";
// TODO: https://github.com/neume-network/core/issues/33
const dataDir = path.resolve(env.DATA_DIR);
const fileNames = {
  transformer: "transformer.mjs",
  extractor: "extractor.mjs",
};
const ajv = new Ajv();
const workerValidator = ajv.compile(workerMessage);
const crawlPathValidator = ajv.compile(crawlPathSchema);

function validateWorkerMessage(message) {
  const valid = workerValidator(message);

  if (!valid) {
    log("Found 1 or more validation error, ignoring worker message:", message);
    log(workerValidator.errors);
    return false;
  }

  return true;
}

/**
 * Prepare messages by adding commisioner, filtering
 * invalid messages and logging them.
 * For lack of better solution we are ignoring invalid messages.
 **/
export function prepareMessages(messages, commissioner) {
  return messages
    .map((message) => {
      return {
        commissioner,
        ...message,
      };
    })
    .filter(validateWorkerMessage);
}

export function validateCrawlPath(crawlPath) {
  const valid = crawlPathValidator(crawlPath);

  if (!valid) {
    log("Found 1 or more validation error in crawl path:", crawlPath);
    log(crawlPathValidator.errors);
    throw new Error("Validation error in crawl path");
  }
}

export async function transform(strategy, sourcePath, outputPath, args) {
  if (!(await fileExists(sourcePath))) {
    log(
      `Skipping "${strategy.module.name}" transformation as sourcePath file doesn't exist "${sourcePath}"`
    );
    return;
  }
  const rl = createInterface({
    input: createReadStream(sourcePath),
    crlfDelay: Infinity,
  });

  let buffer = [];
  rl.on("line", async (line) => {
    const { write, messages } = strategy.module.onLine(line, ...args);
    if (write) {
      appendFileSync(outputPath, `${write}\n`);
    }
    buffer = [...buffer, ...prepareMessages(messages, strategy.module.name)];
  });
  // TODO: Figure out how `onError` shall be handled.
  rl.on("error", (error) => {
    const { write, messages } = strategy.module.onError(error);
    buffer = [...buffer, ...prepareMessages(messages, strategy.module.name)];
  });

  await once(rl, "close");
  const { write, messages } = strategy.module.onClose();
  if (write) {
    appendFileSync(outputPath, `${write}\n`);
  }
  buffer = [...buffer, ...prepareMessages(messages, strategy.module.name)];
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

export function extract(strategy, worker, messageRouter, args = []) {
  return new Promise(async (resolve, reject) => {
    let numberOfMessages = 0;
    const type = "extraction";
    const interval = setInterval(() => {
      log(
        `${strategy.module.name} extractor is running with ${numberOfMessages} messages pending`
      );
    }, 120_000);

    const result = await strategy.module.init(...args);
    if (!result) {
      const error = new Error(
        `Strategy "${
          strategy.module.name
        }-extraction" didn't return a valid result: "${JSON.stringify(result)}"`
      );
      error.code = EXTRACTOR_CODES.FAILURE;
      clearInterval(interval);
      return reject(error);
    }

    if (result.write) {
      const filePath = generatePath(strategy.module.name, type);
      try {
        appendFileSync(filePath, `${result.write}\n`);
      } catch (err) {
        const error = new Error(
          `Couldn't write to file after update. Filepath: "${filePath}", Content: "${result.write}"`
        );
        error.code = EXTRACTOR_CODES.FAILURE;
        clearInterval(interval);
        return reject(error);
      }
    }

    const callback = async (message) => {
      numberOfMessages--;
      log(`Leftover Lifecycle Messages: ${numberOfMessages}`);

      if (message.error) {
        log(
          `Received error message from worker for strategy "${strategy.module.name}": "${message.error}"`
        );
      } else {
        let valid = true;
        const validator = ajv.compile(message.schema);
        if (message.schema) {
          valid = validator(message.results);
        }

        if (valid) {
          const result = await strategy.module.update(message);
          if (!result) {
            const error = new Error(
              `Strategy "${
                strategy.module.name
              }-extraction" didn't return a valid result: "${JSON.stringify(
                result
              )}"`
            );
            error.code = EXTRACTOR_CODES.FAILURE;
            messageRouter.off(`${strategy.module.name}-${type}`, callback);
            clearInterval(interval);
            return reject(error);
          }

          if (result.messages?.length !== 0) {
            prepareMessages(result.messages, strategy.module.name).forEach(
              (message) => {
                numberOfMessages++;
                worker.postMessage(message);
              }
            );
          }

          if (result.write) {
            const filePath = generatePath(strategy.module.name, type);
            try {
              appendFileSync(filePath, `${result.write}\n`);
            } catch (err) {
              const error = new Error(
                `Couldn't write to file after update. Filepath: "${filePath}", Content: "${result.write}"`
              );
              error.code = EXTRACTOR_CODES.FAILURE;
              messageRouter.off(`${strategy.module.name}-${type}`, callback);
              clearInterval(interval);
              return reject(error);
            }
          }
        } else {
          log(
            `Invalid schema for ${JSON.stringify(message.results)}`,
            validator.errors
          );
        }
      }

      if (numberOfMessages === 0) {
        log("Shutting down extraction in update callback function");
        messageRouter.off(`${strategy.module.name}-${type}`, callback);
        clearInterval(interval);
        resolve({ code: EXTRACTOR_CODES.SHUTDOWN_IN_UPDATE });
      }
    };

    messageRouter.on(`${strategy.module.name}-${type}`, callback);

    let preparedMessages =
      result.messages?.length !== 0
        ? prepareMessages(result.messages, strategy.module.name)
        : 0;

    if (preparedMessages.length > 0) {
      preparedMessages.forEach((message) => {
        numberOfMessages++;
        worker.postMessage(message);
      });
    } else {
      log("Shutting down extraction in init follow-up function");
      messageRouter.off(`${strategy.module.name}-${type}`, callback);
      clearInterval(interval);
      resolve({ code: EXTRACTOR_CODES.SHUTDOWN_IN_INIT });
    }
  });
}

export async function init(worker, crawlPath) {
  validateCrawlPath(crawlPath);
  const finder = await setupFinder();
  const messageRouter = new EventEmitter();

  worker.on("message", (message) => {
    // This is fatal we can't continue
    if (!message.commissioner) {
      throw new Error(
        `Can't redirect; message.commissioner is ${message.commissioner}`
      );
    } else {
      messageRouter.emit(`${message.commissioner}-extraction`, message);
    }
  });

  log(
    `Starting to execute strategies with the following crawlPath`,
    util.inspect(crawlPath, {
      depth: null,
      colors: true,
      breakLength: "Infinity",
      compact: true,
    })
  );

  for (const segment of crawlPath) {
    for await (const strategy of segment) {
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
        log(
          `Ending extractor strategy with name "${extractStrategy.module.name}"`
        );
      }

      if (strategy.transformer) {
        const transformStrategy = finder("transformation", strategy.name);
        log(
          `Starting transformer strategy with name "${transformStrategy.module.name}"`
        );
        const sourcePath =
          strategy.transformer.args?.[0] ??
          generatePath(transformStrategy.module.name, "extraction");
        const outputPath = generatePath(
          transformStrategy.module.name,
          "transformation"
        );
        await transform(
          transformStrategy,
          sourcePath,
          outputPath,
          strategy.transformer.args ? strategy.transformer.args.slice(1) : []
        );
        log(
          `Ending transformer strategy with name "${transformStrategy.module.name}"`
        );
      }
    }
  }

  log("All strategies executed");
  worker.postMessage({
    type: "exit",
    version: "0.0.1",
  });
}
