//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/soundxyz-call-tokenuri/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = JSON.parse(
  fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
);

test("soundxyz-call-tokenuri transformer", (t) => {
  const { write } = onLine(snapshot.expect.write);
  const expected = {
    metadata: {
      block: { number: "13493464" },
      contract: { address: "0xf5819e27b9bad9f97c177bf007c1f96f26d91ca6" },
      tokenId: "0",
    },
    tokenURI: "ipfs://QmUkHiRMC2wvNWef6Z1Lx522JPcLx2sBmavsPgbLVsPpxH",
  };
  t.is(write, JSON.stringify(expected));
});
