import { expect, use as _useWithChai } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import 'mocha';

_useWithChai(_sinonChai);
_useWithChai(_chaiAsPromised);

import * as _asyncHelper from '../../src/async-helper.js';
import * as _testValues from '../../src/test-values.js';
import { Mock } from '../../src/mock.js';
import { MockImporter } from '../../src/mock-importer.js';
import { AsyncResolver } from '../../src/async-resolver.js';
import { ObjectMock } from '../../src/object-mock.js';
import * as _index from '../../src/index.js';

describe('index', function () {
    it('should implement methods required by the interface', async function () {
        expect(_index.asyncHelper).to.equal(_asyncHelper);
        expect(_index.testValues).to.equal(_testValues);
        expect(_index.ObjectMock).to.equal(ObjectMock);
        expect(_index.Mock).to.equal(Mock);
        expect(_index.MockImporter).to.equal(MockImporter);
        expect(_index.AsyncResolver).to.equal(AsyncResolver);
    });
});
