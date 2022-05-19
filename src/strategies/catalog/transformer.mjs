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
    messages: [],
    state: {},
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
