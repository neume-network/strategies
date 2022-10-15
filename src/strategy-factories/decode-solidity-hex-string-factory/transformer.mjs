// @format
import { env } from "process";
import { resolve } from "path";

import { decodeParameters } from "eth-fun";

import logger from "../../logger.mjs";

export const decodeSolidityHexStringFactory = (props) => {
  const { strategyName, version, resultKey, transformResult } = props;

  const log = logger(strategyName);

  function onClose() {
    return;
  }

  function onError(error) {
    log(error.toString());
    throw error;
  }

  function onLine(line) {
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
      decodedOutput = transformResult
        ? transformResult(decodedOutput)
        : decodedOutput;
    } catch (err) {
      log(err.toString());
      return;
    }
    return JSON.stringify({
      metadata: obj.metadata,
      [resultKey]: decodedOutput,
    });
  }

  return {
    onClose,
    onLine,
    onError,
  };
};
