import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import _rewire from 'rewire';
let _index = _rewire('../../src/index');

import * as _asyncHelper from '../../src/async-helper';
import * as _consoleHelper from '../../src/console-helper';
import * as _testValues from '../../src/test-values';
import { SuperSpyBuilder } from '../../src/super-spy-builder';
import { ObjectMock } from '../../src/object-mock';

describe('index', function () {
    beforeEach(() => {
        _index = _rewire('../../src/index');
    });

    it('should implement methods required by the interface', function () {
        expect(_index.asyncHelper).to.equal(_asyncHelper);
        expect(_index.consoleHelper).to.equal(_consoleHelper);
        expect(_index.testValues).to.equal(_testValues);
        expect(_index.SuperSpyBuilder).to.equal(SuperSpyBuilder);
        expect(_index.ObjectMock).to.equal(ObjectMock);
    });
});
