import { expect, use as _useWithChai } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import 'mocha';
import { stub } from 'sinon';

_useWithChai(_sinonChai);
_useWithChai(_chaiAsPromised);

import * as _asyncHelper from '../../src/async-helper.js';

describe('asyncHelper', () => {
    describe('wait()', () => {
        it('should throw an error if invoked without a valid delay', () => {
            const error = 'Invalid delay specified (arg #1)';
            const inputs = [undefined, null, 'foo', true, {}, [], stub(), -1];

            inputs.forEach((delay) => {
                const wrapper = (): (() => Promise<void>) => {
                    /* eslint-disable tsel/no-explicit-any */
                    return _asyncHelper.wait(delay as any);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return a function when invoked.', () => {
            const ret = _asyncHelper.wait(10);
            expect(ret).to.be.a('function');
        });

        describe('[response]', () => {
            function _initWaiter<T>(delay = 10): (data: T) => Promise<T> {
                return _asyncHelper.wait(delay);
            }

            it('should return a promise when invoked', () => {
                const wait = _initWaiter<void>();
                const ret = wait();

                expect(ret).to.be.an.instanceof(Promise);
            });

            it('should resolve the promise after the delay expires', async () => {
                const wait = _initWaiter<void>(10);
                const ret = wait();

                return expect(ret).to.be.fulfilled;
            });

            it('should include any data passed to the waiter with the resolution', async () => {
                const wait = _initWaiter<{ foo: string }>(10);
                const data = { foo: 'bar' };
                const ret = wait(data);

                const response = await expect(ret).to.be.fulfilled;
                expect(response).to.equal(data);
            });

            it('should not resolve the promise until the delay expires', async () => {
                const delay = 100;
                const checkCount = 5;
                const wait = _initWaiter<void>(delay);

                const ret = wait();
                let counter = 0;
                const intervalHandle = setInterval(() => {
                    if (counter >= 10) {
                        clearInterval(intervalHandle);
                    } else {
                        counter++;
                    }
                }, delay / checkCount);

                await expect(ret).to.be.fulfilled;
                expect(counter).to.be.at.least(checkCount - 1);
            });
        });
    });
});
