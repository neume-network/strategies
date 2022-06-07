//@format
import test from "ava";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { track } from "@neume-network/schema";

import { onLine } from "../../../src/strategies/catalog-get-tokenuri/transformer.mjs";

const ajv = new Ajv();
addFormats(ajv);
const payload = {
  body: {
    artist: "MONDAY!",
    artwork: {
      info: {
        mimeType: "image/jpeg",
        uri: "https://ipfs.io/ipfs/bafybeihellebhoincjnokmu4idcdyybeztgyqzrftsbb6oxcagw5yh6qbq",
      },
      isNft: false,
      nft: null,
    },
    duration: 98.064,
    mimeType: "audio/wav",
    notes:
      "Written & Recorded by MONDAY! @musebymonday\r\nProduced & Mixed by BlackDave @blackdave\r\nMixed & Mastered by Elliott Elsey\r\nArt by @shawntelco",
    project: null,
    title: "Red Eye",
    trackNumber: null,
    version: "catalog-20210202",
    visualizer: null,
  },
  origin: {
    algorithm: "secp256k1",
    encoding: "rlp",
    signature:
      "0x8fbe340bc7d801a7812127dee65a3ed1adb6588318a9ba362f77607404e40c1d6579cd130924089b5f746aef221bc407d60668392ce7bc9d023c0a2f48d9e1fe1b",
    publicKey: "0xc236541380fc0C2C05c2F2c6c52a21ED57c37952",
  },
};
const sPayload = JSON.stringify(payload);

test("catalog transformer", (t) => {
  const { write } = onLine(sPayload);
  const validate = ajv.compile(track);
  const valid = validate(JSON.parse(write));
  t.is(validate.errors.length, 1);
  // NOTE: catalog-get-tokenuri implements neume-network/schema only partially
  // at this point, so we can't expect it to pass validation. Instead, we're
  // expecting errors to be thrown.
  t.is(validate.errors[0].params.missingProperty, "address");
});
