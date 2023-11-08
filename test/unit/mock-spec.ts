import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinon from 'sinon';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import { createModuleImporter } from '../utils/utils.js';
import MockModule from '../../src/mock.js';

describe('Mock', function () {
    // Dummy class that will be mocked during tests.
    class Mockable {
        public foo(...args: unknown[]): string {
            return '1234';
        }
    }

    type TargetModuleType = typeof MockModule<Mockable, string>;
    type ImportResult = {
        module: TargetModuleType;
    };

    async function _importModule(): Promise<ImportResult> {
        const importModule = createModuleImporter<TargetModuleType>(
            'src/mock.js',
            {},
        );
        const module = await importModule({});

        return { module };
    }

    describe('ctor()', function () {
        [undefined, null, 123, 'foo', true, [], () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid instance (value=${value})`, async function () {
                    const { module: TargetModuleType } = await _importModule();
                    const error = 'Invalid instance specified (arg #1)';

                    /* eslint-disable tsel/no-explicit-any */
                    const instance = value as any;
                    const methodName = 'myMethod';
                    const returnValue = 'myMethodResponse';
                    const wrapper = () => {
                        return new TargetModuleType(
                            instance,
                            methodName,
                            returnValue,
                        );
                    };

                    expect(wrapper).to.throw(error);
                });
            },
        );

        [undefined, null, 123, true, {}, [], () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid methodName (value=${value})`, async function () {
                    const { module: TargetModuleType } = await _importModule();
                    const error = 'Invalid methodName specified (arg #2)';

                    const instance = new Mockable();
                    /* eslint-disable tsel/no-explicit-any */
                    const methodName = value as any;
                    const returnValue = 'myMethodResponse';
                    const wrapper = () => {
                        return new TargetModuleType(
                            instance,
                            methodName,
                            returnValue,
                        );
                    };

                    expect(wrapper).to.throw(error);
                });
            },
        );

        it('should create a dummy method and stub it if the specified method does not exist on the instance', async function () {
            const { module: TargetModuleType } = await _importModule();

            const instance = new Mockable();
            const methodName = 'nonExistentMethod';
            /* eslint-disable tsel/no-explicit-any */
            const method = (instance as any)[methodName];

            expect(method).to.be.undefined;

            const mock = new TargetModuleType(instance, methodName, 'bar');

            expect(method).to.equal(mock.stub);

            //Duck type verification of a sinon stub.
            expect(mock.stub).to.be.a('function');
            expect(mock.stub.args).to.be.an('array');
            expect(mock.stub.callCount).to.equal(0);

            // Hacky method to ensure that the dummy method is invoked for test
            // coverage purposes.
            _sinon.restore();
            const dummy = (instance as any)[methodName] as () => void;
            expect(dummy()).to.be.undefined;
        });

        it('should create a valid stub for the method on the instance', async function () {
            const { module: TargetModuleType } = await _importModule();

            const instance = new Mockable();
            const methodName = 'foo';
            const mock = new TargetModuleType(instance, methodName, 'bar');

            expect(instance[methodName]).to.equal(mock.stub);

            //Duck type verification of a sinon stub.
            expect(mock.stub).to.be.a('function');
            expect(mock.stub.args).to.be.an('array');
            expect(mock.stub.callCount).to.equal(0);
        });

        it('should configure the mock method to return a non function response', async function () {
            const { module: TargetModuleType } = await _importModule();

            const response = 'bar';
            const instance = new Mockable();
            new TargetModuleType(instance, 'foo', response);

            const ret = instance.foo();
            expect(ret).to.equal(response);
        });

        it('should evaluate and return the result if the return value is a function', async function () {
            const { module: TargetModuleType } = await _importModule();

            const response = 'bar';
            const spy = _sinon.stub().returns(response);
            const instance = new Mockable();
            const args = ['abc', 123, true];
            new TargetModuleType(instance, 'foo', spy);

            expect(spy).to.not.have.been.called;

            const ret = instance.foo(...args);

            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith(...args);
            expect(ret).to.equal(response);
        });

        it('should push each response into the response array', async function () {
            const { module: TargetModuleType } = await _importModule();

            const responses = ['bar', 'baz', 'chaz', 'faz'];
            const instance = new Mockable();

            let respIndex = 0;
            const mock = new TargetModuleType(instance, 'foo', () => {
                return responses[respIndex++];
            });

            responses.forEach(() => {
                instance.foo();
            });

            responses.forEach((response, index) => {
                expect(mock.responses[index]).to.equal(response);
            });
        });
    });

    describe('[properties]', function () {
        describe('instance', function () {
            it('should return the instance that was passed to the ctor', async function () {
                const { module: TargetModuleType } = await _importModule();

                const instance = new Mockable();
                const mock = new TargetModuleType(instance, 'foo', '');

                expect(mock.instance).to.equal(instance);
            });
        });

        describe('methodName', function () {
            it('should return the instance that was passed to the ctor', async function () {
                const { module: TargetModuleType } = await _importModule();

                const methodName = 'foo';
                const mock = new TargetModuleType(
                    new Mockable(),
                    methodName,
                    '',
                );

                expect(mock.methodName).to.equal(methodName);
            });
        });

        describe('stub', function () {
            it('should return the stub created to mock the method', async function () {
                const { module: TargetModuleType } = await _importModule();

                const instance = new Mockable();
                const mock = new TargetModuleType(instance, 'foo', '');

                expect(mock.stub).to.equal(instance.foo);

                //Duck type verification of a sinon stub.
                expect(mock.stub).to.be.a('function');
                expect(mock.stub.args).to.be.an('array');
                expect(mock.stub.callCount).to.equal(0);
            });
        });

        describe('responses', function () {
            it('should return an empty array if the mocked method has not been invoked', async function () {
                const { module: TargetModuleType } = await _importModule();

                const instance = new Mockable();
                const mock = new TargetModuleType(instance, 'foo', '');

                expect(mock.responses).to.deep.equal([]);
            });

            it('should return an array of all responses returned by the mocked method', async function () {
                const { module: TargetModuleType } = await _importModule();

                const expectedResponses = [1, 2, 3, 4, 5].map((value) =>
                    value.toString(),
                );
                const instance = new Mockable();
                let counter = 0;
                const fakeMethod = () => expectedResponses[counter++];
                const mock = new TargetModuleType(instance, 'foo', fakeMethod);

                expectedResponses.forEach(() => instance.foo());

                expect(mock.responses).to.deep.equal(expectedResponses);
            });
        });

        describe('ret', function () {
            it('should return an Error object if inspected before the mock has been invoked', async function () {
                const { module: TargetModuleType } = await _importModule();
                const mock = new TargetModuleType(new Mockable(), 'foo', '');

                const ret = mock.ret;
                expect(ret).to.be.an.instanceof(Error);
            });

            type Input = {
                returnValue: string | (() => string);
                response: string;
            };
            const inputs: Input[] = [
                { response: 'bar', returnValue: 'bar' },
                { response: 'bar', returnValue: _sinon.stub().returns('bar') },
            ];

            inputs.forEach(({ response, returnValue }) => {
                it(`should return the actual response if inspected after mock has been invoked (value=${returnValue})`, async function () {
                    const { module: TargetModuleType } = await _importModule();

                    const instance = new Mockable();
                    const mock = new TargetModuleType(
                        instance,
                        'foo',
                        returnValue,
                    );
                    const ret = instance.foo();

                    expect(mock.ret).to.equal(ret);
                    expect(mock.ret).to.equal(response);
                });
            });
        });
    });

    describe('reset()', function () {
        it('should reset the response array for the mock', async function () {
            const responses = ['bar', 'baz', 'chaz', 'faz'];
            const { module: TargetModuleType } = await _importModule();
            const instance = new Mockable();

            let respIndex = 0;
            const mock = new TargetModuleType(instance, 'foo', () => {
                return responses[respIndex++];
            });

            responses.forEach(() => {
                instance.foo();
            });

            mock.reset();

            expect(mock.responses).to.deep.equal([]);
        });

        it('should reset the call history for the mock', async function () {
            const responses = ['bar', 'baz', 'chaz', 'faz'];
            const { module: TargetModuleType } = await _importModule();
            const instance = new Mockable();

            let respIndex = 0;
            const mock = new TargetModuleType(instance, 'foo', () => {
                return responses[respIndex++];
            });

            responses.forEach(() => {
                instance.foo();
            });

            mock.reset();

            expect(mock.stub.callCount).to.equal(0);
        });
    });
});
