//@format
import { constants } from "fs";
import { access, unlink } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import {
  loadStrategies,
  toJSON,
  toCSV,
  getdirdirs,
  loadAll,
} from "../src/disc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("interface compliance of transformer strategies", async (t) => {
  const transformers = await loadStrategies("./strategies", "transformer.mjs");
  t.truthy(transformers);
  t.plan(transformers.length * 3 + 1);
  for (const transformer of transformers) {
    t.is(
      typeof transformer.module.onLine,
      "function",
      `Error at ${transformer.module.name} onLine`
    );
    t.is(
      typeof transformer.module.onError,
      "function",
      `Error at ${transformer.module.name} onError`
    );
    t.is(
      typeof transformer.module.onClose,
      "function",
      `Error at ${transformer.module.name} onClose`
    );
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

test("test loading & validating extractors", async (t) => {
  const path = resolve(__dirname, "../src/strategies");
  const dirs = await getdirdirs(path);
  const extractors = await loadAll(dirs, "extractor.mjs");
  t.truthy(extractors);
  t.plan(extractors.length * 4 + 1);
  for (const extractor of extractors) {
    t.truthy(extractor.module.name);
    t.is(typeof extractor.module.init, "function");
    t.is(typeof extractor.module.update, "function");
    t.is(typeof extractor.module.props, "object");
  }
});

test("reading directory files", async (t) => {
  const path = resolve(__dirname, "../");
  const dirs = await getdirdirs(path);
  t.true(dirs.includes(resolve(path, "src")));
  t.true(dirs.includes(resolve(path, "test")));
  t.false(dirs.includes(resolve(path, "readme.md")));
});

test("transforming to CSV", (t) => {
  const list = [
    { address: "abc", tokenId: "1", tokenURI: "https://example.com" },
    { address: "def", tokenId: "2", tokenURI: "https://example2.com" },
  ];
  const result = toCSV(list);
  t.is("abc,1,https://example.com\ndef,2,https://example2.com", result);
});

test("tranform from original => JSON => CSV", (t) => {
  const addr = "0x881D40237659C251811CEC9c364ef91dC08D300C";
  const list = [`${addr}/1`, `${addr}/2`];
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const result = toCSV(toJSON(list, expr));
  t.is(`${addr},1\n${addr},2`, result);
});

test("transforming to JSON", (t) => {
  const addr = "0x881D40237659C251811CEC9c364ef91dC08D300C";
  const list = [`${addr}/1`, `${addr}/2`];
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const result = toJSON(list, expr);
  t.deepEqual(
    [
      { address: addr, tokenId: "1" },
      { address: addr, tokenId: "2" },
    ],
    result
  );
});
