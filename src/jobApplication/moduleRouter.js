'use strict';

const {validateApplicationModel} = require('../modelValidator');
const {submitApplication} = require('./jobApplicationController');

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
};
