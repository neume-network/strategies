// @format
import { callTokenUriFactory } from "../../strategy-factories/call-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "catalog-call-tokenuri";
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
    address === "0x0bc2a24ce568dad89691116d5b34deb6c203f342",
};

const { init, update } = callTokenUriFactory(props);

export { init, update };
