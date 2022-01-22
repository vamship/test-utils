import _sinon from 'sinon';
import Mock, { MockResponse } from './mock';
import PromiseMock from './promise-mock';

type MockInstance = Record<string, unknown>;
type MockMap = Record<string, Mock<unknown>>;

/**
 * A mocker object that can be used to selectively mock methods on an existing
 * object, or to create a new object with mock methods for testing.
 */
export default class ObjectMock {
    private _instance: MockInstance;
    private _ctor: (...args) => MockInstance;
    private _mocks: MockMap;
    /**
     * @param instance The object instance on which the mocks will be created.
     * If omitted, a default empty object will be used.
     */
    constructor(instance: Record<string, unknown> = {}) {
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
     */
    get instance(): MockInstance {
        return this._instance;
    }

    /**
     * Returns a reference to the constructor of the mocked object. This is
     * a mock constructor that returns a reference to the object being mocked.
     *
     * @type {Function}
     */
    get ctor(): (...args) => MockInstance {
        return this._ctor;
    }

    /**
     * Reference to an object containing references to {@link Mock} objects for
     * each method on the instance that has been mocked.
     *
     * @type {Object}
     */
    get mocks(): MockMap {
        return this._mocks;
    }

    /**
     * Adds a mock for the specified method.
     *
     * @param methodName The name of the method to be mocked. If the method does
     * not exist, an empty placeholder method will be creted and then mocked.
     * @param returnValue The return value of the mocked method. If this
     * parameter is a function, the function will be invoked, and its response
     * will be returned.
     *
     * @return A reference to the mock object (can be used to chain method
     * calls)
     */
    addMock<T>(methodName: string, returnValue: MockResponse<T>): ObjectMock {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName specified (arg #1)');
        }
        this._mocks[methodName] = new Mock<T>(
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
     * @param methodName The name of the method to be mocked. If the method does
     * not exist, an empty placeholder method will be creted and then mocked.
     *
     * @return A reference to the mock object (can be used to chain method
     * calls)
     */
    addPromiseMock<T>(methodName: string): ObjectMock {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName specified (arg #1)');
        }
        this._mocks[methodName] = new PromiseMock<T>(this.instance, methodName);
        return this;
    }

    /**
     * Removes a mock for the specified method, and restores the original
     * method. If no mocks have been defined for the specified method name,
     * no changes will be made for that method.
     *
     * @param methodName The name of the method for which mocks will be removed.
     *
     * @return A reference to the mock object (can be used to chain method
     * calls)
     */
    restore(methodName: string): ObjectMock {
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
