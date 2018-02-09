'use strict';

const _sinon = require('sinon');
const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;
const _rewire = require('rewire');

let _valueGenerator = null;

describe('valueGenerator', function() {
    beforeEach(() => {
        _valueGenerator = _rewire('../../src/value-generator');
    });
});
