//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import EventEmitter from "events";
import test from "ava";

import { loadStrategies } from "../src/disc.mjs";
import { extract, lineReader, setupFinder } from "../src/lifecycle.mjs";
import {
  ValidationError,
  NotFoundError,
  NotImplementedError,
} from "../src/errors.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

class Worker extends EventEmitter {
  postMessage(message) {
    return router.emit(`${message.commissioner}-extraction`);
  }
}

const worker = new Worker();
const router = new EventEmitter();

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
  const lineHandlerMock = (line) => {
    if (count === 0) t.is(line, "line0");
    if (count === 1) t.is(line, "line1");
    count++;
    return { write: "hello world", messages: [] };
  };
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy &&
      strategy.module &&
      strategy.module.name === "soundxyz-call-tokenuri"
  );
  const strategy = { ...strategies[0].module, onLine: lineHandlerMock };
  await lineReader(path, strategy);
  t.is(count, 2);
});

test("applying transformation strategies to a file", async (t) => {
  const dataPath = resolve(__dirname, "./fixtures/file1.data");
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy &&
      strategy.module &&
      strategy.module.name === "soundxyz-call-tokenuri"
  );
  await lineReader(dataPath, strategies[0].module);
  t.pass();
});

test("loading strategies", async (t) => {
  const pathTip = "../test/fixtures/strategies";
  const fileName = "extractor.mjs";
  const strategies = await loadStrategies(pathTip, fileName);
  t.is(strategies.length, 1);
  t.truthy(strategies);
});

test("if extract() resolves the promise and removes the listener on no new messages", async (t) => {
  const mockMessage = {
    type: "https",
    commissioner: "mockMessage",
    options: {},
  };

  const mockStrategy = {
    module: {
      name: mockMessage.commissioner,
      init: () => {
        return { messages: [mockMessage], write: null };
      },
      update: () => {
        return { messages: [], write: null };
      },
    },
  };

  await extract(mockStrategy, worker, router);
  t.deepEqual(router.eventNames(), []);
  t.pass();
});

test("if extract() resolves the promise and removes the listener on no message from init", async (t) => {
  const mockStrategy = {
    module: {
      name: "mock",
      init: () => {
        return { messages: [], write: null };
      },
      update: () => {
        return { messages: [], write: null };
      },
    },
  };

  await extract(mockStrategy, worker, router);
  t.deepEqual(router.eventNames(), []);
  t.pass();
});
