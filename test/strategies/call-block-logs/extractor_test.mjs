// @format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";
import * as blockLogs from "../../../src/strategies/call-block-logs/extractor.mjs";

test("call-block-logs extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  const filePath = resolve(__dirname, snapshot.inputs[0]);
  const content = JSON.parse(fs.readFileSync(filePath).toString());
  snapshot.inputs = content;

  const result = await snapshotExtractor(blockLogs, snapshot);
  t.is(result, snapshot.expect.write);
});
