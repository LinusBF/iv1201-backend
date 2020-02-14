'use strict';

const {
  validateApplicationModel,
  validateCountAndOffset,
  validateApplicationId,
  validateStatusUpdate,
} = require('../modelValidator');
const {
  submitApplication,
  getApplications,
  getApplicationById,
  updateStatusOfApplication,
} = require('./jobApplicationController');

const errResponse = (err, res) => {
  console.error(err);
  res.status(500).send('Something failed! Check the logs!');
};

/**
 *
 * @param router express.Router
 */
module.exports = router => {
  router.post('/application', (req, res) => {
    console.info(`Received request to submit application`);
    const applicationToAdd = req.body.data;
    const overrideId = req.body.overrideId;
    validateApplicationModel(applicationToAdd)
      .then(() => {
        return submitApplication(applicationToAdd, overrideId)
          .then(result => {
            console.debug(result);
            res.status(200).send('Application successfully submitted');
          })
          .catch(err => errResponse(err, res));
      })
      .catch(error => {
        res.status(400).send({errors: error.pathErrors ? error.pathErrors : error.message});
      });
  });

  router.get('/application', (req, res) => {
    console.info(`Received request to get all applications`);
    const count = req.query.count;
    const offset = req.query.offset;
    if (validateCountAndOffset(count, offset)) {
      getApplications(count ? parseInt(count) : undefined, offset ? parseInt(offset) : undefined)
        .then(applications => {
          console.debug(`Returned ${applications.length} applications`);
          res.status(200).send({applications});
        })
        .catch(err => errResponse(err, res));
    } else {
      res
        .status(400)
        .send(
          `Please specify count and offset query parameters to be numbers or leave them undefined!`
        );
    }
  });

  router.get('/application/:applicationId', (req, res) => {
    console.info(`Received request to get an application by id`);
    const applicationId = req.params.applicationId;
    if (validateApplicationId(applicationId)) {
      getApplicationById(applicationId)
        .then(application => {
          if (typeof application !== 'undefined') {
            res.status(200).send({application});
          } else {
            res.status(404).send(`Could not find a job application with that ID!`);
          }
        })
        .catch(err => errResponse(err, res));
    } else {
      res.status(400).send(`Please specify a valid application id (string)!`);
    }
  });

  router.post('/application/:applicationId/status', (req, res) => {
    console.info(`Received request to get an application by id`);
    const applicationId = req.params.applicationId;
    validateStatusUpdate(applicationId, req.body)
      .then(() => {
        return updateStatusOfApplication(applicationId, req.body.status, req.body.oldStatus)
          .then(application => {
            res.status(200).send({application});
          })
          .catch(err => {
            if (err.oldValue) {
              res.status(409).send(`Outdated old status provided!`);
            } else {
              return errResponse(err, res);
            }
          });
      })
      .catch(error => {
        res.status(400).send({errors: error.pathErrors ? error.pathErrors : error.message});
      });
  });
};
