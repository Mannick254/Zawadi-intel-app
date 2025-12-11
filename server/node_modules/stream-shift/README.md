# stream-shift

Returns the next buffer/object in a stream's readable queue

```
npm install stream-shift
```

[![build status](https://img.shields.io/travis/mafintosh/stream-shift.svg?style=flat)](https://travis-ci.org/mafintosh/stream-shift)

## Usage

``` js
var shift = require('stream-shift')

console.log(shift(someStream)) // first item in its buffer
```

## Credit

Thanks [@dignifiedquire](https://github.com/dignifiedquire) for making this work on node 6

## License

MIT
