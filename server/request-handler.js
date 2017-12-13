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

  // Pretty hacky, but routes for client dependencies
  if (
    request.url === '/styles/styles.css' ||
    request.url === '/bower_components/bootstrap/dist/css/bootstrap.css' ||
    request.url === '/bower_components/bootstrap/dist/js/bootstrap.js' ||
    request.url === '/bower_components/jquery/dist/jquery.js' ||
    request.url === '/bower_components/underscore/underscore.js' ||
    request.url === '/scripts/app.js'
  ) {
    var file = './client' + request.url;
    fs.readFile(file, function(err, data) {
      if (data) {
        data = data.toString();
      }
      var headers = Object.assign({}, defaultCorsHeaders);
      if (
        request.url === '/styles/styles.css' ||
        request.url === '/bower_components/bootstrap/dist/css/bootstrap.css'
      ) {
        headers['Content-Type'] = 'text/css';
      } else {
        headers['Content-Type'] = 'text/javascript';
      }
      response.writeHead(200, headers);
      response.end(data);
    });
  }

  // Serve client html
  if (request.url === '/' || request.url.slice(0, 11) === '/?username=') {
    fs.readFile('./client/index.html', function(err, data) {
      data = data.toString();
      var headers = Object.assign({}, defaultCorsHeaders);
      headers['Content-Type'] = 'text/html';
      response.writeHead(200, headers);
      response.end(data);
    });
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
        var results;
        if (data) {
          results = JSON.parse(data.toString());
        }
        response.writeHead(200, headers);
        response.end(JSON.stringify({ 'results': results.reverse() }));
      });
    // Post data to file and return results
    } else if (request.method === 'POST') {
      var messages;
      var message = '';
      // Collect data from stream
      request.on('data', (data) => {
        message = message + data.toString();
      });
      // When data is ready, continue
      request.on('end', (data) => {
        message = JSON.parse(message);
        if (!message['roomname']) {
          message['roomname'] = undefined;
        }
        // TODO: Add object id
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
    // Respond with options
    } else if (request.method === 'OPTIONS') {
      response.writeHead(200, defaultCorsHeaders);
      response.end();
    } else {
      response.writeHead(404, headers);
      response.end();
    }
  }


};

exports.requestHandler = requestHandler;