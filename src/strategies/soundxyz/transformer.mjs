// @format
import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

export const name = "soundxyz";
export const version = "0.1.0";
const nextStrategyName = "soundxyz-get-tokenuri";
const resultKey = "tokenURI";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  strategyName: name,
  version,
  nextStrategyName,
  resultKey,
});

export { onClose, onError, onLine };
