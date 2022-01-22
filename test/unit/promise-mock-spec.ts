import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import _rewire from 'rewire';

let PromiseMock = _rewire('../../src/promise-mock').default;

class TestSubject {
    public async foo(...args): Promise<string> {
        return '1234';
    }
}

describe('PromiseMock', () => {
    beforeEach(() => {
        PromiseMock = _rewire('../../src/promise-mock').default;
    });

    describe('ctor()', () => {
        it('should return a promise when the mock is invoked', () => {
            const instance = new TestSubject();
            new PromiseMock(instance, 'foo');

            const ret = instance.foo();

            expect(ret).to.be.an.instanceof(Promise);
        });

        it('should return a different promise on subsequent invocations', () => {
            const instance = new TestSubject();
            new PromiseMock(instance, 'foo');

            let oldPromise: Promise<string> | undefined = undefined;
            for (let index = 0; index < 10; index++) {
                let promise = instance.foo();

                expect(promise).to.be.an.instanceof(Promise);
                expect(promise).to.not.equal(oldPromise);

                oldPromise = promise;
            }
        });
    });

    describe('promise()', () => {
        it('should return the promise linked to a specific invocation', () => {
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');

            const promises: Promise<string>[] = [];
            for (let index = 0; index < 10; index++) {
                const promise = instance.foo();
                promises.push(promise);
            }

            promises.forEach((promise, index) => {
                expect(promise).to.be.an.instanceof(Promise);
                expect(mock.promise(index)).to.equal(promise);
            });
        });

        it('should return pre generate the promise if invoked before invocation', () => {
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');

            const promises: Promise<string>[] = [];
            for (let index = 0; index < 10; index++) {
                promises.push(mock.promise(index));
            }

            promises.forEach((promise) => {
                expect(promise).to.be.an.instanceof(Promise);
                expect(instance.foo()).to.equal(promise);
            });
        });

        it('should default the call index to 0 if a valid number is not specified', () => {
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');
            const promise = instance.foo();
            const inputs = [
                undefined,
                null,
                0,
                -1,
                'foo',
                true,
                [],
                () => undefined,
            ];

            inputs.forEach((callIndex) => {
                const ret = mock.promise(callIndex);
                expect(ret).to.equal(promise);
            });
        });
    });

    describe('reject()', () => {
        it('should reject the promise linked to a specific invocation', (done) => {
            const error = 'something went wrong!';
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');

            const promises: Promise<string>[] = [];
            for (let index = 0; index < 10; index++) {
                promises.push(instance.foo());
            }

            const result = promises.map((promise, index) => {
                const ret = mock.reject(error, index);
                expect(ret).to.equal(promise);
                return expect(promise).to.be.rejectedWith(error);
            });

            expect(Promise.all(result)).to.be.fulfilled.and.notify(done);
        });

        it('should pre reject the promise if invoked before invocation', (done) => {
            const error = 'something went wrong!';
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');

            const promises: Promise<string>[] = [];
            for (let index = 0; index < 10; index++) {
                promises.push(mock.reject(error, index));
            }

            const result = promises.map((promise, index) => {
                expect(promise).to.equal(instance.foo());
                return expect(promise).to.be.rejectedWith(error);
            });

            expect(Promise.all(result)).to.be.fulfilled.and.notify(done);
        });

        it('should default the call index to 0 if a valid number is not specified', () => {
            const error = 'something went wrong!';
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');
            const promise = instance.foo();
            promise.catch((ex) => undefined);

            const inputs = [
                undefined,
                null,
                0,
                -1,
                'foo',
                true,
                [],
                () => undefined,
            ];

            inputs.forEach((callIndex) => {
                const ret = mock.reject(error, callIndex);
                expect(ret).to.equal(promise);
            });
        });
    });

    describe('resolve()', () => {
        it('should resolve the promise linked to a specific invocation', (done) => {
            const data = 'bar';
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');

            const promises: Promise<string>[] = [];
            for (let index = 0; index < 10; index++) {
                promises.push(instance.foo());
            }

            const result = promises.map((promise, index) => {
                const ret = mock.resolve(data, index);
                expect(ret).to.equal(promise);
                return expect(promise).to.be.fulfilled.then((response) => {
                    expect(response).to.equal(data);
                });
            });

            expect(Promise.all(result)).to.be.fulfilled.and.notify(done);
        });

        it('should pre resolve the promise if invoked before invocation', (done) => {
            const data = 'bar';
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');

            const promises: Promise<string>[] = [];
            for (let index = 0; index < 10; index++) {
                promises.push(mock.resolve(data, index));
            }

            const result = promises.map((promise, index) => {
                expect(promise).to.equal(instance.foo());
                return expect(promise).to.be.fulfilled.then((response) => {
                    expect(response).to.equal(data);
                });
            });

            expect(Promise.all(result)).to.be.fulfilled.and.notify(done);
        });

        it('should default the call index to 0 if a valid number is not specified', () => {
            const data = 'bar!';
            const instance = new TestSubject();
            const mock = new PromiseMock(instance, 'foo');
            const promise = instance.foo();

            const inputs = [
                undefined,
                null,
                0,
                -1,
                'foo',
                true,
                [],
                () => undefined,
            ];

            inputs.forEach((callIndex) => {
                const ret = mock.resolve(data, callIndex);
                expect(ret).to.equal(promise);
            });
        });
    });
});
