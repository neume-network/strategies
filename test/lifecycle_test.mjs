//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { loadStrategies } from "../src/disc.mjs";
import { check, lineReader, setupFinder } from "../src/lifecycle.mjs";
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
    args: null,
  };
  check(invalidMessage);
  t.pass();
});

test("checking if message throws", (t) => {
  const invalidMessage = { hello: "world" };
  t.throws(() => check(invalidMessage));
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
  const lineHandlerMock = (line) => {
    if (count === 0) t.is(line, "line0");
    if (count === 1) t.is(line, "line1");
    count++;
    return { write: "hello world", messages: [] };
  };
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) => strategy && strategy.name === "soundxyz-call-tokenuri"
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
    (strategy) => strategy && strategy.name === "soundxyz-call-tokenuri"
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
