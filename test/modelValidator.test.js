'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const utils = require('@google-cloud/nodejs-repo-tools');
const fs = require('fs');
const {validateApplicationModel, validateStatusUpdate} = require('../src/modelValidator');

chai.use(chaiAsPromised);

const filesPath = __dirname + '/files/';

/**
 * @param testPromise Promise
 * @param expected Object
 * @return {[Chai.PromisedAssertion, Promise<any>]}
 */
const verifyErrorObject = (testPromise, expected) => {
  return [
    expect(testPromise).to.be.rejected,
    testPromise.catch(error => {
      expect(
        Object.keys(expected).every(key =>
          error.pathErrors.map(res => res.path.split('.')[0]).includes(key)
        )
      ).to.be.true;
    }),
  ];
};

/**
 * @param testPromise Promise
 * @return {[Chai.PromisedAssertion, Promise<any>]}
 */
const verifyUndefinedError = testPromise => {
  return [
    expect(testPromise).to.be.rejected,
    testPromise.catch(error => {
      expect(error.message).to.be.eq('data is undefined!');
    }),
  ];
};

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

describe('Model Validator - Application model validation', function() {
  const correctPath = filesPath + 'correctApplication.json';
  const incorrectPath = filesPath + 'incorrectApplication.json';
  const correct = JSON.parse(fs.readFileSync(correctPath).toString());
  const incorrect = JSON.parse(fs.readFileSync(incorrectPath).toString());

  it('should return true for a correct application', function() {
    return expect(validateApplicationModel(correct)).to.eventually.equal(true);
  });

  it('should return a failure object with all fields failing for the incorrect application', function() {
    const errorPromise = validateApplicationModel(incorrect);
    return Promise.all(verifyErrorObject(errorPromise, incorrect));
  });

  it('should reject if undefined object is sent', function() {
    const errorPromise = validateApplicationModel();
    return Promise.all(verifyUndefinedError(errorPromise));
  });
});

describe('Model Validator - Status update validation', function() {
  const correct = {status: true, oldStatus: false};
  const incorrect = {status: 'true', oldStatus: -1};
  it('should return true for a correct payload', function() {
    return expect(validateStatusUpdate('123', correct)).to.eventually.equal(true);
  });

  it('should return a failure object with all fields failing for the incorrect status update', function() {
    const errorPromise = validateStatusUpdate('123', incorrect);
    return Promise.all(verifyErrorObject(errorPromise, incorrect));
  });

  it('should reject if undefined object is sent', function() {
    const errorPromise = validateStatusUpdate();
    return Promise.all(verifyUndefinedError(errorPromise));
  });
});
