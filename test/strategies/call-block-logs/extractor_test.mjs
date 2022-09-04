// @format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { env } from "process";

import test from "ava";

import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";
import * as blockLogs from "../../../src/strategies/call-block-logs/extractor.mjs";

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

test("if call-block-logs update throws when start block is bigger than network's latest block number", async (t) => {
  const { write, messages } = blockLogs.update({
    type: "json-rpc",
    commissioner: "call-block-logs",
    method: "eth_blockNumber",
    params: [],
    metadata: { start: 99999999, end: 100000000 },
    version: "0.0.1",
    options,
    results: "0xeb2207",
    error: null,
  });
  t.is(messages[0].type, "exit");
});

test("if call-block-logs adjusts end block number when start block is in range of network", async (t) => {
  const { write, messages } = blockLogs.update({
    type: "json-rpc",
    commissioner: "call-block-logs",
    method: "eth_blockNumber",
    params: [],
    metadata: { start: 15409670, end: 100000000 },
    version: "0.0.1",
    options,
    results: "0xeb2207",
    error: null,
  });
  t.is(messages[0].method, "eth_getLogs");
  t.is(messages[0].params[0].fromBlock, "0xeb2206");
});

// NOTE: Since we now use `init` to first download the network's current block,
// it seems `snapshotExtractor` isn't capable of waiting a number of messages
// before return the results.
test.skip("call-block-logs extractor", async (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  const filePath = resolve(__dirname, snapshot.inputs[0]);
  const content = JSON.parse(fs.readFileSync(filePath).toString());
  snapshot.inputs = content;

  const result = await snapshotExtractor(blockLogs, snapshot);
  t.deepEqual(JSON.parse(result), JSON.parse(snapshot.expect.write));
});
