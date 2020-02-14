'use strict';
const Schema = require('validate');
const dateRegex = /(19|20)[0-9][0-9]-([0][0-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|[3][0-1])/;
const dateErrMsg = 'Must be a valid date!';

const applicationSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  applyDate: {
    type: String,
    required: true,
    match: dateRegex,
    message: dateErrMsg,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  ssn: {
    type: String,
    required: true,
    length: {min: 10, max: 12},
  },
  email: {
    type: String,
    required: true,
  },
  expertise: {
    type: Array,
    each: {type: String},
  },
  available: [
    {
      from: {type: String, match: dateRegex, message: dateErrMsg},
      to: {type: String, match: dateRegex, message: dateErrMsg},
    },
  ],
  letter: {
    type: String,
    required: true,
  },
});

/**
 * @param applicationPayload Application
 * @return {Promise<true>|Promise<Schema.ValidationError>}
 */
const validateApplicationModel = applicationPayload => {
  return new Promise((resolve, reject) => {
    if (typeof applicationPayload === 'undefined') reject(new Error('data is undefined!'));
    const errors = applicationSchema.validate(applicationPayload);
    if (errors.length < 1) resolve(true);
    else {
      const error = new Error('Bad format!');
      error.pathErrors = errors.map(err => ({path: err.path, error: err.message}));
      reject(error);
    }
  });
};

/**
 * @param userId String
 * @return {boolean}
 */
const validateUserId = userId => {
  return typeof userId === 'string' && userId.length > 0;
};

module.exports = {
  validateApplicationModel,
  validateUserId,
};
