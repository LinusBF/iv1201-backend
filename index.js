'use strict';

const express = require('express');
const app = express();
//const attachJobApplicationEndpoints = require('./src/jobApplication/moduleRouter');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const router = express.Router();

router.get('/', (req, res) => {
  console.log('Received a request at root?');
  res.status(200).send({
    data: 'Please make a request to a valid endpoint',
    envChecker:
      process.env.NODE_ENV === 'development'
        ? process.env.JOB_APPLICATION_KIND
        : process.env.JOB_APPLICATION_KIND_DEV,
  });
});

//attachJobApplicationEndpoints(router);
app.use('/', router);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
