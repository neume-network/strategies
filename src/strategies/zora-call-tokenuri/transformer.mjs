// @format
import { resolve } from "path";
import { env } from "process";

import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

export const name = "zora-call-tokenuri";
export const version = "0.1.0";
const resultKey = "tokenURI";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  strategyName: name,
  version,
  resultKey,
});

export { onClose, onError, onLine };
