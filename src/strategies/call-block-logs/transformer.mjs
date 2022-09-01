// @format
import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "call-block-logs";
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

export function onLine(line, filterFn, mapFn) {
  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    log(err.toString());
    return {
      write: null,
      messages: [],
    };
  }

  logs = logs.filter(filterFn).map(mapFn);

  let write = "";
  if (logs.length) {
    write = JSON.stringify(logs);
  }
  return {
    write,
    messages: [],
  };
}
