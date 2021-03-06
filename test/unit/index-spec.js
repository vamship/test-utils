'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;
const _rewire = require('rewire');

let _index = null;
const _asyncHelper = require('../../src/async-helper');
const _consoleHelper = require('../../src/console-helper');
const _testValues = require('../../src/test-values');
const _superSpyBuilder = require('../../src/super-spy-builder');
const ObjectMock = require('../../src/object-mock');

describe('index', function () {
    beforeEach(() => {
        _index = _rewire('../../src/index');
    });

    it('should implement methods required by the interface', function () {
        expect(_index.asyncHelper).to.equal(_asyncHelper);
        expect(_index.consoleHelper).to.equal(_consoleHelper);
        expect(_index.testValues).to.equal(_testValues);
        expect(_index.SuperSpyBuilder).to.equal(_superSpyBuilder);
        expect(_index.ObjectMock).to.equal(ObjectMock);
    });
});
