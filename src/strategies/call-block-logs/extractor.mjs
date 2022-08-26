//@format
import { env } from "process";
import assert from "assert";

import { toHex } from "eth-fun";

const version = "0.0.1";
export const name = "call-block-logs";
export const props = {};
const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

function callBlockLogs(number, end) {
  number = toHex(number);
  return {
    type: "json-rpc",
    method: "eth_getLogs",
    params: [
      {
        fromBlock: number,
        toBlock: number,
      },
    ],
    metadata: {
      end,
    },
    version,
    options,
    results: null,
    error: null,
  };
}

export function init(start = 0, end) {
  const difference = end - start;

  let messages = [];
  for (let i of Array(difference).keys()) {
    messages.push(callBlockLogs(start + i));
  }
  return {
    write: null,
    messages,
  };
}

export function update(message) {
  return {
    messages: [],
    write: JSON.stringify(message.results),
  };
}
