import { expect, use as _useWithChai } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import 'mocha';

_useWithChai(_sinonChai);
_useWithChai(_chaiAsPromised);

import { createModuleImporter } from '../utils/utils.js';
import MockModule from '../../src/promise-mock.js';

describe('PromiseMock', function () {
    // Dummy class that will be mocked during tests.
    class Mockable {
        public foo(...args: unknown[]): Promise<string> {
            return Promise.resolve('1234');
        }
    }

    type TargetModuleType = typeof MockModule<Mockable, string>;
    type ImportResult = {
        module: TargetModuleType;
    };

    async function _importModule(): Promise<ImportResult> {
        const importModule = createModuleImporter<TargetModuleType>(
            'project://promise-mock.js',
            {}
        );
        const module = await importModule({});

        return { module };
    }

    describe('ctor()', function () {
        it('should return a promise when the mock is invoked', async function () {
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

            new PromiseMock(instance, 'foo');

            const ret = instance.foo();

            expect(ret).to.be.an.instanceof(Promise);
        });

        it('should return a different promise on subsequent invocations', async function () {
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

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

    describe('promise()', function () {
        it('should return the promise linked to a specific invocation', async function () {
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

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

        it('should return pre generate the promise if invoked before invocation', async function () {
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

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

        [undefined, null, 'abc', true, {}, [], () => undefined].forEach(
            (value) => {
                it(`should default the call index to 0 if a valid number is not specified (value=${value})`, async function () {
                    const instance = new Mockable();
                    const { module: PromiseMock } = await _importModule();

                    const mock = new PromiseMock(instance, 'foo');
                    const promise = instance.foo();
                    /* eslint-disable tsel/no-explicit-any */
                    const callIndex = value as any;

                    const ret = mock.promise(callIndex);
                    expect(ret).to.equal(promise);
                });
            }
        );
    });

    describe('reject()', function () {
        it('should reject the promise linked to a specific invocation', async function () {
            const error = 'something went wrong!';
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

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

            await expect(Promise.all(result)).to.be.fulfilled;
        });

        it('should pre reject the promise if invoked before invocation', async function () {
            const error = 'something went wrong!';
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

            const mock = new PromiseMock(instance, 'foo');

            const promises: Promise<string>[] = [];
            for (let index = 0; index < 10; index++) {
                promises.push(mock.reject(error, index));
            }

            const result = promises.map((promise, index) => {
                expect(promise).to.equal(instance.foo());
                return expect(promise).to.be.rejectedWith(error);
            });

            await expect(Promise.all(result)).to.be.fulfilled;
        });
        [undefined, null, 0, -1, 'foo', true, [], () => undefined].forEach(
            (value) => {
                it(`should default the call index to 0 if a valid number is not specified (value=${value})`, async function () {
                    const error = 'something went wrong!';
                    const instance = new Mockable();
                    const { module: PromiseMock } = await _importModule();

                    const mock = new PromiseMock(instance, 'foo');
                    const promise = instance.foo();
                    promise.catch((ex) => undefined);

                    /* eslint-disable tsel/no-explicit-any */
                    const callIndex = value as any;

                    const ret = mock.reject(error, callIndex);
                    expect(ret).to.equal(promise);
                });
            }
        );
    });

    describe('resolve()', function () {
        it('should resolve the promise linked to a specific invocation', async function () {
            const data = 'bar';
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

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

            await expect(Promise.all(result)).to.be.fulfilled;
        });

        it('should pre resolve the promise if invoked before invocation', async function () {
            const data = 'bar';
            const instance = new Mockable();
            const { module: PromiseMock } = await _importModule();

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

            await expect(Promise.all(result)).to.be.fulfilled;
        });

        [undefined, null, 0, -1, 'foo', true, [], () => undefined].forEach(
            (value) => {
                it(`should default the call index to 0 if a valid number is not specified (value=${value})`, async function () {
                    const data = 'bar!';
                    const instance = new Mockable();
                    const { module: PromiseMock } = await _importModule();

                    const mock = new PromiseMock(instance, 'foo');

                    const promise = instance.foo();

                    /* eslint-disable tsel/no-explicit-any */
                    const callIndex = value as any;
                    const ret = mock.resolve(data, callIndex);
                    expect(ret).to.equal(promise);
                });
            }
        );
    });
});
