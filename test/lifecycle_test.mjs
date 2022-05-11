//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { transformation, loadStrategies } from "../src/lifecycle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("interface compliance of transformer strategies", async (t) => {
  const transformers = await loadStrategies("./strategies", "transformer.mjs");
  t.truthy(transformers);
  t.plan(transformers.length + 1);
  for (const transformer of transformers) {
    t.is(typeof transformer.module.transform, "function");
  }
});

test("interface compliance of extractors strategies", async (t) => {
  const extractors = await loadStrategies("./strategies", "extractor.mjs");
  t.truthy(extractors);
  t.plan(extractors.length * 3 + 1);
  for (const extractor of extractors) {
    t.is(typeof extractor.module.init, "function");
    t.is(typeof extractor.module.update, "function");
    t.is(typeof extractor.module.props, "object");
  }
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
  await transformation.lineReader(path, onLineHandler);
  t.is(count, 2);
});

test("applying transformation strategies to a file", async (t) => {
  const dataPath = resolve(__dirname, "./fixtures/file1.data");
  const strategies = await loadStrategies("./strategies", "transformer.mjs");
  const onLineHandler = transformation.applyOnLine(strategies);
  t.plan(2);
  const onLineHandlerProxy = (line) => {
    const result = onLineHandler(line);
    t.truthy(result);
  };
  await transformation.lineReader(dataPath, onLineHandlerProxy);
});

test("loading strategies", async (t) => {
  const pathTip = "../test/fixtures/strategies";
  const fileName = "extractor.mjs";
  const strategies = await loadStrategies(pathTip, fileName);
  t.is(strategies.length, 1);
  t.truthy(strategies);
});
