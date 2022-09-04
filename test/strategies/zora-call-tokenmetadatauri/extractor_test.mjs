// @format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";
import * as zora from "../../../src/strategies/zora-call-tokenmetadatauri/extractor.mjs";

test("zora-call-tokenmetadatauri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(zora, snapshot);
  t.deepEqual(JSON.parse(result), JSON.parse(snapshot.expect.write));
});
