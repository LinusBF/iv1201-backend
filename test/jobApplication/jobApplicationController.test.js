'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const uuid = require('uuid');
const guid = uuid.v4;
const utils = require('@google-cloud/nodejs-repo-tools');
const proxyquire = require('proxyquire');

chai.use(chaiAsPromised);

const objectToSaveToDatabase = {test: 'test'};
const listOfObjectsInDB = [];
for (let i = 0; i < 50; i++) {
  listOfObjectsInDB[i] = {
    test: `test${i}`,
    num: i % 5,
    userId: guid(),
    kind: i < 25 ? process.env.JOB_APPLICATION_KIND : 'testKind2',
  };
}

let keyOverRide = () => {};
let saveOverRide = () => {};
let queryOverRide = () => {};
let resultOverRide = () => {};

class Storage {
  constructor() {}
  key(kindOrKindAndId) {
    return keyOverRide(kindOrKindAndId);
  }
  save(entity) {
    return saveOverRide(entity);
  }
  createQuery(kind) {
    return queryOverRide(kind);
  }
  runQuery(query) {
    return resultOverRide(query);
  }
}

const {putEntityInDB, getDocumentsByField} = proxyquire('../../src/database.js', {
  '@google-cloud/datastore': {Datastore: Storage},
});
const {submitApplication, getApplicationByUser} = proxyquire(
  '../../src/jobApplication/jobApplicationController.js',
  {
    '../database.js': {putEntityInDB, getDocumentsByField},
  }
);

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

describe('Job Application Controller - Submit application', function() {
  before(function() {
    keyOverRide = function(kindOrKindAndId) {
      if (Array.isArray(kindOrKindAndId)) return kindOrKindAndId[1];
      else return `GeneratedId`;
    };
    saveOverRide = function() {
      return new Promise(res => res([{path: ['Kind', 'GeneratedId']}]));
    };
  });

  after(function() {
    keyOverRide = () => {};
    saveOverRide = () => {};
  });

  it('should return the right part of the query result', function() {
    return expect(submitApplication(objectToSaveToDatabase)).to.eventually.be.eql('GeneratedId');
  });
});

describe('Job Application Controller - Get Application by User ID', function() {
  let queriedKind, queriedField, queriedNeedle;

  before(function() {
    queryOverRide = function(kind) {
      queriedKind = kind;
      return {
        filter: (f, s, n) => {
          queriedField = f;
          queriedNeedle = n;
          return {queryOfKind: kind};
        },
      };
    };
    resultOverRide = function(query) {
      expect(queriedKind).to.be.eql(query.queryOfKind);
      return new Promise(res =>
        res([
          listOfObjectsInDB
            .filter(testObj => testObj.kind === queriedKind)
            .filter(testObj => testObj[queriedField] === queriedNeedle),
        ])
      );
    };
  });

  after(function() {
    queryOverRide = () => {};
    resultOverRide = () => {};
  });

  it('should return the correct job application', function() {
    const needleApplication = listOfObjectsInDB[15];
    const userIdToSearchFor = needleApplication.userId;
    return expect(getApplicationByUser(userIdToSearchFor)).to.eventually.be.eql(needleApplication);
  });
});