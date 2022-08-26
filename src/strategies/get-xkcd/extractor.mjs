const version = "0.0.1";
export const name = "get-xkcd";
export const props = {};
import logger from "./logger.mjs";
import { schema } from "./schema.mjs";
import Ajv from "ajv";

const log = logger(name);

const validator = new Ajv();
const validate = validator.compile(schema);

const MAX_PAGE = 19;

const templateURI = (num) => `https://xkcd.com/${num}/info.0.json`;

export function init(start = 1) {
  return {
    write: null,
    messages: [
      {
        type: "https",
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
  if (message.error) {
    // handle the error
    log(message.error);

    // continue the crawling if possible (in this case, we are not able to retrieve the next page)
    return {
      write: null,
      messages: [],
    };
  }

  const data = message.results;
  if (!validate(data)) {
    log(validate.errors);
    return {
      type: "exit",
      version: "1.0",
    };
  }

  const toBeStored = JSON.stringify(data);

  const { num } = message.results;
  if (num >= MAX_PAGE) {
    return {
      type: "exit",
      version: "1.0",
    };
  }

  let options = {
    url: templateURI(num + 1),
    method: "GET",
  };

  return {
    // NOTE: Check results in your data directory at ./get-xkcd-extraction
    write: toBeStored,
    messages: [
      {
        type: "https",
        version,
        options: options,
        results: null,
        error: null,
      },
    ],
  };
}
