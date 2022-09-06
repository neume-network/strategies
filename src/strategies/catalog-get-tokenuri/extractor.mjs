// @format
import { getIpfsTokenUriFactory } from "../../strategy-factories/get-ipfs-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "catalog-get-tokenuri";
export const props = { strategyName: name, version, options: {} };

const { init, update } = getIpfsTokenUriFactory(props);

export { init, update };
