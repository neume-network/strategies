//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import {
  lineReader,
  loadStrategies,
  route,
  launch,
} from "../src/lifecycle.mjs";
import {
  ValidationError,
  NotFoundError,
  NotImplementedError,
} from "../src/errors.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
