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
      testNestedArray: [
        [1, 2],
        ['one', 'two'],
      ],
    };

    return database
      .putEntityInDB(objectToSave, integrationKind)
      .then(dbResult => {
        return expect(dbResult.id).to.not.be.undefined;
      })
      .catch(err => {
        return expect.fail(`Failed to create with error: ${err}`);
      });
  });
});

describe.only('Database Fetch Entity Integration Test', function() {
  it('should correctly save an entity to the database', function() {
    return database
      .getDocumentsByField(integrationKind, 'testInt', 1337)
      .then(fetchedValue => {
        return expect(fetchedValue).to.not.be.undefined;
      })
      .catch(err => {
        return expect.fail(`Failed to create with error: ${err}`);
      });
  });
});