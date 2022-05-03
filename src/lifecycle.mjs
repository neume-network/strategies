//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { getdirdirs, loadAll } from "./disc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function extract(worker, extractor) {
  let state = {};

  const step0 = extractor.init(state);
  state = step0.state;

  worker.on("message", (message) => {
    if (message.error) {
      throw new Error(message.error);
    }

    const stepN = extractor.update(message, state);

    state = stepN.state;
    worker.postMessage(stepN.message);
  });
  worker.postMessage(step0.message);
}

async function init(worker) {
  const path = resolve(__dirname, "./strategies");
  const paths = await getdirdirs(path);
  const extractors = await loadAll(paths, "extractor.mjs");
  for (const extractor of extractors) {
    extract(worker, extractor);
  }
}

export const extraction = {
  init,
  extract,
};
