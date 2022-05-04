//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { extraction, loadStrategies, transformation } from "./lifecycle.mjs";
import logger from "./logger.mjs";

const log = logger("index");

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(worker) {
  //extraction.init(worker);
  const dataPath = resolve(__dirname, "../data");
  const strategies = await loadStrategies("./strategies", "transformer.mjs");
  const onLineHandler = transformation.applyOnLine(strategies);
  const onLineHandlerProxy = (line) => {
    const result = onLineHandler(line);
    log(result);
  };
  await transformation.lineReader(dataPath, onLineHandlerProxy);
}
