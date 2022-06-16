//@format
import test from "ava";
import { readdir } from "fs/promises";

const STRAGIES_PATH = "../src/strategies/";

test("if strategy name is the same as directory name", async (t) => {
  const source = new URL(STRAGIES_PATH, import.meta.url);

  const directories = (await readdir(source, { withFileTypes: true })).filter(
    (dirent) => dirent.isDirectory()
  );

  await Promise.all(
    directories.map(async (dir) => {
      const name = dir.name;
      const extractorSource = new URL(
        `../src/strategies/${name}/extractor.mjs`,
        import.meta.url
      );
      const transformerSource = new URL(
        `../src/strategies/${name}/transformer.mjs`,
        import.meta.url
      );

      await Promise.all(
        [extractorSource, transformerSource].map(async (source) => {
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
