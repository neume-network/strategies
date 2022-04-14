//@format
import test from "ava";

import { transform } from "../../src/web3_subgraph/index.mjs";

test("writing csv to disk", async (t) => {
  const response = { data: { nfts: [{ id: "abc/1" }, { id: "def/2" }] } };
  const result = transform(response);
  t.is("abc,1\ndef,2", result);
});
