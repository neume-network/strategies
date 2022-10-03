// @format
import { decodeLog } from "eth-fun";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "newsound-filter-contracts";
const log = logger(name);

export function onClose() {
  log("closed");
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

function decodeContractAddress(log) {
  const topics = log.topics;
  topics.shift();
  const result = decodeLog(
    [
      {
        type: "address",
        name: "soundEdition",
        indexed: true,
      },
      {
        type: "address",
        name: "deployer",
        indexed: true,
      },
      {
        type: "bytes",
        name: "initData",
      },
      {
        type: "address[]",
        name: "contracts",
      },
      {
        type: "bytes[]",
        name: "data",
      },
      {
        type: "bytes[]",
        name: "results",
      },
    ],
    log.data,
    topics
  );
  return result.soundEdition.toLowerCase();
}

export function onLine(line, editionCreatedSelector) {
  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    log(err);
    return "";
  }
  let contracts = {};
  for (const log of logs) {
    if (log.topics[0] === editionCreatedSelector) {
      contracts[decodeContractAddress(log)] = {
        name: "newsound",
      };
    }
  }

  if (Object.keys(contracts).length === 0) {
    return "";
  } else {
    return JSON.stringify(contracts);
  }
}
