//@format
import { init } from "./lifecycle.mjs";

export async function run(worker, crawlPath) {
  await init(worker, crawlPath);
}
