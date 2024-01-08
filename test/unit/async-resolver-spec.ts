import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinon, { SinonSpy } from 'sinon';
import _sinonChai from 'sinon-chai';
import _path from 'path';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import { createModuleImporter } from '../utils/utils.js';
import { AsyncResolver } from '../../src/async-resolver.js';

describe.only('AsyncResolver', function () {
    type TargetModuleType = typeof AsyncResolver;
    type ImportResult = {
        testTarget: TargetModuleType;
    };

    async function _importModule(): Promise<ImportResult> {
        const importModule = createModuleImporter<TargetModuleType>(
            'project://async-resolver.js',
            {},
            'AsyncResolver',
        );

        const testTarget = await importModule({});

        return await {
            testTarget,
        };
    }

    describe('[properties]', function () {
        describe('steps()', function () {
            it('should return an empty array if no steps have been registered', async function () {
                const { testTarget: TargetModuleType } = await _importModule();
                const instance = new TargetModuleType();

                expect(instance.steps).to.be.an('array');
                expect(instance.steps).to.be.empty;
            });

            it('should return an array of registered steps', async function () {
                const { testTarget: TargetModuleType } = await _importModule();
                const instance = new TargetModuleType();

                const expectedSteps = ['step1', 'step2', 'step3'];

                expectedSteps.forEach((step) => {
                    instance.registerStep(step, () => undefined);
                });

                expect(instance.steps).to.deep.equal(expectedSteps);
            });
        });
    });

    describe('registerStep()', function () {});
});
