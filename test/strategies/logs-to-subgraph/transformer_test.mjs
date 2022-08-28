//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/logs-to-subgraph/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const line =
  '[{"address":"0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x0000000000000000000000000000000000000000000000000000000000000000","0x000000000000000000000000f0dd6582e6e1a6a1e195fd74bef56b4327cd81c1","0x0000000000000000000000000000000000000000000000000000000000001d0d"],"data":"0x","blockNumber":"0xd5b504","transactionHash":"0x578e40828fa70d7bcb95df6ac42ea5d4367729daac34faa5d8aba839e8196fcc","transactionIndex":"0x45","blockHash":"0x4d9237aeaa30879232afeea1c33a123dfccc7bb0c99a91d4b0955fb93f2fb26a","logIndex":"0x73","removed":false},{"address":"0x0bc2a24ce568dad89691116d5b34deb6c203f342","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000008a5847fd0e592b058c026c5fdc322aee834b87f5","0x0000000000000000000000000000000000000000000000000000000000000001"],"data":"0x","blockNumber":"0xdf09d6","transactionHash":"0x15688480a318ba0c14a6462466a9ed000dd70212b16cf669b627c3eaea5ee4ca","transactionIndex":"0x4a","blockHash":"0x1ed9bcf2a42169b8afd1cb167c0973b96ec0280fcd077870d185257a2fd38e7a","logIndex":"0x8f","removed":false},{"address":"0xca13eaa6135d719e743ffebb5c26de4ce2f9600c","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x0000000000000000000000000000000000000000000000000000000000000000","0x000000000000000000000000e0a2be49bd99e54d3a4c376c4742ca3f5ddc513b","0x0000000000000000000000000000000200000000000000000000000000000032"],"data":"0x","blockNumber":"0xe12cf7","transactionHash":"0x963e9bfc038f87742cc6cd300b178fb8bd33fd6c2de5ee12b37081d23c16af73","transactionIndex":"0xd6","blockHash":"0xcadfb0313b36ce1b5f933d1111a9203638a1784726e3901b1738bb7a44d98476","logIndex":"0x123","removed":false}]';

test("soundxyz-call-tokenuri transformer", (t) => {
  const { write } = onLine(line, resolve(__dirname, "./contracts"));
  const expected = [
    {
      address: "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7",
      tokenId: "7437",
      createdAtBlockNumber: "14005508",
      platform: "zora",
    },
    {
      address: "0x0bc2a24ce568dad89691116d5b34deb6c203f342",
      tokenId: "1",
      createdAtBlockNumber: "14617046",
      platform: "catalog",
    },
    {
      address: "0xca13eaa6135d719e743ffebb5c26de4ce2f9600c",
      tokenId: "680564733841876926926749214863536422962",
      createdAtBlockNumber: "14757111",
      platform: "sound",
    },
  ];
  t.is(write, JSON.stringify(expected));
});
