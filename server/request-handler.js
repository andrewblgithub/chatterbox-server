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
  
  // The outgoing status.
  var statusCode = 200;
  
  // Check endpoint and method 
  if (request.url.slice(0, 16) === '/classes/message') {
    if (request.method === 'GET') {

    } else if (request.method === 'POST') {
      statusCode = 201;
      var message;
      request.on('data', (data) => {
        message = JSON.parse(data);
        if (!message['roomname']) {
          message['roomname'] = undefined;
        }
        message['createdAt'] = new Date();
        results.push(message);
      });
    }
  } else {
    statusCode = 404;
  }

  // Set headers
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  response.writeHead(statusCode, headers);

  response.end(JSON.stringify({ 'results': results.reverse() }));
};

exports.requestHandler = requestHandler;