// @format
import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

export const name = "zora-call-tokenuri";
export const version = "0.1.0";
const nextStrategyName = "zora-get-tokenuri";
const resultKey = "tokenURI";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  strategyName: name,
  version,
  nextStrategyName,
  resultKey,
});

export { onClose, onError, onLine };
