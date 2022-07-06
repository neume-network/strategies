const version = "0.0.1";
export const name = "get-xkcd";
export const props = {};

const templateURI = (num) => `https://xkcd.com/${num}/info.0.json`;
export function init(start = 0) {
  return {
    write: null,
    messages: [
      {
        type: "https",
        commissioner: name,
        version,
        options: {
          url: templateURI(start),
          method: "GET",
        },
        results: null,
        error: null,
      },
    ],
  };
}

export function update(message) {
  // TODO: There's a bug in neume-network/extraction-worker that doesn't
  // allow us to get back the error: https://github.com/neume-network/extraction-worker/issues/34
  if (message.error && message.error.includes("404 Not Found")) {
    return {
      write: null,
      messages: [
        {
          type: "transformation",
          version,
          name,
          args: null,
        },
      ],
    };
  }
  const { num } = message.results;
  return {
    // NOTE: Check results in your data directory at ./get-xkcd-extraction
    write: JSON.stringify(message.results),
    messages: [
      {
        type: "https",
        commissioner: name,
        version,
        options: {
          // NOTE: We're iterating over all numbers here
          url: templateURI(num + 1),
          method: "GET",
        },
        results: null,
        error: null,
      },
    ],
  };
}
