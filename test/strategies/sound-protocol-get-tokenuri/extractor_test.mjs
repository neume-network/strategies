// @format
import fs from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

import * as soundProtocol from "../../../src/strategies/sound-protocol-get-tokenuri/extractor.mjs";

test("sound-protocol-get-tokenuri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(soundProtocol, snapshot);
  t.deepEqual(JSON.parse(result), JSON.parse(snapshot.expect.write));
});

test("if sound-protocol-get-tokenuri can gracefully shut down if no data is available to process", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = "non-existent-file";

  const result = await snapshotExtractor(soundProtocol, snapshot);
  t.is(result, "");
});
