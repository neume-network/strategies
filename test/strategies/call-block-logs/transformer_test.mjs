//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/call-block-logs/transformer.mjs";

const snapshot0 = [
  {
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
  },
  {
    address: "0x0bc2a24ce568dad89691116d5b34deb6c203f342",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000008a5847fd0e592b058c026c5fdc322aee834b87f5",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    ],
    data: "0x",
    blockNumber: "0xdf09d6",
    transactionHash:
      "0x15688480a318ba0c14a6462466a9ed000dd70212b16cf669b627c3eaea5ee4ca",
    transactionIndex: "0x4a",
    blockHash:
      "0x1ed9bcf2a42169b8afd1cb167c0973b96ec0280fcd077870d185257a2fd38e7a",
    logIndex: "0x8f",
    removed: false,
  },
  // NOTE: This is sound's dynamically artist creation event that signals a new
  // contract minting NFTs.
  {
    address: "0x78e3adc0e811e4f93bd9f1f9389b923c9a3355c2",
    topics: [
      "0x23748b43b77f98380e738976c6324996908ffc1989994dd3c68631c87a65a7c0",
      "0x000000000000000000000000ca13eaa6135d719e743ffebb5c26de4ce2f9600c",
    ],
    data: "0x000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000054c7972616800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000054c59524148000000000000000000000000000000000000000000000000000000",
    blockNumber: "0xd8181a",
    transactionHash:
      "0xa6be9ed8486405e333ed894027f60f7c10596765fc8416fb2c7e6ede4b665f4f",
    transactionIndex: "0x145",
    blockHash:
      "0x61fcb45454ea96e4e38ca65dd0eeb286c6469c639a9859d49c3569f42d9e0e3d",
    logIndex: "0x1e1",
    removed: false,
  },
  {
    address: "0xf5819e27b9bad9f97c177bf007c1f96f26d91ca6",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x000000000000000000000000a55eb4c0b31d29a9b1546434340d3667891c8269",
      "0x0000000000000000000000000000000000000000000000000000000000000028",
    ],
    data: "0x",
    blockNumber: "0xdecf9a",
    transactionHash:
      "0x85496568ab90ac589046d89f5b25ac2739535a2dd146e92a5858ba7deee80296",
    transactionIndex: "0xd3",
    blockHash:
      "0x0d934cccf744744d085b05ab47b09d18ec9bde35aea59b3ac7697fd45e026437",
    logIndex: "0x1f7",
    removed: false,
  },
  {
    address: "0x2b5426a5b98a3e366230eba9f95a24f09ae4a584",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000a7c3007f2156ff8db9579efb7adbbd7212d3c3c",
      "0x0000000000000000000000000000000000000000000000000000000000000012",
    ],
    data: "0x",
    blockNumber: "0xe26632",
    transactionHash:
      "0x922fa24135d2d38aea91b43b2d7334063bff3e98a4e63f666a0db1e446f2963c",
    transactionIndex: "0xd6",
    blockHash:
      "0x06df1e74fcbf6b4fa7300aa7a46613021ee46beeac6531374b5f63372857438f",
    logIndex: "0x123",
    removed: false,
  },
];

const snapshot1 = [
  {
    address: "0xca13eaa6135d719e743ffebb5c26de4ce2f9600c",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x000000000000000000000000e0a2be49bd99e54d3a4c376c4742ca3f5ddc513b",
      "0x0000000000000000000000000000000200000000000000000000000000000032",
    ],
    data: "0x",
    blockNumber: "0xe12cf7",
    transactionHash:
      "0x963e9bfc038f87742cc6cd300b178fb8bd33fd6c2de5ee12b37081d23c16af73",
    transactionIndex: "0xd6",
    blockHash:
      "0xcadfb0313b36ce1b5f933d1111a9203638a1784726e3901b1738bb7a44d98476",
    logIndex: "0x123",
    removed: false,
  },
];

test("call-block-logs transformer", (t) => {
  const res0 = onLine(JSON.stringify(snapshot0));
  const res1 = onLine(JSON.stringify(snapshot1));

  t.truthy(res0.write);
  t.truthy(res1.write);
  const parsed = [...JSON.parse(res0.write), ...JSON.parse(res1.write)];
  t.plan(parsed.length * 6 + 5);
  t.is(parsed.length, 5);
  t.is(parsed[4].log.address, "0xca13eaa6135d719e743ffebb5c26de4ce2f9600c");
  t.is(parsed[4].metadata.platform.name, "sound");
  for (let { metadata, log } of parsed) {
    t.truthy(metadata.platform);
    t.truthy(metadata.platform.name);
    t.truthy(log.address);
    t.truthy(log.topics);
    t.is(
      log.topics[0],
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    );
    t.is(
      log.topics[1],
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
  }
});
