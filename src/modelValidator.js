'use strict';
const Schema = require('validate');

const applicationSchema = new Schema({
  userId: {
    type: String,
    required: true,
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
      type: Array,
      each: {type: String},
    },
  ],
  letter: {
    type: String,
    required: true,
  },
});

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

module.exports = {
  validateApplicationModel,
};
