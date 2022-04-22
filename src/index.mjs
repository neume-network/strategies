//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { getdirdirs, load } from "./disc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function start(worker, primitive) {
  let state = {};

  const step0 = primitive.init(state);
  state = step0.state;

  worker.on("message", (message) => {
    if (message.error) {
      throw new Error(message.error);
    }

    message = {
      ...message,
      results: primitive.transform(message.results),
    };
    const stepN = primitive.update(message, state);

    state = stepN.state;
    worker.postMessage(stepN.message);
  });
  worker.postMessage(step0.message);
}

export async function run(worker, logger) {
  const path = resolve(__dirname, "./primitives");
  const paths = await getdirdirs(path);
  const primitives = await load(paths);
  for (const primitive of primitives) {
    start(worker, primitive);
  }
}
