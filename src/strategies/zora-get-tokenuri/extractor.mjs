// @format
import { getIpfsTokenUriFactory } from "../../strategy-factories/get-ipfs-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "zora-get-tokenuri";
export const props = { strategyName: name, version, options: {} };

export const { init, update } = getIpfsTokenUriFactory(props);
