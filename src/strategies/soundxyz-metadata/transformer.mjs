// @format
import { decodeParameters } from "eth-fun";

import logger from "../../logger.mjs";

export const name = "soundxyz-metadata";
const log = logger(name);

export function onClose() {
  log("closed");
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line) {
  const { results, metadata } = JSON.parse(line);
  let editionMetadataObject = {};
  let editionMetadataArray = [];

  try {
    editionMetadataArray = decodeParameters(
      [
        "address",
        "uint256",
        "uint32",
        "uint32",
        "uint32",
        "uint32",
        "uint32",
        "uint32",
        "address",
      ],
      results
    );
  } catch (err) {
    return;
  }

  // map editionMetaDataArray to editionMetadataObject
  try {
    editionMetadataObject.fundingRecipient = editionMetadataArray[0];
    editionMetadataObject.price = editionMetadataArray[1];
    editionMetadataObject.numSold = editionMetadataArray[2];
    editionMetadataObject.quantity = editionMetadataArray[3];
    editionMetadataObject.royaltyBPS = editionMetadataArray[4];
    editionMetadataObject.startTime = editionMetadataArray[5];
    editionMetadataObject.endTime = editionMetadataArray[6];
    editionMetadataObject.presaleQuantity = editionMetadataArray[7];
    editionMetadataObject.signerAddress = editionMetadataArray[8];
  } catch (err) {
    return;
  }
  return JSON.stringify({
    results: editionMetadataObject,
    metadata: metadata,
  });
}
