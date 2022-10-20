// @format
import fs from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

import * as callTransactionReceipts from "../../../src/strategies/call-transaction-receipts/extractor.mjs";

test("call-transaction-receipts extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);
  snapshot.inputs[1] = "0x0bc2a24ce568dad89691116d5b34deb6c203f342";

  const result = await snapshotExtractor(callTransactionReceipts, snapshot);
  const pResult = JSON.parse(result);
  t.is(pResult.to, snapshot.inputs[1]);
  t.deepEqual(pResult, JSON.parse(snapshot.expect.write));
});
