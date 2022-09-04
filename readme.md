# neume-network-strategies

## purpose

The goal of this repository and the overall idea of separating
neume-network-core's source from its strategies, is to allow any type of music
platform to quickly define their on-chain schema - allowing them to re-use
neume-network-core to index and distribute their and other platform's music
ecosystem.

## installation and contributing

Unless you want to run this repository's unit tests, for now, this repository
can't run by itself. Instead, we recommend you run it as a submodule of
neume-network/core. Please follow [its installation
instructions](https://github.com/neume-network/core#installation).

## work-in-progress

WARNING: This repository is under active development and APIs aren't stable.

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

### extractor strategy interface definition

An extractor strategy must implement the following interface:

```ts
interface Extractor {
  name: String;
  props: Object;
  init(args...): Object<messages:  Message[], write: String>;
  update(message: Message): Object<messages: Message[], write: String>;
}
```

Where `Message` is defined as any JSON object compliant to the definitions in
[neume-network/message-schema](https://github.com/neume-network/message-schema).

A neume-network extraction message is layed out similarly to a react.js
component in that foundamentally, it is a component implementing lifecycle
methods.

- A component has `props` as in "properties" that can be defined before
  instantiation of the component.
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
  onLine(line: String): Object<messages:  Message[], write: String>;
  onError(error: Error): any;
  onClose(): Object<messages:  Message[], write: String>;
}
```

Where `Message` is defined as any JSON object compliant to the definitions in
[neume-network/message-schema](https://github.com/neume-network/message-schema).
