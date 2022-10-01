// @format
import { decodeLog } from "eth-fun";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "zora-drops-filter-contracts";
const log = logger(name);
export const version = "0.1.0";

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

function decodeDropLog(log) {
  const topics = log.topics;
  topics.shift();
  const result = decodeLog(
    // index_topic_1 address creator, index_topic_2 address editionContractAddress, uint256 editionSize
    [
      {
        type: "address",
        name: "creator",
        indexed: true,
      },
      {
        type: "address",
        name: "editionContractAddress",
        indexed: true,
      },
      {
        type: "uint256",
        name: "editionSize",
      },
    ],
    log.data,
    topics
  );

  if (result) {
    for (const k of ["creator", "editionContractAddress"]) {
      result[k] = result?.[k].toLowerCase?.();
    }
  }

  return result;
}

export function onLine(line, editionsFactoryAddress, createEventSelector) {
  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    log(err);
    return {
      write: "",
      messages: [],
    };
  }
  let contracts = {};
  for (const log of logs) {
    if (
      log.address === editionsFactoryAddress &&
      log.topics[0] === createEventSelector
    ) {
      const { editionContractAddress } = decodeDropLog(log);
      contracts[editionContractAddress] = {
        name: "zora-drops",
      };
    }
  }

  let write;
  if (Object.keys(contracts).length === 0) {
    write = "";
  } else {
    write = JSON.stringify(contracts);
  }
  return {
    write,
    messages: [],
  };
}
