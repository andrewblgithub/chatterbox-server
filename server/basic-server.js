var http = require('http');
var rh = require('./request-handler');

var port = process.env.PORT || 3000;

http.createServer(rh.requestHandler).listen(port);

console.log('Listening on port ' + port);