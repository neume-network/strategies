// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";

export const version = "0.0.1";
export const name = "soundxyz-get-tokenuri";
const log = logger(name);
export const props = {};

export async function init(filePath) {
  if (!(await fileExists(filePath))) {
    log(
      `Skipping "${name}" extractor execution as file doesn't exist "${filePath}"`
    );
    return {
      write: "",
      messages: [],
    };
  }

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
