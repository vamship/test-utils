'use strict';

const _sinon = require('sinon');

/**
 * Allows the injection of an intermediate class between a child class and its
 * parent, enabling the testing of calls to the super() call.
 *
 * @module superSpy
 */
module.exports = {
    /**
     * Injects a spy class between a parent and child class. The spy class will
     * always mirror all calls to the constructor to a sinon spy that can be
     * inspected to perform tests on constructor calls, specifically allowing
     * calls to super() to be tested.
     *
     * @param {Class} Parent The parent class reference
     * @param {Function} Child The child class reference
     *
     * @return {module:superSpy~SpyClass} A reference to the spy class, that in
     *         turn allows the inspection of constructor calls.
     */
    inject: function(Parent, Child) {
        if (typeof Parent !== 'function') {
            throw new Error('Invalid Parent specified (arg #1)');
        }
        if (typeof Child !== 'function') {
            throw new Error('Invalid Child specified (arg #1)');
        }

        const superSpy = _sinon.spy();

        /**
         * Intermediate class that is generated and injected into the hierarchy
         * <p><strong>Parent --> Child hierarchy</strong></p>
         * ,making it:
         * <p><strong>Parent --> SpyClass --> Child</strong></p>
         * This allows the intermediate class to spy on calls to
         * <strong>super()</strong> made by the child class.
         */
        class SpyClass extends Parent {
            constructor(...args) {
                super(...args);
                superSpy(...args);
            }

            /**
             * Returns a reference to the spy method on the child's call to
             * <strong>super()</strong>. The response is a reference to
             * a [sinon spy]{@link http://sinonjs.org/releases/v4.2.2/spies/}.
             *
             * @type {Function}
             */
            static get superSpy() {
                return superSpy;
            }

            /**
             * Restores the relationship between parent and child, by removing
             * this class from the hierarchy. i.e, the relationship goes from:
             * <p><strong>Parent --> SpyClass --> Child</strong></p>
             * to:
             * <p><strong>Parent --> Child</strong></p>
             */
            static restore() {
                Object.setPrototypeOf(Child, Parent);
            }
        }

        Object.setPrototypeOf(Child, SpyClass);
        return SpyClass;
    }
};
