var app = require('express')();

require('../index')(app,{
	source: __dirname+ '/docs/source/index.apib',
	output: __dirname+ '/docs/html/index.html'
});

app.listen(3000);