'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;

const _sinon = require('sinon');
const _rewire = require('rewire');
const {customAlphabet} = require('nanoid/non-secure');
const _generateRandom = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyz',
    5
);

const SuperSpyBuilder = _rewire('../../src/super-spy-builder');

describe('SuperSpyBuilder', () => {
    function _getParentAndChildClasses() {
        class Parent {
            testMethod1() {}
            testMethod2() {}
            get testProp1() {
                return '';
            }
        }

        class Child extends Parent {
            constructor(...args) {
                super(...args);
            }
        }

        return { Parent, Child };
    }

    function _createInstance(Parent, Child) {
        const defaultClasses = _getParentAndChildClasses();
        Parent = Parent || defaultClasses.Parent;
        Child = Child || defaultClasses.Child;

        return new SuperSpyBuilder(Parent, Child);
    }

    function _getArgs() {
        return [undefined, null, 'foo', true, {}, [], 123, () => {}];
    }

    describe('ctor()', () => {
        it('should throw an error if invoked without a valid parent class', () => {
            const error = 'Invalid Parent class (arg #1)';
            const inputs = [undefined, null, 'foo', true, {}, [], 123, -1];

            inputs.forEach((Parent) => {
                const wrapper = () => {
                    return new SuperSpyBuilder(Parent);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without a valid child class', () => {
            const error = 'Invalid Child class (arg #1)';
            const inputs = [undefined, null, 'foo', true, {}, [], 123, -1];

            inputs.forEach((Child) => {
                const wrapper = () => {
                    const Parent = () => {};
                    return new SuperSpyBuilder(Parent, Child);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should return an object with the expected methods and properties', () => {
            const { Parent, Child } = _getParentAndChildClasses();
            const builder = new SuperSpyBuilder(Parent, Child);

            expect(builder).to.be.an('object');
            expect(builder.mocks).to.be.an('object');
            expect(builder.inject).to.be.a('function');
            expect(builder.addMock).to.be.a('function');
            expect(builder.restore).to.be.a('function');
        });
    });

    describe('mocks', () => {
        it('should contain a spy for the super() call', () => {
            const builder = _createInstance();
            const mocks = builder.mocks;

            expect(mocks).to.be.an('object');
            expect(Object.keys(mocks)).to.deep.equal(['super']);
            expect(mocks.super).to.be.an('object');
            expect(mocks.super.stub).to.be.a('function');
        });
    });

    describe('inject()', () => {
        it('should return a SpyClass that extends the parent', () => {
            const { Parent, Child } = _getParentAndChildClasses();
            const builder = _createInstance(Parent, Child);
            const SpyClass = builder.inject();

            const spy = new SpyClass();
            expect(spy).to.be.an.instanceof(Parent);
        });

        it('should modify the prototype of the child class to point to SpyClass', () => {
            const { Parent, Child } = _getParentAndChildClasses();
            const builder = _createInstance(Parent, Child);
            const SpyClass = builder.inject();

            expect(Object.getPrototypeOf(Child)).to.equal(SpyClass);
        });

        it('should invoke the super spy with a copy of all arguments passed to it', () => {
            const { Child } = _getParentAndChildClasses();
            const builder = _createInstance(undefined, Child);

            builder.inject();

            const args = _getArgs();
            const superMethod = builder.mocks.super;

            expect(superMethod.stub).to.not.have.been.called;

            new Child(...args);

            expect(superMethod.stub).to.have.been.calledOnce;
            args.forEach((arg, index) => {
                expect(superMethod.stub.args[0][index]).to.deep.equal(arg);
            });
        });

        it('should invoke super() of the parent with all arguments passed to it', () => {
            const ctorSpy = _sinon.spy();
            class Parent {
                constructor(...args) {
                    ctorSpy(...args);
                }
            }
            class Child extends Parent {}

            const builder = _createInstance(Parent, Child);
            const SpyClass = builder.inject();
            const args = _getArgs();

            expect(ctorSpy).to.not.have.been.called;

            new SpyClass(...args);

            expect(ctorSpy).to.have.been.calledOnce;
            args.forEach((arg, index) => {
                expect(ctorSpy.args[0][index]).to.deep.equal(arg);
            });
        });
    });

    describe('addMock()', () => {
        it('should throw an error if invoked without a valid method', () => {
            const error = 'Invalid method (arg #1)';
            const inputs = [undefined, null, '', true, {}, [], 123, () => {}];

            inputs.forEach((method) => {
                const wrapper = () => {
                    const builder = _createInstance();
                    builder.addMock(method);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if the method name is "super()"', () => {
            const error = 'Method name cannot be "super" (arg #1)';

            const wrapper = () => {
                const builder = _createInstance();
                builder.addMock('super');
            };
            expect(wrapper).to.throw(error);
        });

        it('should throw an error if the spy methods are not valid functions on the parent', () => {
            const inputs = ['foo', 'bar', 'testProp1'];

            inputs.forEach((method) => {
                const error = `Parent class does not define method: [${method}]`;

                const wrapper = () => {
                    const builder = _createInstance();
                    builder.addMock(method);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if a fake is defined and not a valid function', () => {
            const error = 'Invalid fake (arg #2)';
            const inputs = [null, 'foo', true, {}, [], 123];

            inputs.forEach((fake) => {
                const wrapper = () => {
                    const builder = _createInstance();
                    builder.addMock('testMethod1', fake);
                };

                expect(wrapper).to.throw(error);
            });
        });

        it('should not throw an error if the fake is undefined', () => {
            const wrapper = () => {
                const builder = _createInstance();
                builder.addMock('testMethod1', undefined);
            };

            expect(wrapper).to.not.throw();
        });

        it('should return a reference to the builder object', () => {
            const builder = _createInstance();
            const ret = builder.addMock('testMethod1');

            expect(ret).to.equal(builder);
        });

        it('should create a spy for the spy method name', () => {
            const builder = _createInstance();
            const methods = ['testMethod1', 'testMethod2'];

            methods.forEach((method) => {
                builder.addMock(method);
            });

            builder.inject();

            const methodNames = Object.keys(builder.mocks);
            expect(methodNames).to.have.members(methods.concat('super'));
        });

        it('should invoke method spy with all arguments passed to it', () => {
            const builder = _createInstance();
            const methods = ['testMethod1', 'testMethod2'];
            methods.forEach((method) => {
                builder.addMock(method);
            });

            const SpyClass = builder.inject();
            const spy = new SpyClass();

            const args = _getArgs();
            methods.forEach((method) => {
                const methodRef = builder.mocks[method];
                expect(methodRef.stub).to.not.have.been.called;
                spy[method](...args);
                expect(methodRef.stub).to.have.been.calledOnce;
                args.forEach((arg, index) => {
                    expect(methodRef.stub.args[0][index]).to.deep.equal(arg);
                });
            });
        });

        it('should invoke the fake if a fake was specified with the mock', () => {
            const builder = _createInstance();
            const methods = ['testMethod1', 'testMethod2'];
            const fakes = {};

            methods.forEach((method) => {
                const fake = _sinon.spy();
                builder.addMock(method, fake);
                fakes[method] = fake;
            });

            const SpyClass = builder.inject();
            const spy = new SpyClass();

            const args = _getArgs();
            methods.forEach((method) => {
                const fake = fakes[method];
                expect(fake).to.not.have.been.called;
                spy[method](...args);
                expect(fake).to.have.been.calledOnce;
                args.forEach((arg, index) => {
                    expect(fake.args[0][index]).to.deep.equal(arg);
                });
            });
        });

        it('should invoke the fake with the correct "this" binding', () => {
            const builder = _createInstance();
            const methods = ['testMethod1', 'testMethod2'];
            const results = [_generateRandom(), _generateRandom()];

            methods.forEach((method, index) => {
                const fake = function () {
                    this.newProperty = results[index];
                };
                builder.addMock(method, fake);
            });

            const SpyClass = builder.inject();

            methods.forEach((method, index) => {
                const spy = new SpyClass();
                expect(spy.newProperty).to.be.undefined;
                spy[method]();
                expect(spy.newProperty).to.equal(results[index]);
            });
        });

        it('should not invoke the super class method if skipSuperMethod is truthy', () => {
            const flags = [1, 'foo', {}, [], () => {}];
            flags.forEach((flag) => {
                const { Parent } = _getParentAndChildClasses();
                const parentMethodSpies = {};
                const methods = ['foo', 'bar', 'baz'];
                methods.forEach((method) => {
                    const spy = _sinon.spy();
                    parentMethodSpies[method] = spy;
                    Parent.prototype[method] = function (...args) {
                        spy(...args);
                    };
                });
                const builder = _createInstance(Parent);

                methods.forEach((method) => {
                    builder.addMock(method, undefined, flag);
                });

                const SpyClass = builder.inject();
                const spy = new SpyClass();

                const args = _getArgs();
                methods.forEach((method) => {
                    const parentMethod = parentMethodSpies[method];

                    expect(parentMethod).to.not.have.been.called;
                    spy[method](...args);
                    expect(parentMethod).to.not.have.been.called;

                    parentMethod.resetHistory();
                });
            });
        });

        it('should return the response from the fake if skipSuperMethod is truthy', () => {
            const flags = [1, 'foo', {}, [], () => {}];
            flags.forEach((flag) => {
                const builder = _createInstance();
                const methods = ['testMethod1', 'testMethod2'];
                const results = [_generateRandom(), _generateRandom()];

                methods.forEach((method, index) => {
                    const fake = function () {
                        return results[index];
                    };
                    builder.addMock(method, fake, flag);
                });

                const SpyClass = builder.inject();

                methods.forEach((method, index) => {
                    const spy = new SpyClass();
                    const ret = spy[method]();
                    expect(ret).to.equal(results[index]);
                });
            });
        });

        it('should invoke the super class method if skipSuperMethod is falsy', () => {
            const flags = [undefined, 0, '', null, false];
            flags.forEach((flag) => {
                const { Parent } = _getParentAndChildClasses();
                const parentMethodSpies = {};
                const methods = ['foo', 'bar', 'baz'];
                methods.forEach((method) => {
                    const spy = _sinon.spy();
                    parentMethodSpies[method] = spy;
                    Parent.prototype[method] = function (...args) {
                        spy(...args);
                    };
                });
                const builder = _createInstance(Parent);

                const SpyClass = builder.inject();
                const spy = new SpyClass();

                methods.forEach((method) => {
                    builder.addMock(method, undefined, flag);
                });

                const args = _getArgs();
                methods.forEach((method) => {
                    const parentMethod = parentMethodSpies[method];

                    expect(parentMethod).to.not.have.been.called;
                    spy[method](...args);
                    expect(parentMethod).to.have.been.calledOnce;
                    args.forEach((arg, index) => {
                        expect(parentMethod.args[0][index]).to.deep.equal(arg);
                    });

                    parentMethod.resetHistory();
                });
            });
        });

        it('should return the response from the super class method if skipSuperMethod is falsy', () => {
            const flags = [undefined, 0, '', null, false];
            flags.forEach((flag) => {
                const { Parent } = _getParentAndChildClasses();
                const methods = ['foo', 'bar'];
                const results = [_generateRandom(), _generateRandom()];
                methods.forEach((method, index) => {
                    Parent.prototype[method] = function () {
                        return results[index];
                    };
                });
                const builder = _createInstance(Parent);

                methods.forEach((method, index) => {
                    builder.addMock(method, undefined, flag);
                });

                const SpyClass = builder.inject();

                methods.forEach((method, index) => {
                    const spy = new SpyClass();
                    const ret = spy[method]();
                    expect(ret).to.equal(results[index]);
                });
            });
        });

        it('should invoke the super class method with the correct "this" binding', () => {
            const flags = [undefined, 0, '', null, false];
            flags.forEach((flag) => {
                const { Parent } = _getParentAndChildClasses();
                const methods = ['foo', 'bar'];
                const results = [_generateRandom(), _generateRandom()];
                methods.forEach((method, index) => {
                    Parent.prototype[method] = function () {
                        this.newProperty = results[index];
                    };
                });
                const builder = _createInstance(Parent);

                methods.forEach((method, index) => {
                    builder.addMock(method, undefined, flag);
                });

                const SpyClass = builder.inject();

                methods.forEach((method, index) => {
                    const spy = new SpyClass();
                    expect(spy.newProperty).to.be.undefined;
                    spy[method]();
                    expect(spy.newProperty).to.equal(results[index]);
                });
            });
        });
    });

    describe('restore()', () => {
        it('should remove the spy class from the class hierarchy', () => {
            const { Parent, Child } = _getParentAndChildClasses();
            const builder = _createInstance(Parent, Child);

            builder.inject();
            builder.restore();

            expect(Object.getPrototypeOf(Child)).to.equal(Parent);
        });

        it('should remove any mocks created by the builder', () => {
            const { Parent } = _getParentAndChildClasses();
            const builder = _createInstance(Parent);
            const methods = ['testMethod1', 'testMethod2'];
            const originalMethods = {};

            methods.forEach((method) => {
                originalMethods[method] = Parent.prototype[method];
            });

            methods.forEach((method) => {
                builder.addMock(method, undefined);
            });

            builder.inject();

            methods.forEach((method) => {
                const parentMethod = Parent.prototype[method];
                const originalMethod = originalMethods[method];

                expect(parentMethod).to.not.equal(originalMethod);
            });

            builder.restore();

            methods.forEach((method) => {
                const parentMethod = Parent.prototype[method];
                const originalMethod = originalMethods[method];

                expect(parentMethod).to.equal(originalMethod);
            });
        });

        it('should do nothing if the spy has not been injected', () => {
            const { Parent } = _getParentAndChildClasses();
            const builder = _createInstance(Parent);
            const methods = ['testMethod1', 'testMethod2'];

            methods.forEach((method) => {
                builder.addMock(method, undefined);
            });

            const wrapper = () => {
                builder.restore();
            };

            expect(wrapper).to.not.throw();
        });
    });
});
