// @format
import { resolve } from "path";
import { env } from "process";
import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

export const name = "soundxyz-call-tokenuri";
export const version = "0.1.0";
const nextStrategyMessage = {
  type: "extraction",
  version,
  name: "soundxyz-get-tokenuri",
  args: [resolve(env.DATA_DIR, `${name}-transformation`)],
};

const resultKey = "tokenURI";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  strategyName: name,
  version,
  nextStrategyMessage,
  resultKey,
});

export { onClose, onError, onLine };
