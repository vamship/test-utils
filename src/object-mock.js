'use strict';

const _sinon = require('sinon');
const Mock = require('./mock');
const PromiseMock = require('./promise-mock');

/**
 * A mocker object that can be used to selectively mock methods on an existing
 * object, or to create a new object with mock methods for testing.
 */
class ObjectMock {
    /**
     * @param {Object} [instance={}] The object instance on which the mocks
     *        will be created. If omitted, a default empty object will be used.
     */
    constructor(instance) {
        if (
            !instance ||
            instance instanceof Array ||
            typeof instance !== 'object'
        ) {
            instance = {};
        }
        this._instance = instance;
        this._ctor = _sinon.stub().returns(this._instance);
        this._mocks = {};
    }

    /**
     * A refence to the object that is being mocked.
     *
     * @type {Object}
     */
    get instance() {
        return this._instance;
    }

    /**
     * Returns a reference to the constructor of the mocked object. This is
     * a mock constructor that returns a reference to the object being mocked.
     *
     * @type {Function}
     */
    get ctor() {
        return this._ctor;
    }

    /**
     * Reference to an object containing references to mocks for each method
     * on the instance that has been mocked.
     *
     * @return {Mock} A map containing the info about defined stubs
     */
    get mocks() {
        return this._mocks;
    }

    /**
     * Adds a mock for the specified method.
     *
     * @param {String} methodName The name of the method to be mocked. If the
     *        method does not exist, an empty placeholder method will be creted
     *        and then mocked.
     * @param {*} [returnValue=undefined] The return value of the mocked
     *        method. If this parameter is a function, the function will be
     *        invoked, and its response will be returned.
     *
     * @return {Object} A reference to the mock object (can be used to chain
     *         method calls)
     */
    addMock(methodName, returnValue) {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName specified (arg #1)');
        }
        this._mocks[methodName] = new Mock(
            this.instance,
            methodName,
            returnValue
        );
        return this;
    }

    /**
     * Adds a mock for the specified method, treating the method as one that
     * returns a promise.
     *
     * @param {String} methodName The name of the method to be mocked. If the
     *        method does not exist, an empty placeholder method will be creted
     *        and then mocked.
     *
     * @return {Object} A reference to the mock object (can be used to chain
     *         method calls)
     */
    addPromiseMock(methodName) {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName specified (arg #1)');
        }
        this._mocks[methodName] = new PromiseMock(this.instance, methodName);
        return this;
    }

    /**
     * Removes a mock for the specified method, and restores the original
     * method. If no mocks have been defined for the specified method name,
     * no changes will be made for that method.
     *
     * @param {String} methodName The name of the method for which mocks will
     *        be removed.
     *
     * @return {Object} A reference to the mock object (can be used to chain
     *         method calls)
     */
    restore(methodName) {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName specified (arg #1)');
        }
        if (this._mocks[methodName]) {
            this._mocks[methodName].stub.restore();
            delete this._mocks[methodName];
        }
        return this;
    }
}

module.exports = ObjectMock;
