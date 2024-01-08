import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import { stub, spy, SinonSpy, SinonStub } from 'sinon';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import { ObjectMock } from '../../src/object-mock.js';
import { createModuleImporter } from '../utils/utils.js';

describe('ObjectMock', () => {
    // Dummy class that will be mocked during tests.
    class Mockable {
        public static RET_VALUE = '1234';

        public foo(...args: unknown[]): string {
            return Mockable.RET_VALUE;
        }
        public bar(...args: unknown[]): Promise<string> {
            return Promise.resolve(Mockable.RET_VALUE);
        }
    }

    type TargetModuleType = typeof ObjectMock<Mockable>;
    type FakeMockInstanceType = {
        /* eslint-disable tsel/no-explicit-any */
        stub: { restore: SinonSpy<any, any> };
    };

    /* eslint-disable tsel/no-explicit-any */
    type FakeMockType = SinonStub<any, FakeMockInstanceType>;

    type ImportResult = {
        testTarget: TargetModuleType;
        mockMock: FakeMockType;
        mockMockInstance: FakeMockInstanceType;
        promiseMock: FakeMockType;
        promiseMockInstance: FakeMockInstanceType;
    };

    async function _importModule(): Promise<ImportResult> {
        const importModule = createModuleImporter<TargetModuleType>(
            'project://object-mock.js',
            {
                mockMock: 'project://mock.js',
                promiseMock: 'project://promise-mock.js',
            },
            'ObjectMock'
        );
        const mockMockInstance = {
            stub: {
                restore: spy(),
            },
        };
        const mockMock = stub().returns(mockMockInstance);

        const promiseMockInstance = {
            stub: {
                restore: spy(),
            },
        };
        const promiseMock = stub().returns(promiseMockInstance);

        const testTarget = await importModule({
            mockMock,
            promiseMock,
        });

        return await {
            testTarget,
            mockMock,
            mockMockInstance,
            promiseMock,
            promiseMockInstance,
        };
    }

    describe('ctor()', function () {
        [undefined, null, 123, 'foo', true, [], () => undefined].forEach(
            (value) => {
                it(`should create a default instance if a valid instance is not specified (value=${value})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();
                    const instance = value as any;

                    const mock = new TargetModuleType(instance);

                    expect(mock.instance).to.be.an('object').and.to.be.empty;
                });
            }
        );

        it('should return a reference to the constructor', async function () {
            const { testTarget: TargetModuleType } = await _importModule();

            const instance = new Mockable();
            const mock = new TargetModuleType(instance);

            expect(mock.ctor()).to.equal(instance);
        });
    });

    describe('getMock()', function () {
        [undefined, null, 123, '', true, [], {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid methodName (value=${value})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();

                    const error = 'Invalid methodName (arg #1)';
                    const methodName = value as any;

                    const wrapper = () => {
                        const mock = new TargetModuleType(new Mockable());
                        return mock.getMock(methodName);
                    };

                    expect(wrapper).to.throw(error);
                });
            }
        );

        ['badMethod', 'anotherBadMethod'].forEach((value: string) => {
            it(`should throw an error if the method has not been mocked (value=${value})`, async function () {
                const { testTarget: TargetModuleType } = await _importModule();

                const mock = new TargetModuleType(new Mockable());
                const methodName = value as string;

                const error = `Method has not been mocked [${methodName}]`;
                const wrapper = () => {
                    return mock.getMock(methodName);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return the mock for the method name', async function () {
            const { testTarget: TargetModuleType, mockMockInstance } =
                await _importModule();

            const methodNames = ['foo', 'bar'];
            const mock = methodNames.reduce(
                (result, methodName) => result.addMock(methodName, undefined),
                new TargetModuleType(new Mockable())
            );

            methodNames.forEach((methodName) => {
                const methodMock = mock.getMock(methodName);
                expect(methodMock).to.be.an('object');
                expect(methodMock).to.equal(mockMockInstance);
            });
        });
    });

    describe('addMock()', function () {
        [undefined, null, 123, '', true, [], {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid methodName (value=${value})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();

                    const error = 'Invalid methodName specified (arg #1)';
                    const methodName = value as any;

                    const wrapper = () => {
                        const mock = new TargetModuleType(new Mockable());
                        return mock.addMock(methodName, undefined);
                    };

                    expect(wrapper).to.throw(error);
                });
            }
        );

        it('should return a reference to the mock object', async function () {
            const { testTarget: TargetModuleType } = await _importModule();

            const instance = new Mockable();
            const mock = new TargetModuleType(instance);
            const ret = mock.addMock('foo', undefined);

            expect(ret).to.equal(mock);
        });

        it('should create a mock object for the specified method', async function () {
            const {
                testTarget: TargetModuleType,
                mockMock,
                mockMockInstance,
            } = await _importModule();

            const newRetValue = 'abcd';
            const methodName = 'foo';
            const instance = new Mockable();
            const mock = new TargetModuleType(instance);

            expect(mock.mocks).to.deep.equal({});
            expect(mockMock).to.not.have.been.called;

            mock.addMock(methodName, newRetValue);

            expect(mockMock).to.have.been.calledOnce;
            expect(mockMock).to.have.been.calledWithNew;
            expect(mockMock).to.have.been.calledWith(
                instance,
                methodName,
                newRetValue
            );
            expect(mock.mocks[methodName]).to.equal(mockMockInstance);
        });
    });

    describe('addPromiseMock()', function () {
        [undefined, null, 123, '', true, [], {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid methodName`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();

                    const error = 'Invalid methodName specified (arg #1)';

                    const methodName = value as any;
                    const wrapper = () => {
                        const mock = new TargetModuleType(new Mockable());
                        return mock.addPromiseMock(methodName);
                    };

                    expect(wrapper).to.throw(error);
                });
            }
        );

        it('should return a reference to the mock object', async function () {
            const { testTarget: TargetModuleType } = await _importModule();

            const mock = new TargetModuleType(new Mockable());
            const ret = mock.addPromiseMock('foo');

            expect(ret).to.equal(mock);
        });

        it('should create a mock object for the specified method', async function () {
            const {
                testTarget: TargetModuleType,
                promiseMock,
                promiseMockInstance,
            } = await _importModule();

            const methodName = 'bar';
            const instance = new Mockable();
            const mock = new TargetModuleType(instance);

            expect(mock.mocks).to.deep.equal({});
            expect(promiseMock).to.not.have.been.called;

            mock.addPromiseMock(methodName);

            expect(promiseMock).to.have.been.calledOnce;
            expect(promiseMock).to.have.been.calledWithNew;
            expect(promiseMock).to.have.been.calledWith(instance, methodName);
            expect(mock.mocks[methodName]).to.equal(promiseMockInstance);
        });
    });

    describe('restore', function () {
        [undefined, null, 123, '', true, [], {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid methodName (value=${value})`, async function () {
                    const error = 'Invalid methodName specified (arg #1)';
                    const { testTarget: TargetModuleType } =
                        await _importModule();

                    const methodName = value as any;
                    const wrapper = () => {
                        const mock = new TargetModuleType(new Mockable());
                        return mock.restore(methodName);
                    };

                    expect(wrapper).to.throw(error);
                });
            }
        );

        it('should return a reference to the mock object', async function () {
            const { testTarget: TargetModuleType } = await _importModule();

            const instance = new Mockable();
            const mock = new TargetModuleType(instance);
            const ret = mock.restore('foo');

            expect(ret).to.equal(mock);
        });

        it('should do nothing if the specified method has not been mocked', async function () {
            const { testTarget: TargetModuleType } = await _importModule();

            const instance = new Mockable();
            const mock = new TargetModuleType(instance);
            const mockSnapshot = Object.assign({}, mock.mocks);

            mock.restore('foo');

            expect(mock.mocks).to.deep.equal(mockSnapshot);
        });

        it('should invoke the restore method on the method stub if the method has been mocked', async function () {
            const {
                testTarget: TargetModuleType,
                mockMockInstance,
                promiseMockInstance,
            } = await _importModule();

            const instance = new Mockable();

            const mock = new TargetModuleType(instance);
            mock.addMock('foo', undefined);
            mock.addPromiseMock('bar');

            const mockRestoreStub = mockMockInstance.stub.restore;
            const promiseMockRestoreStub = promiseMockInstance.stub.restore;

            expect(mockRestoreStub).to.not.have.been.called;
            expect(promiseMockRestoreStub).to.not.have.been.called;

            mock.restore('foo');

            expect(mockRestoreStub).to.have.been.calledOnce;
            expect(promiseMockRestoreStub).to.not.have.been.called;

            mock.restore('bar');

            expect(promiseMockRestoreStub).to.have.been.calledOnce;
        });

        it('should delete the mock reference for the method stub if the method has been mocked', async function () {
            const { testTarget: TargetModuleType } = await _importModule();

            const instance = new Mockable();

            const mock = new TargetModuleType(instance);
            mock.addMock('foo', undefined);
            mock.addPromiseMock('bar');

            const mockSnapshot = Object.assign({}, mock.mocks);

            mock.restore('foo');

            delete mockSnapshot.foo;
            expect(mock.mocks).to.deep.equal(mockSnapshot);

            mock.restore('bar');
            delete mockSnapshot.bar;
            expect(mock.mocks).to.deep.equal(mockSnapshot);
        });
    });
});
