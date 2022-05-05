// @format
const version = "0.1.0";

export function transform(line) {
  let datum;
  try {
    datum = JSON.parse(line);
  } catch (err) {
    return null;
  }
  return {
    version,
    title: datum.name,
    duration: "PT0M", // TODO: Duration needs to be inferred from the audio file
    artist: {
      version,
      name: datum.artist_name,
    },
    platform: {
      version,
      name: "Sound",
      uri: datum.external_url,
    },
    erc721: {
      version,
      // TODO
      address: "0x0000000000000000000000000000000000000000",
      tokenId: "0",
      tokenURI: "https://example.com/metadata.json",
      metadata: {
        ...datum,
      },
    },
    manifestations: [
      {
        version,
        uri: datum.audio_url,
        // TODO
        mimetype: "audio/mp3",
      },
      {
        version,
        uri: datum.image,
        // TODO
        mimetype: "image/jpeg",
      },
      {
        version,
        uri: datum.animation_url,
        // TODO
        mimetype: "image/gif",
      },
    ],
  };
}
