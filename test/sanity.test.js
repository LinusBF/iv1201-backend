'use strict';

const chai = require('chai');
const expect = chai.expect;

describe('Sanity Test', function() {
  context('Sanity Context', function() {
    it('should be true to be true', function() {
      expect(true).to.be.true;
    });
  });
});
