// @format
import { callTokenUriFactory } from "../../strategy-factories/call-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "mintsongs-call-tokenuri";
export const props = {
  version,
  strategyName: name,
  signature: {
    name: "tokenURI",
    type: "function",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
  },
  filterFunc: ({ address }) =>
    address === "0x2b5426a5b98a3e366230eba9f95a24f09ae4a584",
};

const { init, update } = callTokenUriFactory(props);

export { init, update };
