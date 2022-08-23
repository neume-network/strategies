// @format
import { Keccak } from "sha3";
import { decodeLog } from "eth-fun";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "call-block-logs";
const log = logger(name);
export const version = "0.1.0";
const keccak256 = new Keccak(256);

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

const contracts = {
  "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7": {
    name: "zora",
  },
  "0x78e3adc0e811e4f93bd9f1f9389b923c9a3355c2": {
    name: "sound",
  },
  "0x0bc2a24ce568dad89691116d5b34deb6c203f342": {
    name: "catalog",
    version: "2.0.0",
  },
  "0xf5819e27b9bad9f97c177bf007c1f96f26d91ca6": {
    name: "noizd",
  },
  "0x2b5426a5b98a3e366230eba9f95a24f09ae4a584": {
    name: "mintsongs",
    version: "2.0.0",
  },
};

const events = [
  "CreatedArtist(uint256,string,string,address)",
  "Transfer(address,address,uint256)",
];

/*
TODO: We need to allow adding new events and contracts dynamically to the
filtering process. E.g. a platform like sound emits a `CreatedArtist` event and
from thatpoint on all following events should be checked for a new event too.

*/

// NOTE: Logs feature only lowercase addresses
Object.keys(contracts).forEach((contract) => {
  if (contract !== contract.toLowerCase()) {
    throw new Error("Contract address must be lower key");
  }
});

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

const emptyB32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function onLine(line) {
  const selectors = events.map((evt) => {
    keccak256.reset();
    keccak256.update(evt);
    return `0x${keccak256.digest("hex")}`;
  });
  const addresses = Object.keys(contracts);

  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    return {
      write: null,
      messages: [],
    };
  }
  logs = logs.filter((log) => {
    // NOTE: For sound's CreatedArtist, we're extracting the artist's address
    // and then monitor all of that contract's mint events.
    if (log.address === "0x78e3adc0e811e4f93bd9f1f9389b923c9a3355c2") {
      addresses.push(decodeArtistAddress(log));
      return false;
    }
    return (
      log.topics[0] ===
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
      log.topics[1] === emptyB32 &&
      addresses.includes(log.address)
    );
  });

  let write;
  if (logs.length) {
    write = JSON.stringify(logs);
  }
  return {
    write,
    messages: [],
  };
}
