// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

export const version = "0.0.1";
export const name = "zora-get-tokenuri";
export const props = { options: {} };

if (env.IPFS_HTTPS_GATEWAY_KEY) {
  props.options.headers = {
    Authorization: `Bearer ${env.IPFS_HTTPS_GATEWAY_KEY}`,
  };
}

export async function init(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let messages = [];
  for await (let line of rl) {
    // NOTE: We're ignoring empty lines
    if (line === "") continue;

    const data = JSON.parse(line);
    const { metadata } = data;
    let tokenURI = data.tokenURI;

    if (tokenURI.includes("https://")) {
      const parts = tokenURI.split("/");
      const hash = parts.pop();
      tokenURI = `${env.IPFS_HTTPS_GATEWAY}${hash}`;
    }

    const IPFSIANAScheme = "ipfs://";
    if (tokenURI.includes(IPFSIANAScheme)) {
      tokenURI = tokenURI.replace(IPFSIANAScheme, env.IPFS_HTTPS_GATEWAY);
    }
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
      headers: props.options.headers,
    },
    results: null,
    error: null,
  };
}

export function update(message) {
  let messages = [];
  return {
    messages,
    write: JSON.stringify({
      metadata: {
        tokenURI: message.options.url,
      },
      results: message.results,
    }),
  };
}
