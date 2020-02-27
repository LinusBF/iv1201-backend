'use strict';
const fs = require('fs');
const guid = require('uuid').v4;
const axios = require('axios');
const {Datastore} = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();

const getDumpAsObject = dumpName => {
  const dump = fs.readFileSync(__dirname + dumpName);
  return JSON.parse(dump.toString());
};

const createFirebaseUser = dumpObj => {
  dumpObj.email =
    dumpObj.email !== 'NULL'
      ? dumpObj.email
      : `${dumpObj.firstName}.${dumpObj.lastName}@company.com`;
  dumpObj.password = dumpObj.password !== 'NULL' ? dumpObj.password : guid().substr(0, 12);
  return axios
    .post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API}`,
      {email: dumpObj.email, password: dumpObj.password, returnSecureToken: true}
    )
    .then(res => {
      dumpObj.userId = res.data.localId;
      return dumpObj;
    });
};

const saveCreatedPasswords = dumpObj => {
  fs.appendFileSync(__dirname + '/password_dump.csv', `${dumpObj.email} | ${dumpObj.password}\n`);
  return dumpObj;
};

const transformToDTOFromDumpApplication = dumpObj => {
  dumpObj.ssn = dumpObj.ssn.replace('-', '');
  dumpObj.role_name = undefined;
  dumpObj.password = undefined;
  dumpObj.expertise.map(e => (e.yearsExp = parseFloat(e.yearsExp)));
  dumpObj.applyDate = new Date().toISOString().substr(0, 10);
  dumpObj.approved = false;
  dumpObj.letter = 'Part of migration from old DB';
  return dumpObj;
};

const transformToDTOFromDumpRecruiter = dumpObj => {
  return {userId: dumpObj.userId};
};

const putEntityInDB = (kindOfThing, thingToSave) => {
  const keyForThing = datastore.key(kindOfThing);
  const entityToSave = {
    key: keyForThing,
    data: thingToSave,
  };
  return datastore.save(entityToSave).then(response => response[0].mutationResults[0].key);
};

const migrateApplicants = () => {
  const applicantPromises = getDumpAsObject('/json_dump.json').map(createFirebaseUser);
  Promise.all(applicantPromises)
    .then(applicants => {
      console.log(applicants);
      return Promise.all(
        applicants
          .map(saveCreatedPasswords)
          .map(transformToDTOFromDumpApplication)
          .map(a => putEntityInDB(process.env.JOB_APPLICATION_KIND_DEV, a))
      );
    })
    .then(results => {
      console.log(results);
      console.log('Done');
    })
    .catch(err => {
      console.error(err);
    });
};

const migrateRecruiters = () => {
  const recruiterPromises = getDumpAsObject('/json_dump_recruiter.json').map(createFirebaseUser);
  Promise.all(recruiterPromises)
    .then(recruiters => {
      console.log(recruiters);
      return Promise.all(
        recruiters
          .map(saveCreatedPasswords)
          .map(transformToDTOFromDumpRecruiter)
          .map(r => putEntityInDB(process.env.RECRUITER_KIND_DEV, r))
      );
    })
    .then(results => {
      console.log(results);
      console.log('Done');
    })
    .catch(err => {
      console.error(err);
    });
};

module.exports = {
  migrateApplicants,
  migrateRecruiters,
};
