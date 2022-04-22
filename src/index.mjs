//@format
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { getdirdirs } from "./disc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(worker, logger) {
  const path = resolve(__dirname, "./primitives");
  const paths = await getdirdirs(path);
  const primitives = await load(paths);
  console.log(primitives);
}
