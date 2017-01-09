# local-video-library
Finds files in your local disk drives and populates each of them with metadata (from Trakt.tv).

### Install

    npm install local-video-library

### Usage

```js
console.time('test');

const traktId = <trakt.tv client_id>;
const paths = ['/foo/bar'];
const debug = true;

var Parser = require('local-video-library');
var library = new Parser(traktId, paths, debug);

library.scan(paths).then((localLibrary) => {
    console.log('results', localLibrary);
    console.timeEnd('test');
})
```

You can store localLibrary as you wish. To update without having to rescan everything and avoid making new calls to Trakt, use:

```js
library.update(localLibrary).then(console.log);
```

## License
The MIT license - Jean van Kasteel <vankasteelj@gmail.com>