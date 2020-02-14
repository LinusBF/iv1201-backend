'use strict';

const {putEntityInDB, getDocumentsByField} = require('../database');

const APPLICATION_KIND = process.env.JOB_APPLICATION_KIND;
const USER_ID_FIELD = process.env.USER_FIELD_NAME;

/**
 *
 * @param application
 * @param overrideId
 * @return {Promise<never>|Promise<Number>|*}
 */
const submitApplication = (application, overrideId) => {
  return putEntityInDB(application, APPLICATION_KIND, overrideId);
};

/**
 * @param userId String
 * @return {Promise<never> | Promise<Application>}
 */
const getApplicationByUser = userId => {
  return getDocumentsByField(APPLICATION_KIND, USER_ID_FIELD, userId).then(
    docs => docs.sort((a, b) => a.applyDate < b.applyDate)[0]
  );
};

module.exports = {
  submitApplication,
  getApplicationByUser,
};
