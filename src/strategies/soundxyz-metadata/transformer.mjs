// @format
import { decodeCallOutput } from "eth-fun";

export function transform(line) {
  let editionMetadataObject = {};

  try {
    const editionMetadataArray = decodeCallOutput(
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
      line
    );

    // map editionMetaDataArray to editionMetadataObject
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
    console.log(err);
    return {
      messages: [],
      write: null,
    };
  }
  return {
    messages: [],
    write: JSON.stringify(editionMetadataObject),
  };
}
