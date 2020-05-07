'use strict';

const _sinon = require('sinon');

/**
 * Builder class that can be used to inject an intermediate spy between a parent
 * class and child class, making it possible to spy on <strong>super()</strong>
 * calls made by the child.
 *
 * The builder also supports injection of mocks on the parent class' prototype,
 * enabling spying on calls made by the child class on methods inherited from
 * the parent class.
 *
 * The class exposes methods that will allow the mock/spy references to be torn
 * down after testing.
 *
 * Calls to <strong>super()</strong> will automatically be spied upon, and the
 * parent class' <strong>super()</strong> method will be called after the spy
 * has been called.
 */
class SuperSpyBuilder {
    /**
     * @param {Class} ParentClass The parent class
     * @param {Class} ChildClass The child class
     */
    constructor(ParentClass, ChildClass) {
        if (typeof ParentClass !== 'function') {
            throw new Error('Invalid Parent class (arg #1)');
        }
        if (typeof ChildClass !== 'function') {
            throw new Error('Invalid Child class (arg #1)');
        }

        this._spiedMethods = {};
        this._mockDefinitions = {};
        this._mocks = {
            super: {
                stub: _sinon.spy(),
            },
        };
        this._ParentClass = ParentClass;
        this._ChildClass = ChildClass;
    }

    /**
     * An object containing references to stub instances for each of the methods
     * on the parent that has been mocked. The stubs returned are references to
     * [sinon stubs]{@link http://sinonjs.org/releases/v4.5.0/stubs/}.
     *
     * @type {Object}
     */
    get mocks() {
        return this._mocks;
    }

    /**
     * Creates a mock on the parent class. The mock method intercepts any calls
     * to the parent method, and logs the invocation against the corresponding
     * mock spy reference.
     *
     * <p>The mocks are not applied to the parent class' prototype until the
     * {@link SuperSpyBuilder.inject} method is called. </p>
     *
     * @param {String} method The name of the method on the parent on which to
     *        apply the mock. If a value of "super()" is passed, an error will
     *        be thrown. This method must be defined by the parent class.
     * @param {Function} [fake=undefined] A fake function that will be invoked
     *        every time the parent method is called. If possible, the function
     *        will be invoked in the context of the instance with a valid
     *        <strong>this</strong> parameter. This will not work if the fake is
     *        an
     *        [arrow function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions}
     * @param {Boolean} [skipSuperMethod=false] A boolean that indicates if the
     *        actual method on the parent should be invoked after the fake is
     *        invoked. The parent method will be invoked by default.
     *
     * @return {Object} A reference to this object (can be used to chain method
     *         calls)
     */
    addMock(method, fake, skipSuperMethod) {
        if (typeof method !== 'string' || method.length <= 0) {
            throw new Error('Invalid method (arg #1)');
        }
        if (method === 'super') {
            throw new Error('Method name cannot be "super" (arg #1)');
        }

        if (typeof this._ParentClass.prototype[method] !== 'function') {
            throw new Error(`Parent class does not define method: [${method}]`);
        }
        if (typeof fake === 'undefined') {
            fake = () => {};
        }
        if (typeof fake !== 'function') {
            throw new Error('Invalid fake (arg #2)');
        }

        this._mockDefinitions[method] = {
            fake,
            invokeSuperMethod: !skipSuperMethod,
        };

        return this;
    }

    /**
     * Generates and injects a spy class between a parent and child class,
     * changing the inheritance hierarchy from:
     *
     * <p><strong>ParentClass --> Child hierarchy</strong></p>
     *
     * to:
     *
     * <p><strong>ParentClass --> SuperSpy --> Child</strong></p>
     *
     * <p>
     * Additionally, this method modifies the parent class prototype, creating
     * mocks as defined by calls to [addMock()]{@link SuperSpyBuilder#addMock}.
     * </p>
     *
     * @return {SuperSpy} A reference to the spy class, that is injected between
     *         the parent and the child.
     */
    inject() {
        const mocks = this.mocks;

        /**
         * Intermediate class that is generated and injected into the hierarchy
         * between the parent class and the child class.  This class will mirror
         * all constructor to a
         * [sinon stub]{@link http://sinonjs.org/releases/v4.5.0/stubs/} that
         * can be inspected to perform tests on constructor calls. This allows
         * calls to super() to be tested.
         *
         * <p>
         * This class is not meant to be (and cannot be) instantiated directly.
         * </p>
         */
        class SuperSpy extends this._ParentClass {
            constructor(...args) {
                mocks.super.stub(...args);
                super(...args);
            }
        }

        Object.setPrototypeOf(this._ChildClass, SuperSpy);

        Object.keys(this._mockDefinitions).forEach((method) => {
            const { fake, invokeSuperMethod } = this._mockDefinitions[method];
            const originalMethod = this._ParentClass.prototype[method];
            const stub = _sinon
                .stub(this._ParentClass.prototype, method)
                .callsFake(function (...args) {
                    let ret = fake.call(this, ...args);
                    if (invokeSuperMethod) {
                        ret = originalMethod.call(this, ...args);
                    }
                    return ret;
                });

            this.mocks[method] = {
                stub,
            };
        });

        return SuperSpy;
    }

    /**
     * Restores the relationship between parent and child, by removing the spy
     * class from the hierarchy, changing the inheritance hierarchy from:
     * <p><strong>ParentClass --> SuperSpy --> Child</strong></p>
     * to:
     * <p><strong>ParentClass --> Child</strong></p>
     * <p>
     * Any mocks injected into the parent class' prototype are also removed,
     * restoring the Parent prototype to its original form.
     * </p>
     */
    restore() {
        Object.setPrototypeOf(this._ChildClass, this._ParentClass);
        Object.keys(this._mockDefinitions).forEach((method) => {
            const methodRef = this._ParentClass.prototype[method];
            if (typeof methodRef.restore === 'function') {
                methodRef.restore();
            }
        });
    }
}

module.exports = SuperSpyBuilder;
