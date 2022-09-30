import { createInterface } from "readline";
import { createReadStream } from "fs";
import { env } from "process";

const version = "0.0.1";
export const name = "get-minter";
import logger from "../../logger.mjs";

const log = logger(name);

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

function makeRequest(log) {
  const from = null;
  return {
    type: "json-rpc",
    options,
    version,
    method: "eth_getTransactionReceipt",
    params: [log.transactionHash, log.blockNumber],
    results: null,
    error: null,
  };
}

export async function init(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let txs = [];
  for await (const line of rl) {
    // NOTE: We're ignoring empty lines
    if (line === "") continue;
    const logs = JSON.parse(line);

    txs = [...txs, ...logs.map(makeRequest)];
  }
  return {
    write: "",
    messages: txs,
  };
}

export function update(message) {
  return {
    write: JSON.stringify(message.results),
    messages: [],
  };
}
