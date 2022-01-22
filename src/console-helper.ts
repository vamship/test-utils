/**
 * Exposes utility methods to help manipulate console statements during
 * testing. This will allow test results to appear clean, without being
 * interrupted by outputs from console.log statements.
 *
 * @module consoleHelper
 */

const _methodNames = ['log', 'info', 'warn', 'error'];
const _consoleMethods = {};
let _isMuted = false;

/**
 * Replaces all console messages with dummy implementations, effectively
 * muting all console related output. This action can be undone by invoking
 * [unmute()]{@link module:consoleHelper.unmute}
 */
export function mute(): void {
    if (_isMuted) {
        return;
    }
    _methodNames.forEach((method) => {
        // eslint-disable-next-line no-console
        _consoleMethods[method] = console[method];

        // eslint-disable-next-line no-console
        console[method] = () => undefined;
    });
    _isMuted = true;
}

/**
 * Unmutes all console output methods by restoring previously saved
 * references to the methods.
 */
export function unmute(): void {
    if (!_isMuted) {
        return;
    }
    for (let method in _consoleMethods) {
        // eslint-disable-next-line no-console
        console[method] = _consoleMethods[method];
    }
    _isMuted = false;
}
