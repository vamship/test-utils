'use strict';

const _sinon = require('sinon');
const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;
const _rewire = require('rewire');

let Mock = null;

describe('Mock', function() {
    beforeEach(() => {
        Mock = _rewire('../../src/mock');
    });

    describe('ctor()', () => {
        it('should throw an error if invoked without a valid instance', () => {
            const error = 'Invalid instance specified (arg #1)';
            const inputs = [undefined, null, 123, 'foo', true, [], () => {}];

            inputs.forEach((instance) => {
                const wrapper = () => {
                    return new Mock(instance);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without a valid method name', () => {
            const error = 'Invalid methodName specified (arg #2)';
            const inputs = [undefined, null, 123, true, {}, [], () => {}];

            inputs.forEach((methodName) => {
                const wrapper = () => {
                    const instance = {};
                    return new Mock(instance, methodName);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should expose the expected properties and functions', () => {
            const instance = {
                foo: () => {}
            };
            const methodName = 'foo';
            const mock = new Mock(instance, methodName);

            expect(mock).to.be.an('object');
            expect(mock.instance).to.equal(instance);
            expect(mock.methodName).to.equal(methodName);

            //Duck type verification of a sinon mock.
            expect(mock.stub).to.be.a('function');
            expect(mock.stub.args).to.be.an('array');
            expect(mock.stub.callCount).to.equal(0);

            expect(mock.responses).to.deep.equal([]);
            expect(mock).to.have.property('ret');

            expect(mock.reset).to.be.a('function');
        });

        it('should create a valid stub even if the method does not exist on the instance', () => {
            const instance = {};
            const methodName = 'foo';
            const mock = new Mock(instance, methodName);

            //Duck type verification of a sinon stub.
            expect(mock.stub).to.be.a('function');
            expect(mock.stub.args).to.be.an('array');
            expect(mock.stub.callCount).to.equal(0);
        });

        it('should configure the mock method to return a non function response', () => {
            const response = 'bar';
            const instance = {};
            new Mock(instance, 'foo', response);

            const ret = instance.foo();
            expect(ret).to.equal(response);
        });

        it('should evaluate and return the result if the return value is a function', () => {
            const response = 'bar';
            const spy = _sinon.stub().returns(response);
            const instance = {};
            const args = [ 'abc', 123, true ];
            new Mock(instance, 'foo', spy);

            expect(spy).to.not.have.been.called;

            const ret = instance.foo(...args);

            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith(...args);
            expect(ret).to.equal(response);
        });

        it('should push each response into the response array', () => {
            const responses = ['bar', 'baz', 'chaz', 'faz'];
            const instance = {};

            let respIndex = 0;
            const mock = new Mock(instance, 'foo', () => {
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


    describe('ret', () => {
        it('should return an Error object if inspected before the mock has been invoked', () => {
            const mock = new Mock({}, 'foo');

            const ret = mock.ret;
            expect(ret).to.be.an.instanceof(Error);
        });

        it('should return the actual response if inspected after mock has been invoked', () => {
            const response = 'bar';
            const inputs = [ response, _sinon.stub().returns(response)];

            inputs.forEach((returnValue) => {
                const instance = {};
                const mock = new Mock(instance, 'foo', returnValue);
                const ret = instance.foo();

                expect(mock.ret).to.equal(ret);
                expect(mock.ret).to.equal(response);
            });
        });
    });

    describe('reset()', () => {
        it('should reset the response array for the mock', () => {
            const responses = ['bar', 'baz', 'chaz', 'faz'];
            const instance = {};

            let respIndex = 0;
            const mock = new Mock(instance, 'foo', () => {
                return responses[respIndex++];
            });

            responses.forEach(() => {
                instance.foo();
            });

            mock.reset();

            expect(mock.responses).to.deep.equal([]);
        });

        it('should reset the call history for the mock', () => {
            const responses = ['bar', 'baz', 'chaz', 'faz'];
            const instance = {};

            let respIndex = 0;
            const mock = new Mock(instance, 'foo', () => {
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
