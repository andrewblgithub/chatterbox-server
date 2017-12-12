var fs = require('fs');
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

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
  if (request.url.slice(0, 17) === '/classes/messages') {
    // Send get results
    if (request.method === 'GET') {
      // Wait for results from readFile before responding
      fs.readFile('messages.txt', (err, data)=> {
        if (err) {
          throw err;
        }
        var results = JSON.parse(data);
        response.writeHead(200, headers);
        response.end(JSON.stringify({ 'results': results.reverse() }));
      });
    // Post data to file and return results
    } else if (request.method === 'POST') {
      var messages;
      var message;
      request.on('data', (data) => {
        message = JSON.parse(data);
        if (!message['roomname']) {
          message['roomname'] = undefined;
        }
        message['createdAt'] = new Date();
        // Push new data to results
        fs.readFile('messages.txt', (err, data) => {
          if (err) {
            throw err;
          }
          messages = JSON.parse(data);
          messages.push(message);
          fs.writeFile('messages.txt', JSON.stringify(messages), (err) => {
            if (err) {
              throw err;
            }
            response.writeHead(201, headers);
            response.end(JSON.stringify({ 'results': messages.reverse() }));
          });
        });
      });
    } else if (request.method === 'OPTIONS') {
      response.writeHead(200, defaultCorsHeaders);
      response.end();
    }
  } else {
    response.writeHead(404, headers);
    response.end();
  }


};

exports.requestHandler = requestHandler;