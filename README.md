# express-aglio

easily use [aglio](https://github.com/danielgtaylor/aglio) with [express](https://expressjs.com/) to serve documentation for your api.

Don't know what aglio is? its an awesome commandline tool/node library tool for writing and compiling docs written in the [Api Blueprint Language (APIB)](https://apiblueprint.org/), which is really similar to markdown. It makes doc writing a breeze.

# install
---

` npm install --save express-aglio `

# features

- watch fs and recompile changes with [node-watch](https://www.npmjs.com/package/node-watch)
- automatically serve docs with `express.static()` (default uri is `/docs`)
- save time by devving express app and docs at the same time from same server. easy peasy lemon squeezy.

# usage
```js
var app = require('express')();

require('express-aglio')(app,{
	source: __dirname+ '/docs/source/index.apib',
	output: __dirname+ '/docs/html/index.html'
});

app.listen(3000);
```

# options
```js
{
source: '',//input path/file eg /docs/source/index.apib OR /docs/source
output: '',//output path/file eg /docs/html/index.html OR /docs/html
watch: true, //watch source dir/file for changes.
expose: true, //serve docs with express
uri: '/docs', //path to serve docs from
debug: true, // disable the default logger
log: function(){ // a simple logger, you can override
	this.debug && console.log.apply(console,arguments);
},
aglioOptions:{}, //options to pass specifically to aglio(themes, etc checkout aglio npm module's api for more info)
}
```
# testing
(soon-*ish*)

