'use strict';

const {getDocumentsByField} = require('../database');

const USER_STATUS_KIND = process.env.USER_STATUS_KIND;
const USER_FIELD_NAME = process.env.USER_FIELD_NAME;

const getUserStatus = uid => {
  return getDocumentsByField(USER_STATUS_KIND, USER_FIELD_NAME, uid);
};

module.exports = {getUserStatus};
