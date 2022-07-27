// @format
import { callTokenUriFactory } from "../../strategy-factories/call-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "zora-call-tokenuri";
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
    address === "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7",
};

const { init, update } = callTokenUriFactory(props);

export { init, update };
