// @format
import { getTokenUriFactory } from "../../strategy-factories/get-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "soundxyz-call-tokenuri";
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
  filterFunc: ({ platform }) => platform === "sound",
};

const { init, update } = getTokenUriFactory(props);

export { init, update };
