//@format
import { env } from "process";
import { readFile } from "fs/promises";
import assert from "assert";

import { toHex } from "eth-fun";

import logger from "../../logger.mjs";
import { eth_blockNumberSchema, eth_getLogsSchema } from "./schemas.mjs";

const version = "0.0.1";
export const name = "call-block-logs";
const log = logger(name);
const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

function blockNumber(start, end) {
  return {
    type: "json-rpc",
    method: "eth_blockNumber",
    params: [],
    metadata: {
      start,
      end,
    },
    version,
    options,
    schema: eth_blockNumberSchema,
  };
}

function callBlockLogs(number) {
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
    version,
    options,
    schema: eth_getLogsSchema,
  };
}

function generateMessages(start, end) {
  const difference = end - start;

  let messages = [];
  for (let i of Array(difference).keys()) {
    messages.push(callBlockLogs(start + i));
  }
  return messages;
}

export function init(start = 0, end) {
  if (end < start) {
    log(
      `End (${end}) block number is smaller than start (${start}) block number`
    );
    return {
      write: null,
      messages: [{ type: "exit" }],
    };
  }
  return {
    write: null,
    messages: [blockNumber(start, end)],
  };
}

export function update(message) {
  if (message?.method == "eth_blockNumber") {
    let endBlockNumber = message.metadata.end;
    const latestBlockNumber = parseInt(message.results);
    if (message.metadata.end > latestBlockNumber) {
      log(
        `Submitted end block number "${message.metadata.end}" is bigger than current chain tip block number "${latestBlockNumber}. Setting end block number to latest block number."`
      );
      endBlockNumber = latestBlockNumber;
    }
    if (message.metadata.start > latestBlockNumber) {
      log(
        `Start block number "${message.metadata.start}" is bigger than network's current block number "${latestBlockNumber}"`
      );
      return {
        write: null,
        messages: [{ type: "exit" }],
      };
    }

    return {
      write: null,
      messages: generateMessages(message.metadata.start, endBlockNumber),
    };
  } else {
    return {
      messages: [],
      write: JSON.stringify(message.results),
    };
  }
}
