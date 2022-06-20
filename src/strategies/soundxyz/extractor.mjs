// @format
import { getTokenUriFactory } from "../../strategy-factories/get-tokenuri/extractor.mjs";

export const version = "0.0.1";
export const name = "soundxyz";
export const props = {
  version,
  strategyName: name,
  signature: "tokenURI(uint256)",
  address: "0x01ab7d30525e4f3010af27a003180463a6c811a6",
};

const { init, update } = getTokenUriFactory(props);

export { init, update };
