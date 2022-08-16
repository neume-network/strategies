//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/call-block-logs/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = fs
  .readFileSync(resolve(__dirname, "./call-block-logs-extraction"))
  .toString();

test("call-block-logs transformer", (t) => {
  const { write } = onLine(snapshot);

  const parsed = JSON.parse(write);
  t.plan(parsed.length * 2 + 2);
  t.is(typeof write, "string");
  t.is(parsed.length, 3);
  for (let log of parsed) {
    t.truthy(log.address);
    t.truthy(log.topics);
  }
});
