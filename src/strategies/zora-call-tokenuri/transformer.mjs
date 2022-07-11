// @format
import { resolve } from "path";
import { env } from "process";

import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";

export const name = "zora-call-tokenuri";
export const version = "0.1.0";
const nextStrategyMessage = {
  type: "extraction",
  version,
  name: "zora-call-tokenmetadatauri",
  args: [resolve(env.DATA_DIR, `web3subgraph-transformation`)],
};
const resultKey = "tokenURI";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  strategyName: name,
  version,
  nextStrategyMessage,
  resultKey,
});

export { onClose, onError, onLine };
