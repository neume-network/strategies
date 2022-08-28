// @format
import { Keccak } from "sha3";
import fs from "fs";

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

/*
TODO: We need to allow adding new events and contracts dynamically to the
filtering process. E.g. a platform like sound emits a `CreatedArtist` event and
from thatpoint on all following events should be checked for a new event too.

*/

let validatedContracts;

const emptyB32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function onLine(line, contractsPath, events) {
  const contracts = JSON.parse(fs.readFileSync(contractsPath));

  // Checking only once because contractsPath will be same for each line
  if (!validatedContracts) {
    // NOTE: Logs feature only lowercase addresses
    Object.keys(contracts).forEach((contract) => {
      if (contract !== contract.toLowerCase()) {
        log("Contract address must be lower key");
        return {
          write: null,
          messages: [{ type: "exit" }],
        };
      }
    });
    validatedContracts = true;
  }

  const selectors = events.map((evt) => {
    keccak256.reset();
    keccak256.update(evt);
    return `0x${keccak256.digest("hex")}`;
  });

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
    return (
      contracts[log.address] &&
      selectors.includes(log.topics[0]) &&
      log.topics[1] === emptyB32 // TODO: make this dynamic
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
