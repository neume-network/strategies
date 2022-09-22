// @format
import { getIpfsTokenUriFactory } from "../../strategy-factories/get-ipfs-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "noizd-get-tokenuri";
export const props = {
  version,
  strategyName: name,
  options: {},
};

const { init, update } = getIpfsTokenUriFactory(props);

export { init, update };
