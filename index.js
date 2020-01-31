'use strict';

const express = require('express');
const app = express();

const database = require('./src/database');

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

app.post('/addApplicant', (req, res) => {
  console.info(`Received post data: ${req.body}`);

  const applicant = req.body;
  database
    .putApplicantInDB(applicant)
    .then(response => {
      res.status(200).send({data: response});
    })
    .catch(err => {
      res.status(500).send({data: err});
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
