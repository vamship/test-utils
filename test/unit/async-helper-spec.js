'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;
const _rewire = require('rewire');

let _asyncHelper = null;
const Promise = require('bluebird').Promise;

describe('asyncHelper', function() {
    beforeEach(() => {
        _asyncHelper = _rewire('../../src/async-helper');
    });

    it('should implement methods required by the interface', function() {
        expect(_asyncHelper.wait).to.be.a('function');
    });

    describe('wait()', () => {
        it('should throw an error if invoked without a valid delay', () => {
            const error = 'Invalid delay specified (arg #1)';
            const inputs = [undefined, null, 'foo', true, {}, [], () => {}, -1];

            inputs.forEach((delay) => {
                const wrapper = () => {
                    return _asyncHelper.wait(delay);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return a function when invoked.', () => {
            const ret = _asyncHelper.wait(10);
            expect(ret).to.be.a('function');
        });

        describe('[response]', () => {
            function _initWaiter(delay) {
                if (typeof delay !== 'number' || delay <= 0) {
                    delay = 10;
                }
                return _asyncHelper.wait(delay);
            }

            it('should return a promise when invoked', () => {
                const wait = _initWaiter();
                const ret = wait();

                expect(ret).to.be.an.instanceof(Promise);
            });

            it('should resolve the promise after the delay expires', (done) => {
                const wait = _initWaiter(10);
                const ret = wait();

                expect(ret).to.be.fulfilled.and.notify(done);
            });

            it('should include any data passed to the waiter with the resolution', (done) => {
                const wait = _initWaiter(10);
                const data = { foo: 'bar' };
                const ret = wait(data);

                expect(ret)
                    .to.be.fulfilled.then((response) => {
                        expect(response).to.equal(data);
                    })
                    .then(done, done);
            });

            it('should not resolve the promise until the delay expires', (done) => {
                const delay = 100;
                const checkCount = 5;
                const wait = _initWaiter(delay);

                const ret = wait();
                let counter = 0;
                const intervalHandle = setInterval(() => {
                    if (counter >= 10) {
                        clearInterval(intervalHandle);
                    } else {
                        counter++;
                    }
                }, delay / checkCount);

                expect(ret)
                    .to.be.fulfilled.then(() => {
                        expect(counter).to.be.at.least(checkCount - 1);
                    })
                    .then(done, done);
            });
        });
    });
});
