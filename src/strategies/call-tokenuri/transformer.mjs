// @format
import { decodeParameters } from "eth-fun";

import logger from "../../logger.mjs";

export const name = "call-tokenuri";
export const version = "0.0.1";

const log = logger(name);

function onClose() {
  return;
}

function onError(error) {
  log(error.toString());
  throw error;
}

function onLine(line, resultKey) {
  let obj;

  try {
    obj = JSON.parse(line);
  } catch (err) {
    log(err.toString());
    return;
  }

  let decodedOutput;
  try {
    [decodedOutput] = decodeParameters(["string"], obj.results);
  } catch (err) {
    log(err.toString());
    return;
  }
  return JSON.stringify({
    metadata: obj.metadata,
    [resultKey]: decodedOutput,
  });
}

export { onClose, onLine, onError };
