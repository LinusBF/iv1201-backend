'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const utils = require('@google-cloud/nodejs-repo-tools');
const proxyquire = require('proxyquire');

chai.use(chaiAsPromised);

let objectToSaveToDatabase = {};
const listOfObjectsInDB = [];
for (let i = 0; i < 50; i++) {
  listOfObjectsInDB[i] = {
    test: `test${i}`,
    order: i,
    num: i % 5,
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

const {putEntityInDB, getAllOfKind, getDocumentsByField} = proxyquire('../src/database.js', {
  '@google-cloud/datastore': {Datastore: Storage},
});

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

describe('Database Add Entity Test', function() {
  beforeEach(function() {
    objectToSaveToDatabase = {
      testString: 'test',
      testInt: 1337,
      testArray: [1, 'test'],
      testNestedObject: [{from: '2020-05-20'}, {to: '2020-05-29'}],
    };
  });

  before(function() {
    keyOverRide = function(kindOrKindAndId) {
      if (Array.isArray(kindOrKindAndId)) return kindOrKindAndId[1];
      else return `GeneratedId`;
    };
    saveOverRide = function() {
      return new Promise(res =>
        res([
          {
            mutationResults: [{key: `GeneratedId`}],
          },
        ])
      );
    };
  });

  after(function() {
    keyOverRide = () => {};
    saveOverRide = () => {};
  });

  it('Should save the test object to the database with a generated key if none is provided', function() {
    return putEntityInDB(objectToSaveToDatabase, 'TestKind')
      .then(result => {
        expect(result).to.be.eq('GeneratedId');
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should save the test object with a specific key if one is provided', function() {
    return putEntityInDB(objectToSaveToDatabase, 'TestKind', 'testKey')
      .then(result => {
        expect(result).to.be.eq('GeneratedId');
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should reject if no entity type is provided', function() {
    return expect(putEntityInDB(objectToSaveToDatabase)).to.be.rejected;
  });

  it('Should reject if the thing to save is undefined type is provided', function() {
    return expect(putEntityInDB(undefined, 'TestKind')).to.be.rejected;
  });
});

describe('Database List All Test', function() {
  let queriedKind, queriedSort, queriedOffset, queriedLimit;
  const sortByTest = 'order';

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

  it('Return all objects of kind in DB', function() {
    const kindToTest = 'TestKind2';
    return getAllOfKind(kindToTest, sortByTest, 20, 0)
      .then(result => {
        expect(Array.isArray(result)).to.be.true;
        expect(result.length).to.be.lessThan(21);
        expect(result[0]).to.be.eq(listOfObjectsInDB[49]);
        expect(result[1]).to.be.eq(listOfObjectsInDB[48]);
        expect(result.every(o => o.kind === kindToTest)).to.be.true;
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should return an empty array if no items exists of that kind', function() {
    const kindToTest = 'doesntExist';
    return getAllOfKind(kindToTest, sortByTest, 20, 0)
      .then(result => {
        expect(Array.isArray(result)).to.be.true;
        expect(result.length).to.be.eql(0);
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should return items in the correct order', function() {
    const kindToTest = 'TestKind2';
    const expectedFirstElement = listOfObjectsInDB[49];
    return getAllOfKind(kindToTest, sortByTest, 25, 0)
      .then(result => {
        expect(result[0].order).to.be.eql(expectedFirstElement.order);
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should reject if any argument is not provided', function() {
    return expect(getAllOfKind())
      .to.be.rejected.then(expect(getAllOfKind('TestKind')).to.be.rejected)
      .then(expect(getAllOfKind(undefined, 'order')).to.be.rejected)
      .then(expect(getAllOfKind(undefined, undefined, 20)).to.be.rejected)
      .then(expect(getAllOfKind(undefined, undefined, undefined, 2)).to.be.rejected);
  });
});

describe('Database Get By Field Test', function() {
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

  it('Return all objects of that fulfill the field value', function() {
    const kindToTest = 'TestKind2';
    const fieldToTest = 'num';
    const needleToTest = 3;
    return getDocumentsByField(kindToTest, 'num', 3)
      .then(result => {
        expect(Array.isArray(result)).to.be.true;
        expect(
          result.every(o => {
            return o.kind === kindToTest && o[fieldToTest] === needleToTest;
          })
        ).to.be.true;
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should return an empty array if no items exists of that kind', function() {
    const kindToTest = 'TestKind2';
    const fieldToTest = 'doesntExist';
    const needleToTest = 3;
    return getDocumentsByField(kindToTest, fieldToTest, needleToTest)
      .then(result => {
        expect(Array.isArray(result)).to.be.true;
        expect(result.length).to.be.eql(0);
      })
      .catch(err => {
        expect.fail(err);
      });
  });

  it('Should reject if any argument is not provided', function() {
    return expect(getDocumentsByField())
      .to.be.rejected.then(expect(getDocumentsByField('TestKind')).to.be.rejected)
      .then(expect(getDocumentsByField(undefined, 'testField')).to.be.rejected)
      .then(expect(getDocumentsByField(undefined, undefined, 2)).to.be.rejected);
  });
});
