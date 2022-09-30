//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/call-contract-owner/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = JSON.parse(
  fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
);

test("call-contract-owner transformer", (t) => {
  const write = onLine(snapshot.expect.write);
  const expected = {
    metadata: {
      block: {
        number: 14323199,
      },
      contract: { address: "0x01ab7d30525e4f3010af27a003180463a6c811a6" },
    },
    owner: "0x92526B99715AFeEd324Fb56EcAFcac8056379300",
  };
  t.is(write, JSON.stringify(expected));
});
