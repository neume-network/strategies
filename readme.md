# neume-network-strategies

## purpose

The goal of this repository and the overall idea of separating
neume-network-core's source from its strategies, is to allow any type of music
platform to quickly define their on-chain schema - allowing them to re-use
neume-network-core to index and distribute their and other platform's music
ecosystem.

## installation and contributing

- It's best to install the strategies repository via
  [neume-network/core](https://github.com/neume-network/core) as `npm i` will
  download the submodule and install its dependencies
- To run the tests via `npm run test` a properly set up `.env` is necessary. We
  recommend softlinking from core's `.env` file using `ln`

## implementing new strategies

Checkout the [quickstart guide](https://github.com/neume-network/strategies/blob/main/docs/quickstart.md) for a in-depth walkthrough.

### high-level checklist for implementation

- Any external request message passed to @neume-network/extraction-worker must
  result in an idempotent response (aka. if the request is repeated the same
  result must be returned).
- Extraction of information from external requests must not be coupled to e.g.
  transformation of responses. It must be possible to run transformation
  independently from e.g. extraction.
- Request patterns should be scoped through e.g. time or block periods.

To implement a strategy with maximum efficiency, we recommend doing all
on-chain and off-chain requests using the [extraction Worker
API](https://github.com/neume-network/extraction-worker#extractor-worker-api).

### content and identification: defining `interface Datum`

neume writes results to flat files. Relationality of datums is expressed
through directed edges, it's linked data essentially. For this reason, it's
important that each result of neume is universally identifiable.

```ts
interface Datum {
  id: String; // must be globally unique
  content: String;
}
```

neume will take care of writing a `Datum`'s `content` and `id` such that random
direct and low-memory overhead access within the entire crawl result is
possible.

### extractor strategy interface definition

An extractor strategy must implement the following interface:

```ts
interface Extractor {
  name: String;
  init(args...): Object<messages:  Message[], write: Datum>;
  update(message: Message): Object<messages: Message[], write: Datum>;
}
```

Where `Message` is defined as any JSON object compliant to the definitions in
[neume-network/message-schema](https://github.com/neume-network/message-schema).

A neume-network extraction message is layed out similarly to a react.js
component in that foundamentally, it is a component implementing lifecycle
methods.

- The `init` function is called when the component is mounted into the core
  process.
- Upon completion of the `init` task, `update` is called until `update`'s
  returned `messages` list is empty.

Below is a visual overview of a neume-network extractor component's lifecycle.

<p align="center">
  <img src="/assets/extractor-lifecycle-component.png" />
</p>

### transformer strategy interface definition

A transformer strategy must implement the following interface:

```ts
interface Transformer {
  name: String;
  onLine(line: String): Datum | null | undefined;
  onError(error: Error): any;
  onClose(): Datum | null | undefined;
}
```

Where `Message` is defined as any JSON object compliant to the definitions in
[neume-network/message-schema](https://github.com/neume-network/message-schema).
