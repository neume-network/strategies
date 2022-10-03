//@format
import test from "ava";

import { onLine } from "../../../src/strategies/zora-drops-filter-contracts/transformer.mjs";

const dropsFactoryAddress =
  "0x000000000000000000000000f74b146ce44cc162b601dec3be331784db111dc1";
const createEventSelector =
  "0xad59ebba8bfb06ba01a615a611467ca3bef86a275bd5e9704d3b295112550ba5";

const dummyAddress =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
const dummyTopics = [createEventSelector, dummyAddress, dummyAddress];

const genLog = ({ address = dropsFactoryAddress, topics = dummyTopics }) => {
  return {
    address,
    topics,
    data: "0x0000000000000000000000000000000000000000000000000000000000000001",
    blockNumber: "0xEE507D",
    transactionHash:
      "0x0x5051986fe20110d6a9cc1705af48993bf435700f28e23dc85130f4808e7BOGUS",
    transactionIndex: "0x123",
    blockHash:
      "0x0036bcde6797dfa4f77a0e72b928d6ced6f8858e6b0025c8b837e02081aBOGUS",
    logIndex: "0x123",
    removed: false,
  };
};

test("if zora-drops-filter-contracts transformer emits new edition contract address", (t) => {
  const creator =
    "0x000000000000000000000000cfbf34d385ea2d5eb947063b67ea226dcda3dc38";
  const editionContractAddress =
    "0x0000000000000000000000005ba2cae53603fc0e533fc19765ad09e2dc414de6";
  const editionContractAddressDec =
    "0x5ba2cae53603fc0e533fc19765ad09e2dc414de6";

  const snapshot = [
    genLog({ topics: [createEventSelector, creator, editionContractAddress] }),
  ];

  const res = onLine(
    JSON.stringify(snapshot),
    dropsFactoryAddress,
    createEventSelector
  );

  t.deepEqual(JSON.parse(res), {
    [editionContractAddressDec]: { name: "zora-drops" },
  });
});

test("if zora-drops-filter-contracts transformer ignores unrelated logs", (t) => {
  const snapshot = [
    // Unrelated factory address
    genLog({ address: dummyAddress }),

    // unrelated event topic
    genLog({
      topics: [
        "0xf889a5cdc62274389379cbfade0f225b1d30b7395177fd6aeaab61662b1c6edf",
        dummyAddress,
        dummyAddress,
      ],
    }),
  ];

  const res = onLine(
    JSON.stringify(snapshot),
    dropsFactoryAddress,
    createEventSelector
  );

  t.is(res, "");
});
