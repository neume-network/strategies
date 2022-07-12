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

function callBlockLogs(number, end) {
  number = toHex(number);
  return {
    type: "json-rpc",
    commissioner: name,
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
  return {
    write: null,
    messages: [callBlockLogs(start, end)],
  };
}

export function update(message) {
  const { fromBlock, toBlock } = message.params[0];
  const { end } = message.metadata;
  assert(
    fromBlock === toBlock,
    `"fromBlock" "${fromBlock}" and "toBlock" "${toBlock}" must be equal`
  );
  if (fromBlock >= end) {
    return {
      messages: [],
      write: JSON.stringify(message.results),
    };
  } else {
    const number = parseInt(fromBlock, 16) + 1;
    return {
      messages: [callBlockLogs(number, message.metadata.end)],
      write: JSON.stringify(message.results),
    };
  }
}
