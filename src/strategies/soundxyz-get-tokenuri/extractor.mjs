// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

export const version = "0.0.1";
export const name = "soundxyz-get-tokenuri";
export const props = {};

export async function init(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let messages = [];
  for await (const line of rl) {
    // NOTE: We're ignoring empty lines
    if (line === "") continue;
    const data = JSON.parse(line);
    const { tokenURI, metadata } = data;

    messages.push(makeRequest(tokenURI));
  }
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
  return {
    messages: [],
    write: JSON.stringify({
      metadata: {
        tokenURI: message.options.url,
      },
      results: message.results,
    }),
  };
}
