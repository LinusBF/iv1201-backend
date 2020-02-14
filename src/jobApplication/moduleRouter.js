'use strict';

const {validateApplicationModel, validateCountAndOffset} = require('../modelValidator');
const {submitApplication, getApplications} = require('./jobApplicationController');

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
          .catch(err => {
            console.error(err);
            res.status(500).send('Something failed! Check the logs!');
          });
      })
      .catch(error => {
        res.status(400).send({errors: error.pathErrors ? error.pathErrors : error.message});
      });
  });

  router.get('/application', (req, res) => {
    console.info(`Received request to get all applications`);
    const count = parseInt(req.query.count);
    const offset = parseInt(req.query.offset);
    if (validateCountAndOffset(count, offset)) {
      getApplications(count, offset)
        .then(applications => {
          console.debug(`Returned ${applications.length} applications`);
          res.status(200).send({applications});
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Something failed! Check the logs!');
        });
    } else {
      res
        .status(400)
        .send(
          `Please specify count and offset query parameters to be numbers or leave them undefined!`
        );
    }
  });
};
