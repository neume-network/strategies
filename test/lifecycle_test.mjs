//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { loadStrategies } from "../src/disc.mjs";
import { lineReader, route, launch, extract } from "../src/lifecycle.mjs";
import {
  ValidationError,
  NotFoundError,
  NotImplementedError,
} from "../src/errors.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

test("if launcher throws errors on invalid type submission", async (t) => {
  await t.throwsAsync(async () => await route({ type: "non-existent" }), {
    instanceOf: NotImplementedError,
  });
});

test("if launcher throws errors on invalid strategy name submission", async (t) => {
  const message0 = { type: "extraction", name: "non-existent" };
  const message1 = { type: "extraction", name: "non-existent" };
  const worker = "worker";
  const extractors = [{ module: null, name: "strategyx" }];
  const transformers = [{ module: null, name: "strategyy" }];
  await t.throwsAsync(async () => await route(message0, worker, extractors), {
    instanceOf: NotFoundError,
  });
  await t.throwsAsync(
    async () => await route(message1, worker, extractors, transformers),
    {
      instanceOf: NotFoundError,
    }
  );
});

test("if lifecycle launcher throws on incorrect message", async (t) => {
  const worker = "worker";
  const message = {
    type: "extraction",
  };
  const router = async () => t.fail();
  await t.throwsAsync(async () => (await launch(worker, router))(message), {
    instanceOf: ValidationError,
  });
});

test("if lifecycle launcher can handle routing message", async (t) => {
  const worker = "worker";
  const message = {
    type: "extraction",
    version: "0.0.1",
    name: "web3subgraph",
    state: null,
    results: null,
    error: null,
  };
  t.plan(5);
  const router = async (...args) => {
    t.truthy(args);
    const [routerMessage, routerWorker, extractors, transformers] = args;
    t.deepEqual(routerMessage, message);
    t.is(routerWorker, worker);
    t.truthy(extractors);
    t.truthy(transformers);
  };
  await (
    await launch(worker, router)
  )(message);
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
