// @format
import fs from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";
import * as extractor from "../../../src/strategies/sound-protocol-call-tokenuri/extractor.mjs";

test("sound-protocol-call-tokenuri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(extractor, snapshot);
  t.deepEqual(JSON.parse(result), JSON.parse(snapshot.expect.write));
});
