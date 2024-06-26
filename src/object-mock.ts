import _sinon from 'sinon';
import { Mock, MockResponse } from './mock.js';
import PromiseMock from './promise-mock.js';
import { SinonStub } from 'sinon';

/**
 * A map of mock objects, keyed by the method name.
 * @typeparam T The type of the object being mocked.
 */
export type MockMap<T> = Record<string, Mock<T, unknown>>;

/**
 * Interface for mocked class types.
 */
export interface MockedClass<T> {
    /**
     * The constructor of the mocked class.
     */
    (...args: unknown[]): void;

    /**
     * The prototype of the mocked class.
     */
    prototype: T;

    /**
     * Reference to a stub that can be used to check if the constructor was
     * invoked.
     */
    stub: SinonStub<unknown[], T>;
}

/**
 * A mocker object that can be used to selectively mock methods on an existing
 * object, or to create a new object with mock methods for testing.
 *
 * @typeparam T The type of the object being mocked.
 */
export class ObjectMock<T> {
    private _instance: T;
    private _ctor: SinonStub<unknown[], T>;
    private _mocks: MockMap<T>;
    private _classDef: MockedClass<T>;

    /**
     * @param instance The object instance on which the mocks will be created.
     * If omitted, a default empty object will be used.
     */
    constructor(instance?: T) {
        if (
            !instance ||
            instance instanceof Array ||
            typeof instance !== 'object'
        ) {
            instance = {} as T;
        }
        const ctorStub = _sinon.stub().returns(instance);
        const classDef: MockedClass<T> = function (...args: unknown[]): void {
            if (!new.target) {
                ctorStub(...args);
            } else {
                /* eslint-disable-next-line tsel/no-explicit-any */
                new (ctorStub as any)(...args);
            }
        };
        classDef.prototype = instance;
        classDef.stub = ctorStub;

        this._instance = instance;
        this._ctor = ctorStub;
        this._mocks = {};
        this._classDef = classDef;
    }

    /**
     * Gets a reference to the constructor of the mocked object. This method
     * should be preferred over {@link ctor}.
     */
    get classDef(): MockedClass<T> {
        return this._classDef;
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
     *
     * @deprecated Use {@link classDef} instead.
     */
    get ctor(): SinonStub<unknown[], T> {
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
     * Utility method that returns a mock object for the specified method, type
     * cast to a promise mock.
     *
     * @param methodName The name of the method to be mocked. If the method does
     * not exist, an error will be thrown.
     *
     * @typeparam U The return type of the mocked method.
     *
     * @return The mock associated with the specified method, type cast to a
     * promise mock.
     */
    getPromiseMock<U>(methodName: string): PromiseMock<T, U> {
        return this.getMock(methodName) as PromiseMock<T, U>;
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
