import Mock from './mock';

type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;
type PromiseReject = (error?: unknown) => void;

/**
 * Private class used to wrap a promise and its reject/resolve methods.
 */
class PromiseWrapper<T> {
    public resolve: PromiseResolve<T>;
    public reject: PromiseReject;
    public promise: Promise<T>;

    constructor() {
        let resolveRef: PromiseResolve<T> = (data: T | PromiseLike<T>) =>
            undefined;
        let rejectRef: PromiseReject = (err?: unknown) => undefined;
        this.promise = new Promise<T>(function (resolve, reject) {
            resolveRef = resolve;
            rejectRef = reject;
        });

        this.resolve = resolveRef;
        this.reject = rejectRef;
    }
}

/**
 * Class that creates a mock method on an object, but is specifically designed
 * for methods that return a promise. Extends the [Mock]{@link Mock} class and
 * provides additional promise specific functionality.
 *
 * <p>
 * This class is not meant to be instantiated directly, but is designed for
 * use within the [ObjectMock]{@link ObjectMock} class.
 * </p>
 */
export default class PromiseMock<T> extends Mock<Promise<T>> {
    private _wrappers: PromiseWrapper<T>[];

    /**
     * @param instance The object instance on which the method will be mocked.
     * @param methodName The name of the method on the object that needs to be
     * mocked. If the specified method does not exist, a placeholder method will
     * be injected into the instance which will then be mocked.
     */
    constructor(instance: Record<string, unknown>, methodName: string) {
        let callIndex = 0;
        super(instance, methodName, (): Promise<T> => {
            const wrapper = this._getPromiseWrapper(callIndex);
            callIndex++;
            return wrapper.promise;
        });

        this._wrappers = [];
    }

    /**
     * Returns a wrapper that contains a reference to a promise object, and the
     * reject and resolve methods of the promise object. This can be used to
     * reject or resolve the promise from outside the mock.
     *
     * If a wrapper for a specific invocation has already been created, it will
     * be returned, if not a new wrapper will be created for the specified
     * index.
     *
     * @private
     * @param callIndex The invocation index for which to get the wrapper.
     *
     * @return A simple object with references to the promise, reject and
     * resolve methods.
     */
    _getPromiseWrapper(callIndex: number): PromiseWrapper<T> {
        let wrapper = this._wrappers[callIndex];

        if (!wrapper) {
            wrapper = new PromiseWrapper<T>();
            this._wrappers[callIndex] = wrapper;
        }
        return wrapper;
    }

    /**
     * Returns the promise associated with a specific invocation of the mock,
     * identified by the call index. This value could reference a future
     * invocation (meaning that the specific invocation of the mock has not yet
     * occurred).
     *
     * Promises for all completed invocations of the mock can be  obtained by
     * inspecting the [responses]{@link Mock#responses} method.
     *
     * <p>
     * The value of this method is that actions can be be assigned to the
     * <code>then(...)</code> callback of the mock even before the mock has
     * been invoked. The use of the [responses]{@link Mock#responses} array
     * is retroactive in nature, and cannot be accessed until after the method
     * has been invoked, which does not always work in asynchronous scenarios.
     * </p>
     *
     * @param callIndex The index of the invocation, with the first
     * invocation starting at index 0. Defaults to 0.
     *
     * @return The promise associated with the specified call index.
     */
    promise(callIndex = 0): Promise<T> {
        if (typeof callIndex !== 'number' || callIndex <= 0) {
            callIndex = 0;
        }
        return this._getPromiseWrapper(callIndex).promise;
    }

    /**
     * Rejects the promise associated with a specific invocation of the mock,
     * identified by the call index. This value could reference a future
     * invocation (meaning that the specific invocation of the mock has not yet
     * occurred).
     *
     * <p>
     * The value of this method is that a rejection can be set on a specific
     * invocation prior to it actually occurring.
     * </p>
     *
     * @param error The rejection response for the promise.  This is typically
     * an error, but can be any value.
     *
     * @param callIndex The index of the invocation, with the first invocation
     * starting at index 0. Defaults to 0.
     *
     * @return The promise associated with the specified call index.
     */
    reject(error?: unknown, callIndex = 0): Promise<T> {
        if (typeof callIndex !== 'number' || callIndex <= 0) {
            callIndex = 0;
        }
        const wrapper = this._getPromiseWrapper(callIndex);
        wrapper.reject(error);
        return wrapper.promise;
    }

    /**
     * Resolves the promise associated with a specific invocation of the mock,
     * identified by the call index. This value could reference a future
     * invocation (meaning that the specific invocation of the mock has not yet
     * occurred).
     *
     * <p>
     * The value of this method is that a resolution can be set on a specific
     * invocation prior to it actually occurring.
     * </p>
     *
     * @param response The resolution response for the promise.  This is
     * typically an error, but can be any value.
     *
     * @param callIndex The index of the invocation, with the first invocation
     * starting at index 0. Defaults to 0.
     *
     * @return The promise associated with the specified call index.
     */
    resolve(response: T, callIndex = 0): Promise<T> {
        if (typeof callIndex !== 'number' || callIndex <= 0) {
            callIndex = 0;
        }
        const wrapper = this._getPromiseWrapper(callIndex);
        wrapper.resolve(response);
        return wrapper.promise;
    }
}
