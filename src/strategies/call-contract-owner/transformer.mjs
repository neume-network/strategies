// @format
import { decodeParameters } from "eth-fun";

import logger from "../../logger.mjs";

export const name = "call-contract-owner";
const log = logger(name);

export function onClose() {
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line) {
  let obj;

  try {
    obj = JSON.parse(line);
  } catch (err) {
    log(err.toString());
    return;
  }

  let decodedOutput;
  try {
    [decodedOutput] = decodeParameters(["address"], obj.results);
  } catch (err) {
    log(err.toString());
    return;
  }
  return JSON.stringify({
    metadata: obj.metadata,
    owner: decodedOutput,
  });
}
