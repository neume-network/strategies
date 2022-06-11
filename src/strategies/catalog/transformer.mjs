// @format
import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

const name = "catalog";
const version = "0.1.0";
const nextStrategyName = "catalog-get-tokenuri";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  name,
  version,
  nextStrategyName,
});

export { onClose, onError, onLine };
