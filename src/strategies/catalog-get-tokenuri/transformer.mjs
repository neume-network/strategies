// @format
import logger from "../../logger.mjs";

const name = "catalog";
const log = logger(name);
const version = "0.1.0";

export function onClose() {
  log("closed");
  return {
    write: null,
    messages: [],
  };
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line) {
  let datum;
  try {
    datum = JSON.parse(line);
  } catch (err) {
    return {
      write: null,
      messages: [],
    };
  }
  return {
    messages: [],
    write: JSON.stringify({
      version,
      title: datum.body.title,
      duration: "PT0M", // TODO: From catalog duration go to ISO8601 duration
      artist: {
        version,
        name: datum.body.artist,
      },
      platform: {
        version,
        name: "Catalog",
        uri: "https://beta.catalog.works",
      },
      erc721: {
        version,
        // TODO
        address: "0x0000000000000000000000000000000000000000",
        tokenId: "0",
        tokenURI: "https://example.com/metadata.json",
        metadata: {
          ...datum,
          name: datum.body.title,
          description: datum.body.notes,
          image: datum.body.artwork.info.uri,
        },
      },
      manifestations: [
        {
          version,
          // TODO: Zora's file URL can be retrieved when calling tokenURI
          uri: "https://example.com/file",
          mimetype: datum.body.mimeType,
        },
        {
          version,
          uri: datum.body.artwork.info.uri,
          mimetype: datum.body.artwork.info.mimeType,
        },
      ],
    }),
  };
}
