//@format
import { extraction } from "./lifecycle.mjs";

export async function run(worker) {
  extraction.init(worker);
}
