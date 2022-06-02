// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

export const version = "0.0.1";
export const name = "soundxyz-get-tokenuri";
export const props = {
  // TODO: Document autoStart property in readme.md
  autoStart: false,
};

export async function init(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let messages = [];
  for await (const tokenURI of rl) {
    // NOTE: We're ignoring empty lines
    if (tokenURI === "") continue;
    messages.push(makeRequest(tokenURI));
  }
  messages[messages.length - 1].last = true;
  return {
    write: null,
    messages,
  };
}

export function makeRequest(tokenURI) {
  return {
    type: "https",
    commissioner: name,
    version,
    options: {
      url: tokenURI,
      method: "GET",
    },
    results: null,
    error: null,
  };
}

export function update(message) {
  let messages = [];
  if (message.last) {
    messages = [
      {
        type: "transformation",
        version,
        name,
        args: null,
      },
    ];
  }

  return {
    messages,
    write: JSON.stringify(message.results),
  };
}
