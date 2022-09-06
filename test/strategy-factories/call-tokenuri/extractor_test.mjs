// @format
import fs from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import test from "ava";

import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";
import { callTokenUriFactory } from "../../../src/strategy-factories/call-tokenuri/extractor.mjs";

test("call-tokenuri extractor using mintsongs", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    await fs.readFile(resolve(__dirname, "./extractor_snapshot.json"))
  );

  snapshot.inputs[0] = resolve(__dirname, snapshot.inputs[0]);

  const version = "0.0.1";
  const name = "mintsongs-call-tokenuri";
  const props = {
    version,
    strategyName: name,
    signature: {
      name: "tokenURI",
      type: "function",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
        },
      ],
    },
    filterFunc: ({ address }) =>
      address === "0x2b5426a5b98a3e366230eba9f95a24f09ae4a584",
  };

  const extractor = callTokenUriFactory(props);
  extractor.name = name;

  const result = await snapshotExtractor(extractor, snapshot);
  t.deepEqual(JSON.parse(result), JSON.parse(snapshot.expect.write));
});

test("if call-tokenuri factory can gracefully shutdown if source file doesn't exist", async (t) => {
  const name = "test name";
  const { init, update } = callTokenUriFactory(name);
  const sourcePath = "non-existent";
  const result = await init(sourcePath);
  t.deepEqual(result, { write: "", messages: [] });
});
