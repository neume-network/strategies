// @format
import { env } from "process";
import { resolve } from "path";

import { decodeSolidityHexStringFactory } from "../../strategy-factories/decode-solidity-hex-string-factory/transformer.mjs";
import { ifIpfsConvertToNativeIpfs } from "../../utils.mjs";

export const name = "zora-call-tokenmetadatauri";
export const version = "0.1.0";
const resultKey = "tokenURI";

const { onClose, onError, onLine } = decodeSolidityHexStringFactory({
  strategyName: name,
  version,
  resultKey,
  // Early Zora tokenIDs don't return ipfs://
  // they return ipfs.fleek.co
  transformResult: ifIpfsConvertToNativeIpfs,
});

export { onClose, onError, onLine };
