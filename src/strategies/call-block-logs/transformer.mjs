// @format
import { resolve } from "path";
import { env } from "process";

import logger from "../../logger.mjs";

export const name = "call-block-logs";
const log = logger(name);
export const version = "0.1.0";

const topics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
];

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
  const logs = JSON.parse(line);
  const filtered = logs.filter((log) => topics.includes(log.topics[0]));
  return {
    messages: [],
    write: JSON.stringify(filtered),
  };
}
