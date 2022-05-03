# music-os-strategies

<p align="center">
  <img src="/assets/logo.webp" />
</p>

## purpose

The goal of this repository and the overall idea of separating music-os-core's
source from its strategies, is to allow any type of music platform to quickly
define their on-chain schema - allowing them to re-use music-os-core to index
and distribute their and other platform's music ecosystem.

## work-in-progress

WARNING: This repository is under active development and APIs aren't stable.

## implementing new strategies

### checklist for implementation

- Any external request message passed to @music-os/extraction-worker must
  result in an idempotent response (aka. if the request is repeated the same
  result must be returned).
- Extraction of information from external requests must not be coupled to e.g.
  transformation of responses. It must be possible to run transformation
  independently from e.g. extraction.
- Request patterns should be scoped through e.g. time or block periods.

To implement a strategy with maximum efficiency, we recommend doing all
on-chain and off-chain requests using music-os-core's [Extraction Worker
API](https://github.com/music-os/music-os-core/tree/main/src/services/extractor#extractor-worker-api).
