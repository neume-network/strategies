// @format
import { env } from "process";
import { resolve } from "path";

import { decodeParameters } from "eth-fun";

import logger from "../../logger.mjs";

export const decodeSolidityHexStringFactory = (props) => {
  const { strategyName, version, resultKey } = props;

  const log = logger(strategyName);

  function onClose() {
    return {
      write: null,
      messages: [],
    };
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
      return {
        messages: [],
        write: null,
      };
    }

    let decodedOutput;
    try {
      [decodedOutput] = decodeParameters(["string"], obj.results);
    } catch (err) {
      log(err.toString());
      return {
        messages: [],
        write: null,
      };
    }
    return {
      messages: [],
      write: JSON.stringify({
        metadata: obj.metadata,
        [resultKey]: decodedOutput,
      }),
    };
  }

  return {
    onClose,
    onLine,
    onError,
  };
};
