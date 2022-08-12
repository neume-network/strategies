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

  t.plan(write.length * 4 + 1);
  t.is(write.length, 3);
  for (let log of write) {
    t.truthy(log.address);
    t.truthy(log.createdAtBlockNumber);
    t.truthy(log.platform);
    t.truthy(log.tokenId);
  }
});
