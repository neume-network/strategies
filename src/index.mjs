//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { init, loadStrategies, transformation } from "./lifecycle.mjs";
import logger from "./logger.mjs";

const log = logger("index");

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(worker) {
  init(worker);
}
