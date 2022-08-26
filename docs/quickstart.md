# quickstart
As described in the [README](https://github.com/neume-network/strategies/readme.md), a strategy requires an `extractor` and, optionally, a `transformer`:

- every run of the `update` function of the `extractor` should pull a chunk of the data from the source, be it a page, a time range etc
- once the extraction process is finished, the transformation part begins. This is executed on a per-line basis (`onLine`) and should prepare the data to be compliant with the schema of the final dataset.

Depending on the data source, different initial configurations may be needed.

## https strategy
A web 2 strategy crawls data from an `https` source (rss feed, apis, etc...). 

This guide will show you the steps to crawl XKCD.

First off, the `core` expects, both for `init` and `update`, a message compliant to the [schema definition for https strategies](https://github.com/neume-network/schema/blob/main/src/schema.mjs).

The `init` function message should provide the starting state of the crawling. For XKCD, we would write something like:
```
{
    write: null,
    messages: [
      {
        type: "https",
        commissioner: name,
        version,
        options: {
          url: https://xkcd.com/1/info.0.json,
          method: "GET",
          header: null,
          body: null
        },
        results: null,
        error: null,
      },
    ],
  };
```

* `write`: specifies the data to be written in string format. `null` during init, as there is no data
* `type`: the protocol. must be `https` for this type of strategy
* `commissioner`: ??
* `version`: can be anything, it's currently not used
* `options`:
  * `url`: the URL pointing to the first chunk to crawl. First page on XKCD is `1`
  * `method`: GET, POST
  * `headers`: if any specific header should be sent to the source, it shall be specified here (for instance authorization headers)
  * `body`: same, value must be type of `String`
* `results`: this field will be used by the core to pass the output of the crawling to the `update` function

Once the `init` message has been returned, the `core` will fetch the first chunk of data and pass it to `update`. The `update` function can perform operations on the result and store it and/or fetch more data by returning messages in a similar way to `init`. For each non-exit message returned by the `update`, the function is called with the results of the crawl.

The function, ideally, should take care of the following:

* validate the outcome of the crawl
* validate the data against a schema
* prepare the data for storing. This step should make sure that any future consumer of the data will find all that's required to process it.
* define if and what to crawl next

The `core` provided message will contain the following data:
```
{
    "error": string,
    "results": object
}
```

* error: null or the crawling error message
* results: the direct output of the crawler

The strategy will have to

> validate the outcome of the crawl
```
if(message.error) {
    // handle the error
    console.error(message.error);
    
    // continue the crawling if possible (in this case, we are not able to retrieve the next page)
    return {
      write: null,
      messages: [],
    };
}
```

> validate the data
```
const data = message.results;

if (validate(data)) {
    console.error(validate.errors);
    return {
      type: "exit",
      version: "1.0"
    };
}
```

> Prepare the data for storage
```
// Simply dumping the data into a string is sufficient in this case
const toBeStored = JSON.stringify(data);
```

> Define if and what to crawl next
```
// Let's assume we want to crawl up to MAX_PAGE
const { num } = message.results;
if(num >= MAX_PAGE) {
  return {
    type: "exit",
    version: "1.0"
  };
}

// Instruct core to crawl next page
let options = {
  url: templateURI(num + 1),
  method: "GET"
}
```

> Return the message back to the `core`
```
return {
    write: toBeStored,
    messages: [
      {
        type: "https",
        commissioner: name,
        version,
        options: options,
        results: null,
        error: null,
      },
    ],
  };
```

Check out the [code](https://github.com/neume-network/strategies/blob/main/src/strategies/get-xkcd/extractor.mjs) for more details.

### web3 crawler
TBD