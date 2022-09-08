//@format
import { constants } from "fs";
import { access, unlink } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import EventEmitter from "events";
import test from "ava";

import { loadStrategies } from "../src/disc.mjs";
import {
  extract,
  transform,
  setupFinder,
  EXTRACTOR_CODES,
  prepareMessages,
  validateCrawlPath,
} from "../src/lifecycle.mjs";
import {
  ValidationError,
  NotFoundError,
  NotImplementedError,
} from "../src/errors.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const mockMessageCommissioner = "mockCommissioner";
const mockMessage = {
  type: "https",
  version: "0.0.1",
  error: null,
  results: null,
  options: {
    url: "",
    method: "GET",
  },
};

test("if function transform gracefully returns when sourceFile doesn't exist", async (t) => {
  const strategy = {
    module: {
      name: "test-strategy",
    },
  };
  const sourcePath = "doesn't exist";
  const result = await transform(strategy, sourcePath);
  t.falsy(result);
});

test("if launcher throws errors on invalid strategy type", async (t) => {
  const finder = await setupFinder();
  t.throws(() => finder({ type: "non-existent" }), {
    instanceOf: NotFoundError,
  });
});

test("if launcher throws errors on invalid strategy name submission", async (t) => {
  const message0 = { type: "extraction", name: "non-existent" };
  const message1 = { type: "extraction", name: "non-existent" };

  const finder = await setupFinder();
  t.throws(() => finder(message0), {
    instanceOf: NotFoundError,
  });
  t.throws(() => finder(message1), {
    instanceOf: NotFoundError,
  });
});

test("reading a file by line using the line reader", async (t) => {
  const sourcePath = resolve(__dirname, "./fixtures/file0.data");
  const outputPath = resolve(__dirname, "./fixtures/file0.output");
  let count = 0;
  t.plan(3);
  const lineHandlerMock = (line) => {
    if (count === 0) t.is(line, "line0");
    if (count === 1) t.is(line, "line1");
    count++;
    return { write: "hello world", messages: [] };
  };
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy &&
      strategy.module &&
      strategy.module.name === "soundxyz-call-tokenuri"
  );
  const strategy = { ...strategies[0].module, onLine: lineHandlerMock };
  await transform({ module: strategy }, sourcePath, outputPath, []);
  t.is(count, 2);
  await unlink(outputPath);
});

test("applying transformation strategies to a file", async (t) => {
  const sourcePath = resolve(__dirname, "./fixtures/file1.data");
  const outputPath = resolve(__dirname, "./fixtures/file1.output");
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy &&
      strategy.module &&
      strategy.module.name === "soundxyz-call-tokenuri"
  );
  await transform(strategies[0], sourcePath, outputPath, []);
  try {
    await access(outputPath, constants.R_OK);
  } catch (err) {
    t.log(err);
    t.fail();
    return;
  }
  await unlink(outputPath);
  t.pass();
});

test("strategy transformer should receive inputs", async (t) => {
  const sourcePath = resolve(__dirname, "./fixtures/file1.data");
  const outputPath = resolve(__dirname, "./fixtures/file2.output");
  t.plan(3);
  const lineHandlerMock = (line, arg1) => {
    t.is(arg1, "arg1");
    return { write: "hello world", messages: [] };
  };
  const strategies = (
    await loadStrategies("./strategies", "transformer.mjs")
  ).filter(
    (strategy) =>
      strategy &&
      strategy.module &&
      strategy.module.name === "soundxyz-call-tokenuri"
  );
  const strategy = { ...strategies[0].module, onLine: lineHandlerMock };
  await transform({ module: strategy }, sourcePath, outputPath, ["arg1"]);
  try {
    await access(outputPath, constants.R_OK);
  } catch (err) {
    t.log(err);
    t.fail();
    return;
  }
  await unlink(outputPath);
  t.pass();
});

test("loading strategies", async (t) => {
  const pathTip = "../test/fixtures/strategies";
  const fileName = "extractor.mjs";
  const strategies = await loadStrategies(pathTip, fileName);
  t.is(strategies.length, 1);
  t.truthy(strategies);
});

