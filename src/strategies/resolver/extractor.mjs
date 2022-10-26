import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { deepMapKeys } from "../../utils.mjs";

const version = "0.0.1";
export const name = "resolver";

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

export async function init(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const messages = [];
  for await (const line of rl) {
    // NOTE: We're ignoring empty lines
    if (line === "") continue;
    const pLine = JSON.parse(line);

    for (let elem of pLine) {
      // TODO: we might also need a deepMapKeys filter... because otherwise we're
      // just going to find individual keys and not the worker objects within
      // the tree
      deepMapKeys(elem, (key, value) => {
        console.log(value);
        if (value && value.type) {
          messages.push({ ...value, metadata: { key } });
        }
      });
    }
  }
  console.log(messages);

  return {
    messages: [],
    write: null,
  };
}

export function update(message) {
  return {
    messages: [],
    write: null,
  };
}
