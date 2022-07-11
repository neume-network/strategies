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
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const strategyDir = "./strategies";
// TODO: https://github.com/neume-network/core/issues/33
const dataDir = path.resolve(__dirname, "../../..", env.DATA_DIR);
const fileNames = {
  transformer: "transformer.mjs",
  extractor: "extractor.mjs",
};
const timeout = 3000;
const ajv = new Ajv();
const validate = ajv.compile(lifecycleMessage);

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

  log(`Starting transformer strategy with name "${strategy.name}"`);
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
  log(`Ending transformer strategy with name "${strategy.name}"`);
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

export function check(message) {
  const valid = validate(message);
  if (!valid) {
    const sMessage = JSON.stringify(message);
    log(JSON.stringify(validate.errors));
    throw new ValidationError(
      `Found 1 or more validation error when checking lifecycle message: "${sMessage}"`
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

function applyTimeout(message) {
  if (message.type === "https" || message.type === "json-rpc") {
    message.options.timeout = timeout;
  }
  return message;
}

function extract(strategy, worker, messageRouter, args = []) {
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
          )}`
        );
        return;
      }
      return result;
    };

    log(
      `Starting extractor with name "${
        strategy.module.name
      }" with fn "init" and params "${JSON.stringify(args)}"`
    );

    const result = checkResult(await strategy.module.init(...args));

    if (result.write) {
      const filePath = generatePath(strategy.module.name, type);
      await write(filePath, `${result.write}\n`);
    }

    const callback = async (message) => {
      numberOfMessages--;

      const result = checkResult(strategy.module.update(message));

      if (!result)
        reject(
          `Strategy "${
            strategy.module.name
          }" and call init didn't return a valid result: "${JSON.stringify(
            result
          )}`
        );

      result.messages?.forEach((message) => {
        numberOfMessages++;
        worker.postMessage(applyTimeout(message));
      });

      if (result.write) {
        const filePath = generatePath(strategy.module.name, type);
        await write(filePath, `${result.write}\n`);
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
      resolve();
    }
  });
}

export async function init(worker) {
  const finder = await setupFinder();
  const messageRouter = new EventEmitter();

  worker.on("message", async (message) => {
    if (message.error) {
      throw new Error(message.commissioner + ":" + message.error);
    }

    messageRouter.emit(`${message.commissioner}-extraction`, message);
  });

  const graph = [
    [{ name: "web3subgraph", args: [] }],
    [
      {
        name: "soundxyz-call-tokenuri",
        args: [resolve(env.DATA_DIR, "web3subgraph-transformation")],
      },
      {
        name: "zora-call-tokenuri",
        args: [resolve(env.DATA_DIR, "web3subgraph-transformation")],
      },
      {
        name: "zora-call-tokenmetadatauri",
        args: [resolve(env.DATA_DIR, "web3subgraph-transformation")],
      },
      {
        name: "soundxyz-metadata",
        args: [resolve(env.DATA_DIR, "web3subgraph-transformation")],
      },
    ],
    [
      {
        name: "soundxyz-get-tokenuri",
        args: [resolve(env.DATA_DIR, "soundxyz-call-tokenuri-transformation")],
      },
      {
        name: "zora-get-tokenuri",
        args: [
          resolve(env.DATA_DIR, "zora-call-tokenmetadatauri-transformation"),
        ],
      },
    ],
    [
      {
        name: "music-os-accumulator",
        args: [],
      },
    ],
  ];

  for await (const path of graph) {
    await Promise.all(
      path.map(async (strategy) => {
        await extract(
          finder("extraction", strategy.name),
          worker,
          messageRouter,
          strategy.args
        );

        const transformStrategy = finder("transformation", strategy.name);

        const result = await transform(
          transformStrategy.module,
          transformStrategy.module.name,
          "extraction"
        );

        if (result && result.write) {
          const filePath = generatePath(
            transformStrategy.module.name,
            "transformation"
          );
          await write(filePath, `${result.write}\n`);
        } else {
          throw new Error(
            `Strategy "${
              strategy.module.name
            }-tranformation" didn't return a valid result: "${JSON.stringify(
              result
            )}`
          );
        }
      })
    );
  }
}
