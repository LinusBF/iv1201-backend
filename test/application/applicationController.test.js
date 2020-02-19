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
const startDate = new Date('2020-01-01');
for (let i = 0; i < 50; i++) {
  const nextDate = new Date(startDate);
  nextDate.setDate(nextDate.getDate() + i);
  listOfObjectsInDB[i] = {
    test: `test${i}`,
    num: i % 5,
    applyDate: nextDate.toISOString().substring(0, 10),
    userId: guid(),
    kind: i < 25 ? 'TestKind' : 'TestKind2',
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

const {putEntityInDB, getDocumentsByField, getAllOfKind} = proxyquire('../../src/database.js', {
  '@google-cloud/datastore': {Datastore: Storage},
});
const {submitApplication, getApplicationByUser, getApplications} = proxyquire(
  '../../src/application/applicationController.js',
  {
    '../database.js': {putEntityInDB, getDocumentsByField, getAllOfKind},
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
      return new Promise(res =>
        res([
          {
            mutationResults: [{key: {path: [{id: `GeneratedId`}]}}],
          },
        ])
      );
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
            .filter(testObj => testObj[queriedField] === queriedNeedle)
            .map(obj => {
              const sym = Symbol('KEY');
              obj[sym] = {id: 'GeneratedKey'};
              return obj;
            }),
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

describe('Job Application Controller - Get All Applications', function() {
  let queriedKind, queriedSort, queriedOffset, queriedLimit;
  const sorter = (a, b) => {
    if (a[queriedSort] < b[queriedSort]) return 1;
    if (a[queriedSort] > b[queriedSort]) return -1;
    return 0;
  };

  before(function() {
    queryOverRide = function(kind) {
      queriedKind = kind;
      return {
        order: s => {
          queriedSort = s;
          return {
            offset: o => {
              queriedOffset = o;
              return {
                limit: n => {
                  queriedLimit = n;
                  return {queryOfKind: kind};
                },
              };
            },
          };
        },
      };
    };
    resultOverRide = function(query) {
      expect(queriedKind).to.be.eql(query.queryOfKind);
      return new Promise(res =>
        res([
          listOfObjectsInDB
            .filter(testObj => testObj.kind === queriedKind)
            .sort(sorter)
            .slice(queriedOffset)
            .splice(0, queriedLimit)
            .map(obj => {
              const sym = Symbol('KEY');
              obj[sym] = {id: 'GeneratedKey'};
              return obj;
            }),
        ])
      );
    };
  });

  after(function() {
    queryOverRide = () => {};
    resultOverRide = () => {};
  });

  it('should return the correct amount of applications', function() {
    return expect(getApplications(10, 0)).to.eventually.have.length(10);
  });

  it('should return the applications in the right order', function() {
    const needleApplication = listOfObjectsInDB[24];
    return getApplications(10, 0)
      .then(arr => {
        return expect(arr[0]).to.be.eq(needleApplication);
      })
      .catch(err => expect.fail(err));
  });
});
