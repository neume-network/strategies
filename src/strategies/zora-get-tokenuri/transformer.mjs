// @format
import logger from "../../logger.mjs";

export const name = "zora-get-tokenuri";
const log = logger(name);
export const version = "0.1.0";

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
  let data;
  try {
    data = JSON.parse(line);
  } catch (err) {
    return {
      write: null,
      messages: [],
    };
  }
  const metadata = data.metadata;
  const datum = data.results;

  let title, duration, artist, description, artwork;
  if (datum.body) {
    title = datum.body.title;
    if (datum.body.duration) {
      duration = `PT${Math.floor(datum.body.duration / 60)}M${(
        datum.body.duration % 60
      ).toFixed(0)}S`;
    } else {
      // TODO
      duration = "";
    }
    if (datum.body.artist) {
      artist = datum.body.artist;
    }
    if (datum.body.notes) {
      description = datum.body.notes;
    }
    if (datum.body.artwork) {
      artwork = datum.body.artwork;
    }
  } else if (datum.name) {
    title = datum.name;
  }

  return {
    messages: [],
    write: JSON.stringify({
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
          //image: artwork.info.uri,
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
          //uri: artwork.info.uri,
          //mimetype: artwork.info.mimeType,
        },
      ],
    }),
  };
}
