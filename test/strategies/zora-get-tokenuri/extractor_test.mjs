// @format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

import * as extractor from "../../../src/strategies/zora-get-tokenuri/extractor.mjs";

test("zora-get-tokenuri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(extractor, snapshot);
  t.true(result.includes(snapshot.expect.write.lines[0]));
  t.true(result.includes(snapshot.expect.write.lines[1]));
});
