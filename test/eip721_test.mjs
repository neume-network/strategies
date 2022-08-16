// @format
import test from "ava";

import { toEIP721 } from "../src/eip721.mjs";

test("if event log can be transformed to EIP721", (t) => {
  const log = {
    address: "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x000000000000000000000000f0dd6582e6e1a6a1e195fd74bef56b4327cd81c1",
      "0x0000000000000000000000000000000000000000000000000000000000001d0d",
    ],
    data: "0x",
    blockNumber: "0xd5b504",
    transactionHash:
      "0x578e40828fa70d7bcb95df6ac42ea5d4367729daac34faa5d8aba839e8196fcc",
    transactionIndex: "0x45",
    blockHash:
      "0x4d9237aeaa30879232afeea1c33a123dfccc7bb0c99a91d4b0955fb93f2fb26a",
    logIndex: "0x73",
    removed: false,
  };

  const eip721 = toEIP721(log);
  t.log(eip721);
});
