// @format
import { decodeLog } from "eth-fun";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "soundxyz-filter-contracts";
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

function decodeArtistAddress(log) {
  const topics = log.topics;
  topics.shift();
  const result = decodeLog(
    [
      {
        type: "uint256",
        name: "artistId",
      },
      {
        type: "string",
        name: "name",
      },
      {
        type: "string",
        name: "symbol",
      },
      {
        type: "address",
        name: "artistAddress",
        indexed: true,
      },
    ],
    log.data,
    topics
  );
  return result.artistAddress.toLowerCase();
}

export function onLine(line, artistRegistryAddress, createEventSelector) {
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
      log.address === artistRegistryAddress &&
      log.topics[0] === createEventSelector
    ) {
      contracts[decodeArtistAddress(log)] = {
        name: "sound",
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
