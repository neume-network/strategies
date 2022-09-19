// @format
import test from "ava";

import { decodeSolidityHexStringFactory } from "../../../src/strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

test("decode-solidity-hex-string", async (t) => {
  const line = {
    metadata: {
      block: {
        number: 15235699,
      },
      contract: {
        address: "0x2b5426a5b98a3e366230eba9f95a24f09ae4a584",
      },
      tokenId: "135",
    },
    results:
      "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d63586d4d694744716f7457757972414e7a6b387461325a456270424e6932507658366b485633664c583561360000000000000000000000",
  };

  const { onLine } = decodeSolidityHexStringFactory({
    strategyName: "decode-solidity-hex-string-test",
    version: "0.0.1",
    resultKey: "tokenUri",
  });

  const { write } = onLine(JSON.stringify(line));

  const expectedLine = { ...line };
  delete expectedLine.results;
  expectedLine.tokenUri =
    "ipfs://QmcXmMiGDqotWuyrANzk8ta2ZEbpBNi2PvX6kHV3fLX5a6";

  t.deepEqual(JSON.parse(write), expectedLine);
});
