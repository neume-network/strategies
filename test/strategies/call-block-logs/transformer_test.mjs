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
  t.plan(parsed.length * 4 + 2);
  t.is(typeof write, "string");
  t.is(parsed.length, 5);
  for (let log of parsed) {
    t.truthy(log.address);
    t.truthy(log.topics);
    t.is(
      log.topics[0],
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    );
    t.is(
      log.topics[1],
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
  }
});
