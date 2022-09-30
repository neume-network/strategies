// @format
import { readFileSync } from "fs";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "logs-to-subgraph";
const log = logger(name);

export function onClose() {
  log("closed");
  return {
    write: null,
    messages: [],
  };
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line) {
  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    return {
      write: null,
      messages: [],
    };
  }

  logs = logs.map(({ metadata, log }) => ({
    address: log.address,
    tokenId: `${BigInt(log.topics[3]).toString(10)}`,
    createdAtBlockNumber: parseInt(log.blockNumber, 16),
    platform: metadata.platform,
    transactionHash: log.transactionHash,
  }));

  let write;
  if (logs.length) {
    write = JSON.stringify(logs);
  }
  return {
    write,
    messages: [],
  };
}
