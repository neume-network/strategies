// @format
import logger from "../../logger.mjs";

export const name = "get-minter";
const log = logger(name);

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
  let data;
  try {
    data = JSON.parse(line);
  } catch (err) {
    return {
      write: null,
      messages: [],
    };
  }

  const { transactionHash, from } = data;
  return {
    messages: [],
    write: JSON.stringify({
      transactionHash,
      from,
    }),
  };
}
