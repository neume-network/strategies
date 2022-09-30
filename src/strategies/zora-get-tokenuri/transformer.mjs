// @format
import logger from "../../logger.mjs";

export const name = "zora-get-tokenuri";
const log = logger(name);
export const version = "1.0.0";

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

  const title = datum?.body?.title || datum?.name;
  const artist = datum?.body?.artist;
  const description = datum?.body?.notes;
  const artwork = datum?.body?.artwork?.info?.uri;
  let duration;
  if (datum.body && datum.body.duration) {
    duration = `PT${Math.floor(datum.body.duration / 60)}M${(
      datum.body.duration % 60
    ).toFixed(0)}S`;
  }

  return JSON.stringify({
    version,
    title,
    duration,
    artist: {
      version,
      name: artist,
    },
    platform: {
      version,
      name: "Catalog",
      uri: "https://beta.catalog.works",
    },
    erc721: {
      version,
      // TODO
      //address: nft[1],
      //tokenId: nft[2],
      tokenURI: metadata.tokenURI,
      metadata: {
        ...datum,
        name: title,
        description,
      },
    },
    manifestations: [
      {
        version,
        // TODO: Zora's file URL can be retrieved when calling tokenURI
        //uri: "https://example.com/file",
        //mimetype: datum.body.mimeType,
      },
      {
        version,
        uri: artwork,
        mimetype: "image",
      },
    ],
  });
}
