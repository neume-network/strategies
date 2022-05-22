//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { loadStrategies } from "../src/disc.mjs";
import { check, lineReader, setupFinder, extract } from "../src/lifecycle.mjs";
import {
  ValidationError,
  NotFoundError,
  NotImplementedError,
} from "../src/errors.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("test if checking valid lifecycle message passes check function", (t) => {
  const invalidMessage = {
    type: "extraction",
    version: "0.0.1",
    name: "web3subgraph",
    state: null,
    results: null,
    error: null,
  };
  check(invalidMessage);
  t.pass();
});

test("checking if message throws", (t) => {
  const invalidMessage = { hello: "world" };
  t.throws(() => check(invalidMessage));
});

test("running a lifecycle that throws", async (t) => {
  const [strategy] = (
    await loadStrategies("./strategies", "extractor.mjs")
  ).filter((strategy) => strategy.name === "web3subgraph");
  let callback;
  const mockWorker = {
    on: async (eventName, cb) => {
      callback = cb;
    },
    postMessage: (message) => {
      message = {
        ...message,
        error: new Error("STOP THE PROCESS!"),
      };
      return callback(message);
    },
  };
  const state = {};

  await t.throwsAsync(async () => await extract(mockWorker, strategy, state), {
    instanceOf: Error,
  });
});

test("running a non-iterative extractor lifecycle that can end", async (t) => {
  const [strategy] = (
    await loadStrategies("./strategies", "extractor.mjs")
  ).filter((strategy) => strategy.name === "web3subgraph");
  let callback;
  const mockWorker = {
    on: async (eventName, cb) => {
      callback = cb;
    },
    postMessage: (message) => {
      message = {
        ...message,
        results: {
          data: {
            nfts: [],
          },
        },
      };
      return callback(message);
    },
  };
  const state = {};

  await extract(mockWorker, strategy, state);
  t.truthy(callback);
  t.pass();
});

test("running an iterative extractor lifecycle that can end", async (t) => {
  const [strategy] = (
    await loadStrategies("./strategies", "extractor.mjs")
  ).filter((strategy) => strategy.name === "web3subgraph");
  let callback;
  let end = false;
  const mockWorker = {
    on: async (eventName, cb) => {
      callback = cb;
    },
    postMessage: (message) => {
      if (end) {
        message = {
          ...message,
          results: {
            data: {
              nfts: [],
            },
          },
        };
      } else {
        message = {
          ...message,
          results: {
            data: {
              nfts: [{ id: "0xabc/0" }],
            },
          },
        };
      }
      end = true;
      return callback(message);
    },
  };
  const state = {};

  await extract(mockWorker, strategy, state);
  t.truthy(callback);
  t.pass();
});

test("if launcher throws errors on invalid strategy type", async (t) => {
  const finder = await setupFinder();
  t.throws(() => finder({ type: "non-existent" }), {
    instanceOf: NotFoundError,
  });
});

test("if launcher throws errors on invalid strategy name submission", async (t) => {
  const message0 = { type: "extraction", name: "non-existent" };
  const message1 = { type: "extraction", name: "non-existent" };

  const finder = await setupFinder();
  t.throws(() => finder(message0), {
    instanceOf: NotFoundError,
  });
  t.throws(() => finder(message1), {
    instanceOf: NotFoundError,
  });
});

test("reading a file by line using the line reader", async (t) => {
  const path = resolve(__dirname, "./fixtures/file0.data");
  let count = 0;
  t.plan(3);
  const onLineHandler = (line) => {
    if (count === 0) t.is(line, "line0");
    if (count === 1) t.is(line, "line1");
    count++;
  };
  await lineReader(path, onLineHandler);
  t.is(count, 2);
});

test("applying transformation strategies to a file", async (t) => {
  const dataPath = resolve(__dirname, "./fixtures/file1.data");
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter((strategy) => strategy && strategy.name === "soundxyz");
  const onLineHandler = (line) => strategies[0].module.transform(line);
  await lineReader(dataPath, onLineHandler);
  t.pass();
});

test("loading strategies", async (t) => {
  const pathTip = "../test/fixtures/strategies";
  const fileName = "extractor.mjs";
  const strategies = await loadStrategies(pathTip, fileName);
  t.is(strategies.length, 1);
  t.truthy(strategies);
});
