// @format
import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

export const name = "zora-call-tokenmetadatauri";
export const version = "0.1.0";
const nextStrategyMessage = {
  type: "extraction",
  version,
  name: "zora-get-tokenuri",
  args: [],
};
const resultKey = "tokenURI";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  strategyName: name,
  version,
  nextStrategyMessage,
  resultKey,
});

export { onClose, onError, onLine };
