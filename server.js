const myapp = require('./app');
const http = require('http');

const port = process.env.PORT;
myapp.set('port', port);
const server = http.createServer(myapp);

server.listen(port);