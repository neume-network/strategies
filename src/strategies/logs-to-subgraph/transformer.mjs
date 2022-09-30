// @format
import { readFileSync } from "fs";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "logs-to-subgraph";
const log = logger(name);

export function onClose() {
  log("closed");
  return;
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
    return;
  }

  const { blockNumber } = logs[0].log;
  if (!blockNumber) {
    throw new Error(`Block number "${blockNumber}" cannot be falsly`);
  }
  if (!logs.every((elem) => elem.log.blockNumber === blockNumber)) {
    throw new Error(
      `Found event log list with inconsistent block numbers. Required number "${blockNumber}"`
    );
  }

  logs = logs.map(({ metadata, log }) => ({
    address: log.address,
    tokenId: `${BigInt(log.topics[3]).toString(10)}`,
    createdAtBlockNumber: parseInt(log.blockNumber, 16),
    platform: metadata.platform,
    transactionHash: log.transactionHash,
  }));

  if (logs.length) {
    return {
      id: `neume://${name}-transformation/eip155:1/blockNumber:${blockNumber}`,
      content: JSON.stringify(logs),
    };
  }
}
