//@format
import { init } from "./lifecycle.mjs";

export async function run(worker, crawlPath) {
  init(worker, crawlPath);
}
