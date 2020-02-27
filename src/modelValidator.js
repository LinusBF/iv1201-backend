'use strict';
const Schema = require('validate');
const dateRegex = /(19|20)[0-9][0-9]-([0][0-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|[3][0-1])/;
const dateErrMsg = 'Must be a valid date!';
const statusRegex = /approved|rejected|pending/;
const statusErrMsg = "Must be one of 'approved', 'rejected', 'pending'!";

const applicationSchema = new Schema({
  userId: {type: String, required: true},
  applyDate: {type: String, required: true, match: dateRegex, message: dateErrMsg},
  approved: {type: String, required: true, match: statusRegex, message: statusErrMsg},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  ssn: {type: String, required: true, length: {min: 10, max: 12}},
  email: {type: String, required: true},
  expertise: [
    {
      name: {type: String, required: true},
      yearsExp: {type: Number, required: true},
    },
  ],
  available: [
    {
      from: {type: String, required: true, match: dateRegex, message: dateErrMsg},
      to: {type: String, required: true, match: dateRegex, message: dateErrMsg},
    },
  ],
  letter: {type: String, required: true},
});

const statusUpdateSchema = new Schema({
  status: {type: String, required: true, match: statusRegex, message: statusErrMsg},
  oldStatus: {type: String, required: true, match: statusRegex, message: statusErrMsg},
});

/**
 * @param schemaToTestAgainst Schema
 * @param thingToTest Object
 * @return {Promise<true>|Promise<Schema.ValidationError>}
 */
const validateSchema = (schemaToTestAgainst, thingToTest) => {
  return new Promise((resolve, reject) => {
    if (typeof thingToTest === 'undefined') reject(new Error('data is undefined!'));
    const errors = schemaToTestAgainst.validate(thingToTest);
    if (errors.length < 1) resolve(true);
    else {
      const error = new Error('Bad format!');
      error.pathErrors = errors.map(err => ({path: err.path, error: err.message}));
      console.error(error.pathErrors);
      reject(error);
    }
  });
};

/**
 * @param applicationPayload Application
 * @return {Promise<true>|Promise<Schema.ValidationError>}
 */
const validateApplicationModel = applicationPayload => {
  return validateSchema(applicationSchema, applicationPayload);
};

/**
 * @param applicationId String
 * @param statusPayload Object
 * @return {Promise<void>}
 */
const validateStatusUpdate = (applicationId, statusPayload) => {
  return validateSchema(statusUpdateSchema, statusPayload).then(() => {
    return validateApplicationId(applicationId)
      ? true
      : Promise.reject(new Error('Invalid application ID!'));
  });
};

/**
 * @param count {String|undefined}
 * @param offset {String|undefined}
 * @return {boolean}
 */
const validateCountAndOffset = (count, offset) => {
  return (
    (typeof count === 'undefined' || !Number.isNaN(parseInt(count))) &&
    (typeof offset === 'undefined' || !Number.isNaN(parseInt(offset)))
  );
};

/**
 * @param applicationId {String}
 * @return {boolean}
 */
const validateApplicationId = applicationId => {
  return typeof applicationId === 'string' && !Number.isNaN(parseInt(applicationId));
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
  validateStatusUpdate,
  validateCountAndOffset,
  validateApplicationId,
  validateUserId,
};
