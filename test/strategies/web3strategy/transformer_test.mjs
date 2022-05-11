//@format
import test from "ava";

import { transform } from "../../../src/strategies/web3subgraph/transformer.mjs";

const address = "0x01dbbb64e6f6185ac9923d47e1f9b20dabadd263";
const payload = [{ id: `${address}/0` }, { id: `${address}/1` }];
const sPayload = JSON.stringify(payload);

test("web3subgraph transformer", (t) => {
  const result = transform(sPayload);
  t.is(result.length, 2);
  t.is(result[0].address, address);
  t.is(result[1].address, address);
  t.is(result[0].tokenId, "0");
  t.is(result[1].tokenId, "1");
});
