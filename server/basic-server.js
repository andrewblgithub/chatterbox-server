var http = require('http');
var rh = require('./request-handler');

var port = 3000;

var ip = '127.0.0.1';

http.createServer(rh.requestHandler).listen(port, ip);

console.log('Listening on http://' + ip + ':' + port);