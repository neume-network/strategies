// @format
import logger from "../../logger.mjs";

export const name = "catalog-get-tokenuri";
const log = logger(name);
export const version = "2.0.0";

export function onClose() {
  log("closed");
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line) {
  let data;
  try {
    data = JSON.parse(line);
  } catch (err) {
    return;
  }
  const metadata = data.metadata;
  const datum = data.results;

  let duration;
  if (datum?.duration) {
    duration = `PT${Math.floor(datum.duration / 60)}M${(
      datum.duration % 60
    ).toFixed(0)}S`;
  }

  return JSON.stringify({
    version,
    title: datum.title,
    duration,
    artist: {
      version,
      name: datum.artist,
    },
    platform: {
      version,
      name: "Catalog",
      uri: "https://beta.catalog.works",
    },
    erc721: {
      // TODO: Stop hard coding this value
      owner: "0x489e043540ff11ec22226ca0a6f6f8e3040c7b5a",
      version,
      createdAt: metadata?.block?.number,
      tokens: [
        {
          minting: {
            transactionHash: metadata?.transactionHash,
          },
          id: metadata?.tokenId,
          uri: metadata?.tokenURI,
        },
      ],
      address: metadata?.contract?.address,
      metadata: {
        ...datum,
        name: datum.name,
        description: datum.description,
      },
    },
    manifestations: [
      {
        version,
        uri: datum.image,
        mimetype: "image",
      },
      {
        version,
        uri: datum.losslessAudio,
        mimetype: datum.mimeType,
      },
    ],
  });
}
