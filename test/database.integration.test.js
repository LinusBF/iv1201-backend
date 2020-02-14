'use strict';

const chai = require('chai');
const expect = chai.expect;
const utils = require('@google-cloud/nodejs-repo-tools');

const database = require('../src/database');

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

const integrationKind = 'TestKind';

describe('Database Add Entity Integration Test', function() {
  it('should correctly save an entity to the database', function() {
    const objectToSave = {
      testString: 'test',
      testInt: 1337,
      testArray: [1, 'test'],
      testArrayOfObjects: [{from: '2020-05-20'}, {to: '2020-05-29'}],
    };

    return database
      .putEntityInDB(objectToSave, integrationKind)
      .then(dbResult => {
        return expect(typeof dbResult.path[0].id).to.be.eq('string');
      })
      .catch(err => {
        return expect.fail(`Failed to create with error: ${err}`);
      });
  });
});

describe('Database Fetch Entity Integration Test', function() {
  it('should correctly fetch an entity from the database', function() {
    return database
      .getDocumentsByField(integrationKind, 'testInt', 1337)
      .then(fetchedValue => {
        return expect(fetchedValue).to.not.be.undefined;
      })
      .catch(err => {
        return expect.fail(`Failed to fetch with error: ${err}`);
      });
  });
});

describe.only('Database Fetch Entity Integration Test', function() {
  it('should correctly fetch all entity of type from the database', function() {
    return database
      .getAllOfKind(integrationKind, 5, 0)
      .then(fetchedValue => {
        console.debug(JSON.stringify(fetchedValue, null, 2));
        return expect(fetchedValue.length).to.be.eql(5);
      })
      .catch(err => {
        return expect.fail(`Failed to fetch with error: ${err}`);
      });
  });
});
