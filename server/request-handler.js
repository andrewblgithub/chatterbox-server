var fs = require('fs');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

// Results array with message objects
var results = [{'username': 'Hackerman', 'text': 'This is a test message', 'roomname': 'Generic Room', 'createdAt': new Date()}];

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  // Default headers
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';

  // Serve client html
  if (request.url === '/') {
    response.writeHead(200, headers);
    response.end('Client goes here!');
  }
  
  // Check endpoint and method 
  if (request.url.slice(0, 16) === '/classes/message') {
    if (request.method === 'GET') {
      response.writeHead(200, headers);
      response.end(JSON.stringify({ 'results': results.reverse() }));
    } else if (request.method === 'POST') {
      var message;
      request.on('data', (data) => {
        message = JSON.parse(data);
        if (!message['roomname']) {
          message['roomname'] = undefined;
        }
        message['createdAt'] = new Date();
        results.push(message);
        response.writeHead(201, headers);
        response.end(JSON.stringify({ 'results': results.reverse() }));
      });
    }
  } else {
    response.writeHead(404, headers);
    response.end();
  }


};

exports.requestHandler = requestHandler;