// @format
import logger from "../../logger.mjs";

export const name = "mintsongs-get-tokenuri";
const log = logger(name);
export const version = "2.0.0";

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

  const title = datum?.project?.title ?? datum?.name;
  const artist = datum?.artist;
  const description = datum?.description;
  const artwork = datum?.project?.artwork?.uri;
  let duration;
  if (datum?.duration) {
    duration = `PT${Math.floor(datum.duration / 60)}M${(
      datum.duration % 60
    ).toFixed(0)}S`;
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
        name: "Mint Songs",
        uri: "https://www.mintsongs.com/",
      },
      erc721: {
        version,
        createdAt: parseInt(metadata?.block?.number, 10),
        tokenId: metadata?.tokenId,
        address: metadata?.contract?.address,
        tokenURI: metadata?.tokenURI,
        metadata: {
          ...datum,
          name: title,
          description,
        },
      },
      manifestations: [
        {
          version,
          uri: artwork,
          mimetype: "image",
        },
      ],
      // TODO
      // owner: {}
    }),
  };
}
