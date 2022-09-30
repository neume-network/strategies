// @format
import test from "ava";
import { readFileSync } from "fs";
import { resolve } from "path";
import { env } from "process";

import { onLine } from "../../../src/strategies/get-minter/transformer.mjs";

test("get-minter", (t) => {
  const content = readFileSync(
    resolve("test", "strategies", "get-minter", "extractor_snapshot.json")
  ).toString();
  const pContent = JSON.parse(content);
  const { write } = pContent.expect;
  const result = onLine(write);
  const expected =
    '{"transactionHash":"0x578e40828fa70d7bcb95df6ac42ea5d4367729daac34faa5d8aba839e8196fcc","from":"0xf0dd6582e6e1a6a1e195fd74bef56b4327cd81c1"}';
  t.is(result, expected);
});
