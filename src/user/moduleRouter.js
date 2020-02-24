'use strict';

const {getApplicationByUser} = require('../application/applicationController');
const {validateUserId} = require('../modelValidator');

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
};
