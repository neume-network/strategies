import { createInterface } from "readline";
import { createReadStream } from "fs";
import { env } from "process";

const version = "0.0.1";
export const name = "call-transaction-receipts";
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

function makeRequest({ log }) {
  const from = null;
  return {
    type: "json-rpc",
    options,
    version,
    method: "eth_getTransactionReceipt",
    params: [log.transactionHash, log.blockNumber],
  };
}

// `filePath` must point to a call-block-logs-transformation file
// `address` is one Ethereum address that the logs are filtered by. It's
// optional.
export async function init(filePath, address) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let txs = [];
  for await (const line of rl) {
    // NOTE: We're ignoring empty lines
    if (line === "") continue;
    let logs = JSON.parse(line);
    if (address) {
      logs = logs.filter(({ log }) => log.address === address.toLowerCase());
    }

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
