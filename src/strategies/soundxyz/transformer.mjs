// @format
import { decodeCallOutput } from "eth-fun";

import logger from "../../logger.mjs";

const name = "soundxyz";
const log = logger(name);
const version = "0.1.0";

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

export function onLine(line) {
  let tokenURI;
  try {
    [tokenURI] = decodeCallOutput(["string"], line);
  } catch (err) {
    log(err.toString());
    return {
      messages: [],
      write: null,
    };
  }
  return {
    messages: [],
    write: tokenURI,
  };
}
