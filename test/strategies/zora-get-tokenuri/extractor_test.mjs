// @format
import { env } from "process";
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
  // NOTE: The zora-get-tokenuri strategy replaces any kind of IPFS HTTPS
  // gateway with the gateway defined in the .env file.
  const expected = JSON.parse(snapshot.expect.write.lines[0]);
  delete expected.metadata.tokenURI;

  let [res1, res2] = result.split("\n");
  res1 = JSON.parse(res1);
  t.truthy(res1.metadata.tokenURI);
  delete res1.metadata.tokenURI;
  res2 = JSON.parse(res2);
  t.truthy(res2.metadata.tokenURI);
  delete res2.metadata.tokenURI;
  t.deepEqual(res1, expected);
});
