'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const utils = require('@google-cloud/nodejs-repo-tools');
const proxyquire = require('proxyquire');

chai.use(chaiAsPromised);

const objectToSaveToDatabase = {test: 'test'};
const listOfObjectsInDB = [];
for (let i = 0; i < 50; i++) {
  listOfObjectsInDB[i] = {test: `test${i}`, kind: i < 25 ? 'testKind' : 'testKind2'};
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

const {putEntityInDB, getAllOfKind} = proxyquire('../src/database.js', {
  '@google-cloud/datastore': {Datastore: Storage},
});

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

describe('Database Add Entity Test', function() {
  before(function() {
    keyOverRide = function(kindOrKindAndId) {
      if (Array.isArray(kindOrKindAndId)) return kindOrKindAndId[1];
      else return `GeneratedId`;
    };
    saveOverRide = function(entity) {
      return new Promise(res => res([entity]));
    };
  });
  it('Should save the test object to the database with a generated key if none is provided', function() {
    return putEntityInDB(objectToSaveToDatabase, 'testKind')
      .then(result => {
        expect(result.data).to.be.eq(objectToSaveToDatabase);
        expect(result.key).to.be.eq('GeneratedId');
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should save the test object with a specific key if one is provided', function() {
    return putEntityInDB(objectToSaveToDatabase, 'testKind', 'testKey')
      .then(result => {
        expect(result.data).to.be.eq(objectToSaveToDatabase);
        expect(result.key).to.be.eq('testKey');
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should reject if no entity type is provided', function() {
    return expect(putEntityInDB(objectToSaveToDatabase)).to.be.rejected;
  });

  it('Should reject if the thing to save is undefined type is provided', function() {
    return expect(putEntityInDB(undefined, 'testKind')).to.be.rejected;
  });
});

describe('Database List All Test', function() {
  let queriedKind, queriedOffset, queriedLimit;

  before(function() {
    queryOverRide = function(kind) {
      queriedKind = kind;
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
    };
    resultOverRide = function(query) {
      expect(queriedKind).to.be.eql(query.queryOfKind);
      return new Promise(res =>
        res([
          listOfObjectsInDB
            .filter(testObj => testObj.kind === queriedKind)
            .slice(queriedOffset)
            .splice(0, queriedLimit),
        ])
      );
    };
  });

  it('Return all objects of kind in DB', function() {
    const kindToTest = 'testKind2';
    return getAllOfKind(kindToTest, 20, 0)
      .then(result => {
        expect(Array.isArray(result)).to.be.true;
        expect(result.length).to.be.lessThan(21);
        expect(result[0]).to.be.eq(listOfObjectsInDB[25]);
        expect(result[1]).to.be.eq(listOfObjectsInDB[26]);
        expect(result.every(o => o.kind === kindToTest)).to.be.true;
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should return an empty array if no items exists of that kind', function() {
    const kindToTest = 'doesntExist';
    return getAllOfKind(kindToTest, 20, 0)
      .then(result => {
        expect(Array.isArray(result)).to.be.true;
        expect(result.length).to.be.eql(0);
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should reject if any argument is not provided', function() {
    return expect(getAllOfKind())
      .to.be.rejected.then(expect(getAllOfKind('TestKind')).to.be.rejected)
      .then(expect(getAllOfKind(undefined, 20)).to.be.rejected)
      .then(expect(getAllOfKind(undefined, undefined, 2)).to.be.rejected);
  });
});
