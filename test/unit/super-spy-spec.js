'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;

const _sinon = require('sinon');
const _rewire = require('rewire');

const _superSpy = _rewire('../../src/super-spy');

describe('superSpy', function() {
    function _getParentAndChildClasses() {
        class Parent {}

        class Child extends Parent {
            constructor(...args) {
                super(...args);
            }
        }

        return { Parent, Child };
    }

    it('should implement methods required by the interface', function() {
        expect(_superSpy).to.be.an('object');
        expect(_superSpy.inject).to.be.a('function');
    });

    describe('inject()', () => {
        it('should throw an error if invoked without a valid parent class', () => {
            const error = 'Invalid Parent specified (arg #1)';
            const inputs = [undefined, null, 'foo', true, {}, [], 123, -1];

            inputs.forEach((Parent) => {
                const wrapper = () => {
                    return _superSpy.inject(Parent);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without a valid child class', () => {
            const error = 'Invalid Child specified (arg #1)';
            const inputs = [undefined, null, 'foo', true, {}, [], 123, -1];

            inputs.forEach((Child) => {
                const wrapper = () => {
                    const Parent = () => {};
                    return _superSpy.inject(Parent, Child);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return a class with the expected static properties when invoked', () => {
            const { Parent, Child } = _getParentAndChildClasses();
            const SpyClass = _superSpy.inject(Parent, Child);

            expect(SpyClass).to.be.a('function');
            expect(SpyClass.superSpy).to.be.a('function');
            expect(SpyClass.restore).to.be.a('function');
        });

        describe('SpyClass', () => {
            function _getArgs() {
                return [undefined, null, 'foo', true, {}, [], 123, () => {}];
            }

            it('should return a SpyClass that extends the parent', () => {
                const { Parent, Child } = _getParentAndChildClasses();
                const SpyClass = _superSpy.inject(Parent, Child);

                const spy = new SpyClass();
                expect(spy).to.be.an.instanceof(Parent);
            });

            it("should modify the child class' prototype to point to SpyClass", () => {
                const { Parent, Child } = _getParentAndChildClasses();
                const SpyClass = _superSpy.inject(Parent, Child);

                expect(Object.getPrototypeOf(Child)).to.equal(SpyClass);
            });

            it("should invoke the parent's super() with all arguments passed to it", () => {
                const ctorSpy = _sinon.spy();
                class Parent {
                    constructor(...args) {
                        ctorSpy(...args);
                    }
                }
                class Child extends Parent {}

                const SpyClass = _superSpy.inject(Parent, Child);
                const args = _getArgs();

                expect(ctorSpy).to.not.have.been.called;

                new SpyClass(...args);

                expect(ctorSpy).to.have.been.calledOnce;
                ctorSpy.args[0].forEach((arg, index) => {
                    expect(arg).to.deep.equal(args[index]);
                });
            });

            it('should invoke the spy with a copy of all arguments passed by the child', () => {
                const { Parent, Child } = _getParentAndChildClasses();
                const SpyClass = _superSpy.inject(Parent, Child);
                const args = _getArgs();

                expect(SpyClass.superSpy).to.not.have.been.called;

                new Child(...args);

                expect(SpyClass.superSpy).to.have.been.calledOnce;
                SpyClass.superSpy.args[0].forEach((arg, index) => {
                    expect(arg).to.deep.equal(args[index]);
                });
            });

            describe('restore()', () => {
                it("should restore the child class' prototype to point to the parent", () => {
                    const { Parent, Child } = _getParentAndChildClasses();
                    const SpyClass = _superSpy.inject(Parent, Child);

                    SpyClass.restore();
                    expect(Object.getPrototypeOf(Child)).to.equal(Parent);
                });
            });
        });
    });
});
