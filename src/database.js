'use strict';

const {Datastore} = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();

const putApplicantInDB = (thingToSave, idOfThing) => {
  // The kind for the new entity
  const kind = 'Applicant';

  // The Cloud Datastore key for the new entity
  const applicantKey = datastore.key(idOfThing ? [kind, idOfThing] : kind);

  // Prepares the new entity
  const applicant = {
    key: applicantKey,
    data: thingToSave,
  };

  return datastore.save(applicant).then(response => response[0]);
};

module.exports = {
  putApplicantInDB,
};
