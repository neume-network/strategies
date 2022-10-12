//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/sound-protocol-call-tokenuri/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = JSON.parse(
  fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
);

test("sound-protocol-call-tokenuri transformer", (t) => {
  const write = onLine(snapshot.expect.write);
  const expected = {
    metadata: {
      block: {
        number: 15665995,
      },
      contract: { address: "0xf0701a661363f463c8de5bd6b009c0e9ceaba51a" },
      tokenId: "1",
    },
    tokenURI: "ar://-bLbFg-u3BraSe7oQ90IbW3603C7VCSkS4LomfFR5V0/1",
  };
  t.is(write, JSON.stringify(expected));
});
