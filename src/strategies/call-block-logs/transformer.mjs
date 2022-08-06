// @format

import logger from "../../logger.mjs";

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

const filter = {
  CreatedArtist: {
    filter: (log) =>
      log.topics[0] ===
      "0x23748b43b77f98380e738976c6324996908ffc1989994dd3c68631c87a65a7c0",
    transformer: (log) => log.topics[1],
  },
};

export function onLine(line) {
  line = JSON.parse(line);
  line = line.filter(filter.CreatedArtist.filter);
  return {
    write: line.map(filter.CreatedArtist.transformer),
    messages: [],
  };
}
