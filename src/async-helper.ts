/**
 * Exposes utility methods to help execution of async tests.
 * @module asyncHelper
 */

/**
 * Returns a function that can be used to trigger an asynchronous delay. When
 * invoked, the function returns a promise that will be resolved after the
 * specified dealay. The delay function accepts data that will be passed as the
 * result of the resolution of the promise.
 *
 * Useful when relying on timing to ensure that tests are evaluated correctly,
 * or to yield to the javascript runtime.
 *
 * @param delay The delay (in milliseconds) after which the promise will be
 * resolved.
 *
 * @return A function that returns a romise that will be resolved once the delay
 *         expires.
 */
export function wait<T>(delay: number): (data?: T) => Promise<T | void> {
    if (typeof delay !== 'number' || delay <= 0) {
        throw new Error('Invalid delay specified (arg #1)');
    }
    return (data?: T): Promise<T | void> => {
        return new Promise((resolve) => setTimeout(() => resolve(data), delay));
    };
}
