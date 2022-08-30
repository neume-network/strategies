//@format
import test from "ava";
import { readdir } from "fs/promises";

import { fileExists } from "../src/disc.mjs";

const STRATEGIES_PATH = "../src/strategies";

test("if strategy name is the same as directory name", async (t) => {
  const source = new URL(STRATEGIES_PATH, import.meta.url);

  const directories = (await readdir(source, { withFileTypes: true })).filter(
    (dirent) => dirent.isDirectory()
  );

  await Promise.all(
    directories.map(async (dir) => {
      const name = dir.name;
      const sources = await Promise.all(
        [
          new URL(`${STRATEGIES_PATH}/${name}/extractor.mjs`, import.meta.url),
          new URL(
            `${STRATEGIES_PATH}/${name}/transformer.mjs`,
            import.meta.url
          ),
        ].map(async (url) => {
          if (await fileExists(url)) {
            return url;
          }
        })
      );

      const filteredSources = sources.filter((s) => s);

      await Promise.all(
        filteredSources.map(async (source) => {
          const strategy = await import(source);
          // For better debugging abilities
          if (!strategy.name) {
            throw new Error(`Strategy ${name} exports no name`);
          }
          t.is(strategy.name, name);
        })
      );
    })
  );
});
