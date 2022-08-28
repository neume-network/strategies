// @format
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { decodeLog } from "eth-fun";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "filter-music-nfts";
const log = logger(name);
export const version = "0.1.0";
export const props = {};

function decodeArtistAddress(log) {
  const topics = log.topics;
  topics.shift();
  const result = decodeLog(
    [
      {
        type: "uint256",
        name: "artistId",
      },
      {
        type: "string",
        name: "name",
      },
      {
        type: "string",
        name: "symbol",
      },
      {
        type: "address",
        name: "artistAddress",
        indexed: true,
      },
    ],
    log.data,
    topics
  );
  return result.artistAddress.toLowerCase();
}

export async function init(logPath, contracts) {
  const rl = createInterface({
    input: createReadStream(logPath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    let logs;
    try {
      logs = parseJSON(line, 100);
    } catch (err) {
      log(err);
      continue;
    }
    for (const log of logs) {
      if (log.address === "0x78e3adc0e811e4f93bd9f1f9389b923c9a3355c2") {
        contracts[decodeArtistAddress(log)] = {
          name: "sound",
        };
      }
    }
  }

  return {
    write: JSON.stringify(contracts),
    messages: [],
  };
}

export function update(message) {
  return {
    write: null,
    messages: [],
  };
}
