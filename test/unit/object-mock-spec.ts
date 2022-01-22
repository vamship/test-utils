import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinon from 'sinon';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import _rewire from 'rewire';

let ObjectMock = _rewire('../../src/object-mock').default;

describe('PromiseMock', () => {
    let MockMock = null;
    let PromiseMock = null;

    beforeEach(() => {
        const mockInstance = {
            stub: {
                restore: _sinon.spy(),
            },
        };
        MockMock = _sinon.stub().returns(mockInstance);
        MockMock._instance = mockInstance;

        const promiseMockInstance = {
            stub: {
                restore: _sinon.spy(),
            },
        };
        PromiseMock = _sinon.stub().returns(promiseMockInstance);
        PromiseMock._instance = promiseMockInstance;

        const _objectMockModule = _rewire('../../src/object-mock');
        ObjectMock = _objectMockModule.default;

        _objectMockModule.__set__('mock_1', { default: MockMock });
        _objectMockModule.__set__('promise_mock_1', { default: PromiseMock });
    });

    describe('ctor()', () => {
        it('should create a default instance if a valid instance is not specified', () => {
            const inputs = [undefined, null, 123, 'foo', true, [], () => {}];

            inputs.forEach((instance) => {
                const mock = new ObjectMock(instance);

                expect(mock.instance).to.be.an('object').and.to.be.empty;
            });
        });
    });

    describe('ctor', () => {
        it('should return a reference to the constructor', () => {
            const instance = {};
            const mock = new ObjectMock(instance);

            expect(mock.ctor()).to.equal(instance);
        });
    });

    describe('addMock()', () => {
        it('should throw an error if invoked without a valid methodName', () => {
            const error = 'Invalid methodName specified (arg #1)';
            const inputs = [undefined, null, 123, '', true, [], {}, () => {}];

            inputs.forEach((methodName) => {
                const wrapper = () => {
                    const mock = new ObjectMock({});
                    return mock.addMock(methodName);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return a reference to the mock object', () => {
            const foo = () => undefined;
            const instance = {
                foo,
            };
            const mock = new ObjectMock(instance);
            const ret = mock.addMock('foo');

            expect(ret).to.equal(mock);
        });

        it('should create a mock object for the specified method', () => {
            const methodName = 'foo';
            const returnValue = 'bar';
            const method = () => {};
            const instance = {};
            instance[methodName] = method;
            const mock = new ObjectMock(instance);

            expect(mock.mocks).to.deep.equal({});
            expect(MockMock).to.not.have.been.called;

            mock.addMock(methodName, returnValue);

            expect(MockMock).to.have.been.calledOnce;
            expect(MockMock).to.have.been.calledWithNew;
            expect(MockMock).to.have.been.calledWith(
                instance,
                methodName,
                returnValue
            );
            expect(mock.mocks[methodName]).to.equal(MockMock._instance);
        });
    });

    describe('addPromiseMock()', () => {
        it('should throw an error if invoked without a valid methodName', () => {
            const error = 'Invalid methodName specified (arg #1)';
            const inputs = [undefined, null, 123, '', true, [], {}, () => {}];

            inputs.forEach((methodName) => {
                const wrapper = () => {
                    const mock = new ObjectMock({});
                    return mock.addPromiseMock(methodName);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return a reference to the mock object', () => {
            const foo = () => {};
            const instance = {
                foo,
            };
            const mock = new ObjectMock(instance);
            const ret = mock.addPromiseMock('foo');

            expect(ret).to.equal(mock);
        });

        it('should create a mock object for the specified method', () => {
            const methodName = 'foo';
            const method = () => {};
            const instance = {};
            instance[methodName] = method;
            const mock = new ObjectMock(instance);

            expect(mock.mocks).to.deep.equal({});
            expect(PromiseMock).to.not.have.been.called;

            mock.addPromiseMock(methodName);

            expect(PromiseMock).to.have.been.calledOnce;
            expect(PromiseMock).to.have.been.calledWithNew;
            expect(PromiseMock).to.have.been.calledWith(instance, methodName);
            expect(mock.mocks[methodName]).to.equal(PromiseMock._instance);
        });
    });

    describe('restore', () => {
        it('should throw an error if invoked without a valid methodName', () => {
            const error = 'Invalid methodName specified (arg #1)';
            const inputs = [undefined, null, 123, '', true, [], {}, () => {}];

            inputs.forEach((methodName) => {
                const wrapper = () => {
                    const mock = new ObjectMock({});
                    return mock.restore(methodName);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return a reference to the mock object', () => {
            const instance = {
                foo: () => {},
            };
            const mock = new ObjectMock(instance);
            const ret = mock.restore('foo');

            expect(ret).to.equal(mock);
        });

        it('should do nothing if the specified method has not been mocked', () => {
            const instance = {
                foo: () => {},
            };
            const mock = new ObjectMock(instance);
            const mockSnapshot = Object.assign({}, mock.mocks);

            mock.restore('foo');

            expect(mock.mocks).to.deep.equal(mockSnapshot);
        });

        it('should invoke the restore method on the method stub if the method has been mocked', () => {
            const instance = {
                foo: () => {},
                bar: () => {},
            };

            const mock = new ObjectMock(instance);
            mock.addMock('foo');
            mock.addPromiseMock('bar');

            const mockRestoreStub = MockMock._instance.stub.restore;
            const promiseMockRestoreStub = PromiseMock._instance.stub.restore;

            expect(mockRestoreStub).to.not.have.been.called;
            expect(promiseMockRestoreStub).to.not.have.been.called;

            mock.restore('foo');

            expect(mockRestoreStub).to.have.been.calledOnce;
            expect(promiseMockRestoreStub).to.not.have.been.called;

            mock.restore('bar');
            expect(promiseMockRestoreStub).to.have.been.calledOnce;
        });

        it('should delete the mock reference for the method stub if the method has been mocked', () => {
            const instance = {
                foo: () => {},
                bar: () => {},
            };

            const mock = new ObjectMock(instance);
            mock.addMock('foo');
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
