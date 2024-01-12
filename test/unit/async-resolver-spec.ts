import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinon from 'sinon';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import { createModuleImporter } from '../utils/utils.js';
import { AsyncResolver } from '../../src/async-resolver.js';

describe('AsyncResolver', function () {
    type TargetModuleType = typeof AsyncResolver;
    type ImportResult = {
        testTarget: TargetModuleType;
    };

    async function _importModule(): Promise<ImportResult> {
        const importModule = createModuleImporter<TargetModuleType>(
            'project://async-resolver.js',
            {},
            'AsyncResolver'
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

                // Out of order steps should be retained as registered.
                const expectedSteps = ['step3', 'step2', 'step1'];

                expectedSteps.forEach((step) => {
                    instance.registerStep(step, () => Promise.resolve());
                });

                expect(instance.steps).to.deep.equal(expectedSteps);
            });
        });
    });

    describe('registerStep()', function () {
        [undefined, null, 123, true, [], '', {}, () => undefined].forEach(
            (stepName) => {
                it(`should throw an error if invoked with an invalid stepName (value=${stepName})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();
                    const instance = new TargetModuleType();
                    const resolver = () => Promise.resolve();

                    expect(() => {
                        /* eslint-disable  tsel/no-explicit-any */
                        instance.registerStep(stepName as any, resolver);
                    }).to.throw(`Invalid stepName (arg #1)`);
                });
            }
        );

        [undefined, null, 123, true, [], 'abc', {}].forEach((resolver) => {
            it(`should throw an error if invoked with an invalid resolver (value=${resolver})`, async function () {
                const { testTarget: TargetModuleType } = await _importModule();
                const instance = new TargetModuleType();
                const stepName = 'step1';

                expect(() => {
                    instance.registerStep(stepName, resolver as any);
                }).to.throw(`Invalid resolver (arg #2)`);
            });
        });

        it('should throw an error if the stepName name is already registered', async function () {
            const { testTarget: TargetModuleType } = await _importModule();
            const instance = new TargetModuleType();

            const stepName = 'step1';

            instance.registerStep(stepName, () => Promise.resolve());

            expect(() => {
                instance.registerStep(stepName, () => Promise.resolve());
            }).to.throw(`Step is already registered: [${stepName}]`);
        });

        it('should return the current instance', async function () {
            const { testTarget: TargetModuleType } = await _importModule();
            const instance = new TargetModuleType();

            const stepName = 'step1';

            const result = instance.registerStep(stepName, () =>
                Promise.resolve()
            );

            expect(result).to.equal(instance);
        });
    });

    describe('resolveUntil()', function () {
        [undefined, null, 123, true, [], '', {}, () => undefined].forEach(
            (stepName) => {
                it(`should throw an error if invoked with an invalid stepName (value=${stepName})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();
                    const instance = new TargetModuleType();
                    instance.registerStep('step1', () => Promise.resolve());

                    const iteration = 0;
                    await expect(
                        instance.resolveUntil(stepName as any, iteration)
                    ).to.be.rejectedWith(`Invalid stepName (arg #1)`);
                });
            }
        );

        [null, true, [], 'abc', {}, () => undefined, -1].forEach(
            (iteration) => {
                it(`should throw an error if invoked with an invalid iteration (value=${iteration})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();
                    const instance = new TargetModuleType();
                    const stepName = 'step1';

                    instance.registerStep(stepName, () => Promise.resolve());
                    await expect(
                        instance.resolveUntil(stepName, iteration as any)
                    ).to.be.rejectedWith(`Invalid iteration (arg #2)`);
                });
            }
        );

        it('should throw an error if the stepName name is not registered', async function () {
            const { testTarget: TargetModuleType } = await _importModule();
            const instance = new TargetModuleType();

            const stepName = 'step1';
            instance.registerStep('step0', () => Promise.resolve());

            await expect(instance.resolveUntil(stepName, 0)).to.be.rejectedWith(
                `Step is not registered: [${stepName}]`
            );
        });

        it('should throw an error if no steps have been registered', async function () {
            const { testTarget: TargetModuleType } = await _importModule();
            const instance = new TargetModuleType();

            const stepName = 'step1';

            await expect(instance.resolveUntil(stepName, 0)).to.be.rejectedWith(
                'No steps have been registered'
            );
        });

        it('should invoke all resolvers up to, but not including the specified stepName', async function () {
            const { testTarget: TargetModuleType } = await _importModule();
            const instance = new TargetModuleType();

            const iteration = 4;
            const step1 = 'step1';
            const step2 = 'step2';
            const step3 = 'step3';

            const resolver1 = _sinon.spy(() => Promise.resolve());
            const resolver2 = _sinon.spy(() => Promise.resolve());
            const resolver3 = _sinon.spy(() => Promise.resolve());

            instance.registerStep(step1, resolver1);
            instance.registerStep(step2, resolver2);
            instance.registerStep(step3, resolver3);

            await instance.resolveUntil(step3, iteration);

            expect(resolver1).to.have.been.calledOnceWithExactly(iteration);
            expect(resolver2).to.have.been.calledOnceWithExactly(iteration);
            expect(resolver3).to.not.have.been.called;
        });

        it('should default the iteration to 0 if omitted', async function () {
            const { testTarget: TargetModuleType } = await _importModule();
            const instance = new TargetModuleType();

            const step1 = 'step1';
            const step2 = 'step2';
            const step3 = 'step3';

            const resolver1 = _sinon.spy(() => Promise.resolve());
            const resolver2 = _sinon.spy(() => Promise.resolve());
            const resolver3 = _sinon.spy(() => Promise.resolve());

            instance.registerStep(step1, resolver1);
            instance.registerStep(step2, resolver2);
            instance.registerStep(step3, resolver3);

            await instance.resolveUntil(step3);

            expect(resolver1).to.have.been.calledOnceWithExactly(0);
            expect(resolver2).to.have.been.calledOnceWithExactly(0);
            expect(resolver3).to.not.have.been.called;
        });
    });
});
