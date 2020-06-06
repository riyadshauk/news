// import express from 'express';
// import path from 'path';
// import indexRouter from './routes/index.js';

const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();
// const __dirname = path.resolve(path.dirname(''));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// export default app;
module.exports = app;
