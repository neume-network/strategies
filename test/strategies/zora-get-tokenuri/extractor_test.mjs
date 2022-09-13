// @format
import fs from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

import * as extractor from "../../../src/strategies/zora-get-tokenuri/extractor.mjs";

test("zora-get-tokenuri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const result = await snapshotExtractor(extractor, snapshot);
  // NOTE: The zora-get-tokenuri strategy replaces any kind of IPFS HTTPS
  // gateway with the gateway defined in the .env file.
  const expected = JSON.parse(snapshot.expect.write.lines[0]);
  delete expected.metadata.tokenURI;

  let res = JSON.parse(result);
  t.truthy(res.metadata.tokenURI);
  delete res.metadata.tokenURI;
  t.deepEqual(res, expected);
});

test("if zora-get-tokenuri can gracefully shutdown if no call-tokenuri file is present", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = "non-existent";

  const result = await snapshotExtractor(extractor, snapshot);
  t.is(result, "");
});
