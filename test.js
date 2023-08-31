const http = require('http');

const postData = JSON.stringify({
  "serverKey": "NodeListServerDefaultKey",
});

const options = {
  hostname: 'spotty-frogs-watch.loca.lt',
  port: 80,
  path: '/list',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  //console.log(`STATUS: ${res.statusCode}`);
  //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
    content = chunk;
  });
  res.on('end', () => {  
  req.write(postData);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData); 

this.httpServer = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.writeHead(200);
  res.end(content);
}.bind(this));

this.httpServer.listen(8082, function() {
  // Stats server
  console.log("* \u001B[33mLoaded stats server on port " + 8082 + "\u001B[0m");
}.bind(this));