import _sinon from 'sinon';
import Mock, { MockResponse } from './mock.js';
import PromiseMock from './promise-mock.js';

type MockMap<T> = Record<string, Mock<T, unknown>>;

/**
 * A mocker object that can be used to selectively mock methods on an existing
 * object, or to create a new object with mock methods for testing.
 *
 * @typeparam T The type of the object being mocked.
 */
export class ObjectMock<T> {
    private _instance: T;
    private _ctor: (...args: unknown[]) => T;
    private _mocks: MockMap<T>;
    /**
     * @param instance The object instance on which the mocks will be created.
     * If omitted, a default empty object will be used.
     */
    constructor(instance: T) {
        if (
            !instance ||
            instance instanceof Array ||
            typeof instance !== 'object'
        ) {
            instance = {} as T;
        }
        this._instance = instance;
        this._ctor = _sinon.stub().returns(this._instance);
        this._mocks = {};
    }

    /**
     * A refence to the object that is being mocked.
     */
    get instance(): T {
        return this._instance;
    }

    /**
     * Returns a reference to the constructor of the mocked object. This is
     * a mock constructor that returns a reference to the object being mocked.
     */
    get ctor(): (...args: unknown[]) => T {
        return this._ctor;
    }

    /**
     * Reference to an object containing references to {@link Mock} objects for
     * each method on the instance that has been mocked.
     */
    get mocks(): MockMap<T> {
        return this._mocks;
    }

    /**
     * Returns a mock object for the specified method.
     *
     * @param methodName The name of the method to be mocked. If the method does
     * not exist, an error will be thrown.
     *
     * @typeparam U The return type of the mocked method.
     *
     * @return The mock associated with the specified method.
     */
    getMock<U>(methodName: string): Mock<T, U> {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName (arg #1)');
        }

        const mock = this._mocks[methodName];
        if (typeof mock === 'undefined') {
            throw new Error(`Method has not been mocked [${methodName}]`);
        }

        return mock as Mock<T, U>;
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
    addMock<U>(
        methodName: string,
        returnValue: MockResponse<U>,
    ): ObjectMock<T> {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName specified (arg #1)');
        }

        this._mocks[methodName] = new Mock<T, U>(
            this.instance,
            methodName,
            returnValue,
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
    addPromiseMock<U>(methodName: string): ObjectMock<T> {
        if (typeof methodName !== 'string' || methodName.length <= 0) {
            throw new Error('Invalid methodName specified (arg #1)');
        }
        this._mocks[methodName] = new PromiseMock<T, U>(
            this.instance,
            methodName,
        );
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
    restore(methodName: string): ObjectMock<T> {
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
