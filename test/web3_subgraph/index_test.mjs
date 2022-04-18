//@format
import test from "ava";

import { toCSV, toJSON } from "../../src/web3_subgraph/index.mjs";

test("tranform from original => JSON => CSV", (t) => {
  const list = [{ id: "abc/1" }, { id: "def/2" }];
  const result = toCSV(toJSON(list));
  t.is("abc,1\ndef,2", result);
});

test("transforming to JSON", (t) => {
  const list = [{ id: "abc/1" }, { id: "def/2" }];
  const result = toJSON(list);
  t.deepEqual(
    [
      { address: "abc", tokenId: "1" },
      { address: "def", tokenId: "2" },
    ],
    result
  );
});

test("transforming to CSV", (t) => {
  const list = [
    { address: "abc", tokenId: "1" },
    { address: "def", tokenId: "2" },
  ];
  const result = toCSV(list);
  t.is("abc,1\ndef,2", result);
});
