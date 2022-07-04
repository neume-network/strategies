import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

import * as web3Extractor from "../../../src/strategies/web3subgraph/extractor.mjs";

test("web3subgraph extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  const result = await snapshotExtractor(web3Extractor, snapshot);
  t.plan(snapshot.expect.write.length);
  for (const assertion in snapshot.expect.write) {
    t.true(result.includes(assertion));
  }
});
