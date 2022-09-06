// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";

export const getIpfsTokenUriFactory = (props) => {
  const { strategyName, options, version } = props;
  const log = logger(strategyName);

  if (env.IPFS_HTTPS_GATEWAY_KEY) {
    options.headers = {
      Authorization: `Bearer ${env.IPFS_HTTPS_GATEWAY_KEY}`,
    };
  }

  const init = async function (filePath) {
    if (!(await fileExists(filePath))) {
      log(
        `Skipping "${strategyName}" extractor execution as file doesn't exist "${filePath}"`
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
      messages.push({ ...makeRequest(tokenURI), metadata });
    }
    return {
      write: null,
      messages,
    };
  };

  const makeRequest = function (tokenURI) {
    return {
      type: "https",
      version,
      options: {
        url: tokenURI,
        method: "GET",
        headers: options.headers,
      },
      results: null,
      error: null,
    };
  };

  const update = function (message) {
    let messages = [];
    return {
      messages,
      write: JSON.stringify({
        metadata: {
          ...message.metadata,
          tokenURI: message.options.url,
        },
        results: message.results,
      }),
    };
  };

  return { init, update };
};
