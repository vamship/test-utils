import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import * as _asyncHelper from '../../src/async-helper.js';
import * as _testValues from '../../src/test-values.js';
import { ObjectMock } from '../../src/object-mock.js';
import * as _index from '../../src/index.js';

describe('index', function () {
    it('should implement methods required by the interface', async function () {
        expect(_index.asyncHelper).to.equal(_asyncHelper);
        expect(_index.testValues).to.equal(_testValues);
        expect(_index.ObjectMock).to.equal(ObjectMock);
    });
});
