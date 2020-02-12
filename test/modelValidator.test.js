'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const utils = require('@google-cloud/nodejs-repo-tools');
const fs = require('fs');
const {validateApplicationModel} = require('../src/modelValidator');

chai.use(chaiAsPromised);

const filesPath = __dirname + '/files/';
const correctPath = filesPath + 'correctApplication.json';
const incorrectPath = filesPath + 'incorrectApplication.json';

const correct = JSON.parse(fs.readFileSync(correctPath).toString());
const incorrect = JSON.parse(fs.readFileSync(incorrectPath).toString());

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

describe('Model Validator - Application model validation', function() {
  it('should return true for a correct application', function() {
    return expect(validateApplicationModel(correct)).to.eventually.equal(true);
  });

  it('should return a failure object with all fields failing for the incorrect application', function() {
    const errorPromise = validateApplicationModel(incorrect);
    expect(errorPromise).to.be.rejected;
    errorPromise.then(error => {
      expect(
        Object.keys(incorrect).every(key => error.map(res => res.path.split('.')[0]).includes(key))
      ).to.be.true;
    });
  });
});
