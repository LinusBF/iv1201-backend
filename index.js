'use strict';

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  console.log('Hello world received a request.');

  res.status(200).send({data: 'This is backend talking via GET'});
});

app.post('/', (req, res) => {
  console.log('Hello world received a POST request.');
  console.info(`Received post data: ${req.body}`);

  res.status(200).send({data: 'This is backend talking via POST'});
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
