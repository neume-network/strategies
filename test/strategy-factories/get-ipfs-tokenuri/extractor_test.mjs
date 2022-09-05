// @format
import fs from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";

import { getIpfsTokenUriFactory } from "../../../src/strategy-factories/get-ipfs-tokenuri/extractor.mjs";
import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";

test("get-ipfs-tokenuri extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const version = "0.0.1";
  const name = "mintsongs-get-tokenuri";
  const props = { strategyName: name, version, options: {} };

  const extractor = getIpfsTokenUriFactory(props);
  extractor.name = name;

  const result = JSON.parse(await snapshotExtractor(extractor, snapshot));
  t.truthy(result.metadata.tokenURI);
  // NOTE: The get-ipfs-tokenuri strategy replaces any kind of IPFS HTTPS
  // gateway with the gateway defined in the .env file.
  delete result.metadata.tokenURI;

  const expected = JSON.parse(snapshot.expect.write);
  delete expected.metadata.tokenURI;

  t.deepEqual(result, expected);
});
