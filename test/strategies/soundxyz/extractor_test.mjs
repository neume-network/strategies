// @format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";
import * as extractor from "../../../src/strategies/soundxyz/extractor.mjs";

test("soundxyzextractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(extractor, snapshot);
  t.is(result, snapshot.expect.write);
});
