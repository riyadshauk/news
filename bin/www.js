#!/usr/bin/env node

/**
 * Module dependencies.
 */
// import http from 'http';
// import app from '../app.js';
const process = require('process');
const http = (process.env.NODE_ENV || '').toLowerCase().indexOf('prod') !== 0 ?
  require('http') : require('https');
const app = require('../app-server');
const { prod, test } = require('../public-es5/javascripts/config');

const configPort = (process.env.NODE_ENV || '').toLowerCase().indexOf('prod') !== 0 ?
  test.port : prod.port;

/**
 * Get port from environment (if applicable) and store in Express.
 */
const port = normalizePort(process.env.PORT || configPort);
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  console.log(`Application-server listening on port ${port}!\n\nPlease navigate to http://localhost:${port} to view this website in your favorite browser.`);
}
