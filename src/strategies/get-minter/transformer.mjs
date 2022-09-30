// @format
import logger from "../../logger.mjs";

export const name = "get-minter";
const log = logger(name);

export function onClose() {
  log("closed");
  return;
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
    return;
  }

  const { transactionHash, from } = data;
  return JSON.stringify({
    transactionHash,
    from,
  });
}
