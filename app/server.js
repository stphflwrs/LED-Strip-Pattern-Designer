const http = require('http'),
      server = http.createServer(handleRequest),
      fs = require('fs'),
      path = require('path'),
      Q = require('q');

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

function handleRequest(req, res) {
  console.log(`Request for: ${req.url}`);

  if (req.url == '/') {
    sendIndex(req, res);
    return;
  } else if (/\.js|\.css/.test(path.extname(req.url))) {
    sendStaticFile(req, res);
    return;
  } else {
    res.end('Error');
    return;
  }
}

function sendStaticFile(req, res) {
  fs.readFile(`public/${req.url}`, (err, content) => {
    if (err) {
      console.log(err);
      res.end('500 Error');
    } else {
      res.end(content);
    }
  });
}

function sendIndex(req, res) {
  fs.readFile('public/index.html', (err, content) => {
    if (err) {
      console.log(err);
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end(content);
    }
  });
}
