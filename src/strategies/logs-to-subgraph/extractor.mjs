import { renameSync } from "fs";
import { env } from "process";
import { resolve } from "path";

export const name = "logs-to-subgraph";
export function init() {
  // FIXME: Workaround until we have a solution for:
  // https://github.com/neume-network/strategies/issues/241
  renameSync(
    resolve(env.DATA_DIR, "call-block-logs-transformation"),
    resolve(env.DATA_DIR, "logs-to-subgraph-extraction")
  );
  return { write: "", messages: [] };
}
