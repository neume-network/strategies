// @format
import fs from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

import * as catalog from "../../../src/strategies/catalog-get-tokenuri/extractor.mjs";

test("catalog-get-tokenuri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(catalog, snapshot);
  const pResult = JSON.parse(result);
  const pExpected = JSON.parse(snapshot.expect.write);
  // NOTE: Given different configurations for `env.IPFS_HTTP_GATEWAY` the
  // tokenURI may be different from instance to instance, and will fail a
  // direct comparison in tests. Hence we just check if the `tokenURI` is
  // indeed present but otherwise ignore its value check.
  t.truthy(pResult.metadata.tokenURI);
  t.truthy(pExpected.metadata.tokenURI);
  delete pResult.metadata.tokenURI;
  delete pExpected.metadata.tokenURI;
  t.deepEqual(pResult, pExpected);
});
