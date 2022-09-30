// @format
import test from "ava";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { track } from "@neume-network/schema";

import { onLine } from "../../../src/strategies/mintsongs-get-tokenuri/transformer.mjs";

const ajv = new Ajv();
addFormats(ajv);

test("mintsongs-get-tokenuri transformer", async (t) => {
  const payload = {
    metadata: {
      block: { number: 15249235 },
      contract: { address: "0x2b5426a5b98a3e366230eba9f95a24f09ae4a584" },
      tokenId: "136",
      tokenURI:
        "https://ipfs.io/ipfs/QmWLE9wYQEvQ4WJRh8aBN3WYZBHGoCjfCJNKPJyrXhZi2z",
    },
    results: {
      name: "Million Records - Nickobella - True",
      description: "Million Records",
      image: "ipfs://QmZ3kU9LiHCHdzFiT7NxE7tDu3LTubzydZw87sLfEAd3v6",
      version: "0.1",
      title: "Nickobella - True",
      artist: "Million Records",
      duration: 156.134,
      mimeType: "audio/x-wav",
      losslessAudio: "ipfs://QmV7FxZbtj2VmTxE1VtL1c53T2E1kvYTyUWP3kb9GvSTwS",
      trackNumber: 1,
      genre: null,
      tags: [],
      bpm: null,
      key: null,
      license: null,
      locationCreated: null,
      external_url:
        "https://www.mintsongs.com/u/0x7ec53b8ab315eb9d8b2ca7a3544e443552decf4b",
      animation_url: "ipfs://QmV7FxZbtj2VmTxE1VtL1c53T2E1kvYTyUWP3kb9GvSTwS",
      project: {
        title: "Nickobella - True",
        artwork: {
          uri: "ipfs://QmZ3kU9LiHCHdzFiT7NxE7tDu3LTubzydZw87sLfEAd3v6",
          mimeType: "image/jpeg",
          nft: null,
        },
        description: "Million Records",
        type: "Single",
        originalReleaseDate: null,
        recordLabel: null,
        publisher: null,
        upc: null,
      },
      isrc: null,
      artwork: {
        uri: "ipfs://QmZ3kU9LiHCHdzFiT7NxE7tDu3LTubzydZw87sLfEAd3v6",
        mimeType: "image/jpeg",
        nft: null,
      },
      lyrics: { text: null, nft: null },
      visualizer: { uri: null, mimeType: null, nft: null },
      originalReleaseDate: null,
      recordLabel: null,
      publisher: null,
      credits: [{ name: "Million Records", collaboratorType: "creator" }],
      attributes: {
        artist: "Million Records",
        project: null,
        bpm: null,
        key: null,
        genre: null,
        recordLabel: null,
        license: null,
      },
    },
  };

  const write = onLine(JSON.stringify(payload));

  const validate = ajv.compile(track);
  const data = JSON.parse(write);
  const valid = validate(data);

  t.true(valid);
});
