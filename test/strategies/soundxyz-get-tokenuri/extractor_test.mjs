// @format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

import * as soundxyz from "../../../src/strategies/soundxyz-get-tokenuri/extractor.mjs";

test("soundxyz-get-tokenuri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(soundxyz, snapshot);
  t.is(result, snapshot.expect.write);
});

test("if soundxyz-get-tokenuri can gracefully shut down if no data is available to process", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = "non-existent-file";

  const result = await snapshotExtractor(soundxyz, snapshot);
  t.is(result, "");
});
