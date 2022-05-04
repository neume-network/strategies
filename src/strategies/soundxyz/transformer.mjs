// @format
const version = "0.0.1";

export function transform(line) {
  const datum = JSON.parse(line);
  return {
    version,
    title: datum.name,
    duration: "P", // TODO: Duration needs to be inferred from the audio file
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
        mimetype: "audio",
      },
      {
        version,
        uri: datum.image,
        // TODO
        mimetype: "image",
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
