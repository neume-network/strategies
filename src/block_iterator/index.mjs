// @format
import { toHex } from "eth-fun";
import { exit, env } from "process";

// TODO: These options must be globally definable and then we should pass around
// a config.
const options = {
  url: env.RPC_HTTP_HOST,
};
const version = "0.0.1";

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

let worker, logger;

function hexadd(number, value) {
  return toHex(parseInt(number, 16) + value);
}

function handle(message) {
  const { method, params, results } = message;
  console.log(results);

  if (method === "eth_getBlockByNumber") {
    if (results === null) {
      console.log("caught up");
      exit(0);
    }
    const [blockNumber] = params;
    const nextBlockNumber = hexadd(blockNumber, 1);
    worker.postMessage(blockNumberMsg(nextBlockNumber));

    const { transactions } = results;
    transactions.forEach((txId) => worker.postMessage(txReceiptMsg(txId)));
  }
}

function txReceiptMsg(txId) {
  return {
    options,
    version,
    type: "json-rpc",
    method: "eth_getTransactionReceipt",
    params: [txId],
    results: null,
  };
}

function blockNumberMsg(blockNumber) {
  const includeTxBodies = false;
  return {
    options,
    version,
    type: "json-rpc",
    method: "eth_getBlockByNumber",
    params: [blockNumber, includeTxBodies],
    results: null,
  };
}

// TODO: Add json schema for this options object
export function run(inputs, logger) {
  logger("Start block_iterator strategy");
  worker = inputs.worker;
  logger = logger;
  const message0 = blockNumberMsg(inputs.startBlock);
  worker.postMessage(message0);
  worker.on("message", handle);
}
