// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";

export const version = "0.0.1";
export const name = "sound-protocol-get-tokenuri";
const log = logger(name);

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

    messages.push({ ...makeRequest(tokenURI), metadata });
  }
  return {
    write: null,
    messages,
  };
}

export function makeRequest(tokenURI) {
  return {
    type: "arweave",
    version,
    options: {
      uri: tokenURI,
      gateway: "https://arweave.net",
    },
  };
}

export function update(message) {
  return {
    messages: [],
    write: JSON.stringify({
      metadata: {
        ...message.metadata,
        tokenURI: message.options.uri,
      },
      results: message.results,
    }),
  };
}
