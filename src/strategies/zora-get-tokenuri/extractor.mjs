// @format
import { getIpfsTokenUriFactory } from "../../strategy-factories/get-ipfs-tokenuri/extractor.mjs";
import { ifIpfsConvertToNativeIpfs } from "../../utils.mjs";
import { zoraTokenUriSchema } from "./schemas.mjs";

export const version = "0.0.1";
export const name = "zora-get-tokenuri";
export const props = {
  strategyName: name,
  version,
  options: {},
  schema: zoraTokenUriSchema,
  // Early Zora tokenIDs don't return ipfs://
  // they return ipfs.fleek.co
  transformTokenUri: ifIpfsConvertToNativeIpfs,
};

export const { init, update } = getIpfsTokenUriFactory(props);
