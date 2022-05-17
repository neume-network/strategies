//@format
import { init } from "./lifecycle.mjs";

export async function run(worker) {
  init(worker);
}
