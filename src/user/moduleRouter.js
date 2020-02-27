'use strict';

const {getApplicationByUser} = require('../application/applicationController');
const {validateUserId} = require('../modelValidator');
const {getUserStatus} = require('./userController');

/**
 *
 * @param router express.Router
 */
module.exports = router => {
  router.get('/user/:userId/application', (req, res) => {
    console.info(`Received request to get application by user`);
    if (validateUserId(req.params.userId)) {
      getApplicationByUser(req.params.userId)
        .then(application => {
          if (application === false) {
            res.status(404).send('Could not find job application from that user!');
          } else {
            res.status(200).send({application});
          }
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Something failed! Check the logs!');
        });
    }
  });

  router.get('/user/:userId/user-status', (req, res) => {
    console.info(`Received request to get status of user`);
    if (validateUserId(req.params.userId)) {
      getUserStatus(req.params.userId)
        .then(user => {
          if (user === false) {
            res.status(200).send('applicant');
          } else {
            res.status(200).send('admin');
          }
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Something failed! Check the logs!');
        });
    }
  });
};
