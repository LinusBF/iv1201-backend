'use strict';

const {
  putEntityInDB,
  getAllOfKind,
  getDocumentsByField,
  getDocumentsById,
  setFieldInDocument,
} = require('../database');

const APPLICATION_KIND =
  process.env[`JOB_APPLICATION_KIND${process.env.NODE_ENV === 'production' ? '' : '_DEV'}`];
const SORT_FIELD = process.env.SORT_FIELD_NAME;
const USER_ID_FIELD = process.env.USER_FIELD_NAME;
const STATUS_FIELD = process.env.STATUS_FIELD_NAME;

/**
 *
 * @param application
 * @param overrideId
 * @return {Promise<never>|Promise<Number>|*}
 */
const submitApplication = (application, overrideId) => {
  return putEntityInDB(application, APPLICATION_KIND, overrideId).then(res => res.path[0].id);
};

/**
 * @param count {Number|undefined}
 * @param offset {Number|undefined}
 * @return {Promise<never> | Promise<[Application]>}
 */
const getApplications = (count, offset) => {
  return getAllOfKind(APPLICATION_KIND, SORT_FIELD, count ? count : 20, offset ? offset : 0);
};

/**
 * @param id String
 * @return {Promise<never> | Promise<Application>}
 */
const getApplicationById = id => {
  return getDocumentsById(APPLICATION_KIND, parseInt(id)).then(docs => docs[0]);
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

/**
 * @param id String
 * @param newStatus Boolean
 * @param oldStatus Boolean
 * @return {Promise<never>|Promise<Boolean>}
 */
const updateStatusOfApplication = (id, newStatus, oldStatus) => {
  let updatedApplication;
  return getApplicationById(id)
    .then(application => {
      if (
        typeof application[STATUS_FIELD] === 'undefined' ||
        application[STATUS_FIELD] === oldStatus
      ) {
        updatedApplication = application;
        updatedApplication[STATUS_FIELD] = newStatus;
        return setFieldInDocument(APPLICATION_KIND, parseInt(id), STATUS_FIELD, newStatus);
      } else {
        const oldValueError = new Error('The status has already been updated!');
        oldValueError.oldValue = true;
        return Promise.reject(oldValueError);
      }
    })
    .then(success =>
      success ? updatedApplication : Promise.reject(new Error(`Transaction failed!`))
    );
};

module.exports = {
  submitApplication,
  getApplications,
  getApplicationById,
  getApplicationByUser,
  updateStatusOfApplication,
};
