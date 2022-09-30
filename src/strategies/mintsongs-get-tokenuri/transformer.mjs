// @format
import logger from "../../logger.mjs";

export const name = "mintsongs-get-tokenuri";
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

  const artist = datum?.artist;
  const description = datum?.description;
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
      name: artist,
    },
    platform: {
      version,
      name: "Mint Songs",
      uri: "https://www.mintsongs.com/",
    },
    erc721: {
      // TODO: Remove hardcoded owner value
      owner: "0x681452d95caef97a88d25a452dc1bc2b62d7f134",
      version,
      createdAt: metadata?.block?.number,
      tokenId: metadata?.tokenId,
      address: metadata?.contract?.address,
      tokenURI: metadata?.tokenURI,
      metadata: {
        ...datum,
        name: datum.title,
        description,
      },
    },
    manifestations: [
      {
        version,
        uri: datum.losslessAudio,
        mimetype: datum.mimeType,
      },
      {
        version,
        uri: datum.artwork.uri,
        mimetype: datum.artwork.mimeType,
      },
    ],
  });
}
