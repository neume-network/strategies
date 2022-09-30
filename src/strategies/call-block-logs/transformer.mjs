// @format
import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "call-block-logs";
const log = logger(name);
export const version = "0.1.0";

export function onClose() {
  log("closed");
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

function validate(contracts) {
  Object.keys(contracts).forEach((contract) => {
    if (contract !== contract.toLowerCase()) {
      throw new Error("Contract address must be lower key");
    }
  });
}

const transferEventSelector =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const emptyB32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function onLine(line, contracts) {
  validate(contracts);
  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    log(err.toString());
    return;
  }

  logs = logs
    .filter((log) => {
      return (
        log.topics[0] === transferEventSelector &&
        log.topics[1] === emptyB32 &&
        Object.keys(contracts).includes(log.address)
      );
    })
    .map((log) => ({
      metadata: {
        platform: contracts[log.address],
      },
      log,
    }));

  if (logs.length) {
    return JSON.stringify(logs);
  } else {
    return "";
  }
}
