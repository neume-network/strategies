//@format
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { appendFile } from "fs/promises";
import EventEmitter, { once } from "events";
import { env, exit } from "process";

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

export async function transform(strategy, sourcePath, outputPath) {
  const rl = createInterface({
    input: createReadStream(sourcePath),
    crlfDelay: Infinity,
  });

  let buffer = [];
  rl.on("line", async (line) => {
    const { write, messages } = strategy.module.onLine(line);
    if (write) {
      await appendFile(outputPath, `${write}\n`);
    }
    buffer = [...buffer, ...messages];
  });
  // TODO: Figure out how `onError` shall be handled.
  rl.on("error", (error) => {
    const { write, messages } = strategy.module.onError(error);
    buffer = [...buffer, ...messages];
  });

  await once(rl, "close");
  const { write, messages } = strategy.module.onClose();
  if (write) {
    await appendFile(outputPath, `${write}\n`);
  }
  buffer = [...buffer, ...messages];
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
      return reject(
        new Error(
          `Strategy "${
            strategy.module.name
          }-extraction" didn't return a valid result: "${JSON.stringify(
            result
          )}"`
        )
      );
    }

    if (result.write) {
      const filePath = generatePath(strategy.module.name, type);
      try {
        await write(filePath, `${result.write}\n`);
      } catch (err) {
        return reject(
          new Error(
            `Couldn't write to file after update. Filepath: "${filePath}", Content: "${result.write}"`
          )
        );
      }
    }

    const callback = async (message) => {
      numberOfMessages--;
      log(`Leftover Lifecycle Messages: ${numberOfMessages}`);

      if (message.error) {
        log(
          `Received error message from worker for strategy "${message.commissioner}": "${message.error}"`
        );
      } else {
        const result = await strategy.module.update(message);
        if (!result) {
          clearInterval(interval);
          messageRouter.off(`${strategy.module.name}-${type}`, callback);
          return reject(
            new Error(
              `Strategy "${
                strategy.module.name
              }-extraction" didn't return a valid result: "${JSON.stringify(
                result
              )}"`
            )
          );
        }

        result.messages?.forEach((message) => {
          numberOfMessages++;
          worker.postMessage(message);
        });

        if (result.write) {
          const filePath = generatePath(strategy.module.name, type);
          try {
            await write(filePath, `${result.write}\n`);
          } catch (err) {
            return reject(
              new Error(
                `Couldn't write to file after update. Filepath: "${filePath}", Content: "${result.write}"`
              )
            );
          }
        }
      }

      if (numberOfMessages === 0) {
        log("Shutting down extraction in update callback function");
        messageRouter.off(`${strategy.module.name}-${type}`, callback);
        clearInterval(interval);
        resolve();
      }
    };

    messageRouter.on(`${strategy.module.name}-${type}`, callback);

    if (result.messages.length !== 0) {
      result.messages.forEach((message) => {
        numberOfMessages++;
        worker.postMessage(message);
      });
    } else {
      log("Shutting down extraction in init follow-up function");
      messageRouter.off(`${strategy.module.name}-${type}`, callback);
      clearInterval(interval);
      resolve();
    }
  });
}

export async function init(worker, crawlPath) {
  const finder = await setupFinder();
  const messageRouter = new EventEmitter();

  worker.on("message", (message) => {
    messageRouter.emit(`${message.commissioner}-extraction`, message);
  });

  log(
    `Starting to execute strategies with the following crawlPath ${JSON.stringify(
      crawlPath
    )}`
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
        const sourcePath = generatePath(
          transformStrategy.module.name,
          "extraction"
        );
        const outputPath = generatePath(
          transformStrategy.module.name,
          "transformation"
        );
        await transform(transformStrategy, sourcePath, outputPath);
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
