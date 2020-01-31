'use strict';

const chai = require('chai');
const expect = chai.expect;
const utils = require('@google-cloud/nodejs-repo-tools');
const proxyquire = require('proxyquire');

const objectToSaveToDatabase = {test: 'test'};

class Storage {
  constructor() {}

  key(table, id) {
    return `${table}${id}`;
  }

  save(entity) {
    expect(entity.data).to.be.eq(objectToSaveToDatabase);
    return new Promise(res => res([true]));
  }
}

const {putApplicantInDB} = proxyquire('../src/database.js', {
  '@google-cloud/datastore': {Datastore: Storage},
});

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

describe('Database Controller Test', function() {
  it('Should save the test object to the database', function() {
    return putApplicantInDB(objectToSaveToDatabase)
      .then(result => {
        expect(result).to.be.true;
      })
      .catch(err => {
        expect.fail(err);
      });
  });
});