test("if extract rejects result if it is invalid", async (t) => {
  const mockStrategy = {
    module: {
      name: "mockMessage",
      init: () => {
        return false;
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();
  await t.throwsAsync(async () => {
    try {
      await extract(mockStrategy, worker, router);
    } catch (e) {
      throw e;
    }
  });
});

test("if extract function can handle bad results from update", async (t) => {
  const mockStrategy = {
    module: {
      name: mockMessageCommissioner,
      init: () => {
        return {
          messages: [mockMessage],
          write: null,
        };
      },
      update: () => {
        return false;
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();
  await t.throwsAsync(async () => await extract(mockStrategy, worker, router));
  t.is(router.eventNames().length, 0);
});

test("if extract function can handle lifecycle errors", async (t) => {
  const mockStrategy = {
    module: {
      name: mockMessageCommissioner,
      init: () => {
        return {
          messages: [{ ...mockMessage, error: "this is an error" }],
          write: null,
        };
      },
      update: () => {
        t.fail();
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  const { code } = await extract(mockStrategy, worker, router);
  t.is(code, EXTRACTOR_CODES.SHUTDOWN_IN_UPDATE);
  t.is(router.eventNames().length, 0);
});

test("if extract() resolves the promise and removes the listener on no new messages", async (t) => {
  const mockStrategy = {
    module: {
      name: mockMessageCommissioner,
      init: () => {
        return { messages: [mockMessage], write: null };
      },
      update: () => {
        return { messages: [], write: null };
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  await extract(mockStrategy, worker, router);
  t.deepEqual(router.eventNames(), []);
  t.pass();
});

test("if extract() resolves the promise and removes the listener on no message from init", async (t) => {
  const mockStrategy = {
    module: {
      name: "mock",
      init: () => {
        return { messages: [], write: null };
      },
      update: () => {
        return { messages: [], write: null };
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  const { code } = await extract(mockStrategy, worker, router);
  t.is(code, EXTRACTOR_CODES.SHUTDOWN_IN_INIT);
  t.deepEqual(router.eventNames(), []);
  t.pass();
});

test("if extract function rejects promise on any unhandled error by update", async (t) => {
  const mockStrategy = {
    module: {
      name: "mockMessage",
      init: () => {
        return { messages: [mockMessage], write: null };
      },
      update: () => {
        throw new Error("Error in update");
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  await t.throwsAsync(
    async () => {
      await extract(mockStrategy, worker, router);
    },
    { message: "Error in update" }
  );
  t.deepEqual(router.eventNames(), []);
});

test("if extract function rejects promise on any unhandled error by init", async (t) => {
  const mockStrategy = {
    module: {
      name: "mockMessage",
      init: () => {
        throw new Error("Error in init");
      },
    },
  };

  class Worker extends EventEmitter {
    postMessage(message) {
      return router.emit(`${message.commissioner}-extraction`, message);
    }
  }

  const worker = new Worker();
  const router = new EventEmitter();

  await t.throwsAsync(
    async () => {
      await extract(mockStrategy, worker, router);
    },
    { message: "Error in init" }
  );
  t.deepEqual(router.eventNames(), []);
});

test("if prepareMessages filters invalid message and prepare message for worker", async (t) => {
  const messages = [mockMessage, {}, { ...mockMessage, type: "invalid-type" }];

  const preparedMessages = prepareMessages(messages, mockMessageCommissioner);

  t.is(preparedMessages.length, 1);
  t.is(preparedMessages[0].commissioner, mockMessageCommissioner);
});

test("if filterValidWorkerMessages throws error on invalid input", async (t) => {
  t.throws(() => prepareMessages(null));
});

test("validateCrawlPath works for happy case", (t) => {
  t.notThrows(() =>
    validateCrawlPath([
      [
        {
          name: "web3subgraph",
          extractor: { args: ["9956"] },
          transformer: {},
        },
      ],
    ])
  );
});

test("validateCrawlPath throws for empty crawl path", (t) => {
  t.throws(() => validateCrawlPath([]));
});
