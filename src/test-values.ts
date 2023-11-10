/**
 * Utility module that generates random values to be used during testing.
 * Where possible, generated values are suffixed with a property name to allow
 * for easy debugging.
 *
 * @module TestValues
 */
import { customAlphabet } from 'nanoid/non-secure';
const _generateRandom = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyz',
    5
);

/**
 * A union of multiple types that can be used for testing.
 */
export type AnyInput =
    | undefined
    | null
    | number
    | string
    | boolean
    | Record<string, unknown>
    | Array<unknown>
    | (() => undefined);

/**
 * An multi-type array that can be used for testing.
 */
export type AnyInputList = AnyInput[];

/**
 * Helper method that generates an array of test values, excluding values
 * of specific types as requested.
 *
 * @private
 * @param omit A list of parameters to omit
 * @return An array of test values
 */
function _getTestValues(...omit: AnyInputList): AnyInputList {
    const inputs = [undefined, null, 123, 'abc', true, {}, [], () => undefined];
    return inputs.filter((AnyInput) => {
        let include = true;
        omit.forEach((type) => {
            if (type === 'null' && AnyInput === null) {
                include = false;
            } else if (type === 'array' && AnyInput instanceof Array) {
                include = false;
            } else if (AnyInput instanceof Array || AnyInput === null) {
                // Do nothing, because typeof Array or typeof null
                // evaluates to "object"
            } else if (typeof AnyInput === type) {
                include = false;
            }
        });
        return include;
    });
}

/**
 * Returns an array of test values, omitting the requested arg types. The
 * requested arg types must be the type of the arg to be omitted. For
 * example, string arguments can be omitted by specifying 'string', null
 * values by specifying 'null' and so on.
 *
 * <p>
 * The exception to this rule is for Arrays. Arrays have a type of
 * 'object', but the method will honor the literal string 'array' and
 * strip out array objects when this value is provided.
 * </p>
 *
 * @param omit Args to be omitted from the test values.
 * @return An array of test values
 */
export function allButSelected(...omit: AnyInputList): AnyInputList {
    return _getTestValues(...omit);
}

/**
 * Returns an array of values that has valid samples of all types except
 * an undefined value.
 *
 * @param extras Optional extra parameters to append to the test value list.
 * @return An array of test values
 */
export function allButUndefined(...extras: AnyInputList): AnyInputList {
    return _getTestValues('undefined').concat(extras);
}

/**
 * Returns an array of values that has valid samples of all types except
 * a null value.
 *
 * @param extras Optional extra parameters to append to the test value list.
 * @return An array of test values
 */
export function allButNull(...extras: AnyInputList): AnyInputList {
    return _getTestValues('null').concat(extras);
}

/**
 * Returns an array of values that has valid samples of all types except
 * a string.
 *
 * @param extras Optional extra parameters to append to the test
 *        value list.
 * @return An array of test values
 */
export function allButString(...extras: AnyInputList): AnyInputList {
    return _getTestValues('string').concat(extras);
}

/**
 * Returns an array of values that has valid samples of all types except
 * a number.
 *
 * @param extras Optional extra parameters to append to the test
 *        value list.
 * @return An array of test values
 */
export function allButNumber(...extras: AnyInputList): AnyInputList {
    return _getTestValues('number').concat(extras);
}

/**
 * Returns an array of values that has valid samples of all types except
 * an object.
 *
 * @param extras Optional extra parameters to append to the test
 *        value list.
 * @return An array of test values
 */
export function allButObject(...extras: AnyInputList): AnyInputList {
    return _getTestValues('object').concat(extras);
}

/**
 * Returns an array of values that has valid samples of all types except
 * an array.
 *
 * @param extras Optional extra parameters to append to the test
 *        value list.
 * @return An array of test values
 */
export function allButArray(...extras: AnyInputList): AnyInputList {
    return _getTestValues('array').concat(extras);
}

/**
 * Returns an array of values that has valid samples of all types except
 * a function.
 *
 * @param extras Optional extra parameters to append to the test
 *        value list.
 * @return An array of test values
 */
export function allButFunction(...extras: AnyInputList): AnyInputList {
    return _getTestValues('function').concat(extras);
}

/**
 * Returns an array of values that has valid samples of all types except
 * a boolean.
 *
 * @param extras Optional extra parameters to append to the test
 *        value list.
 * @return An array of test values
 */
export function allButBoolean(...extras: AnyInputList): AnyInputList {
    return _getTestValues('boolean').concat(extras);
}

/**
 * Generates and returns a new random string, prefixed with the specified
 * value.
 *
 * @param {String} [prefix=''] A constant prefix for the generated value.
 *        Useful when debugging tests.
 *
 * @return {AnyInput} The generated string.
 */
export function getString(prefix: AnyInput): string {
    if (typeof prefix !== 'string' || prefix.length <= 0) {
        prefix = '';
    } else {
        prefix = `${prefix}_`;
    }
    return `${prefix}${_generateRandom()}`;
}

/**
 * Generates and returns a timestamp value based on the current timestamp,
 * shifted up or down by a random value within the specified range.
 *
 * @param {AnyInput} [range=10000] The range (in milliseconds) to use when
 *        generating random shifts. Positive values shift up, negative
 *        values shift down.
 * @param {AnyInput} [start=<current time>] An optional start timestamp,
 *        defaults to the current time.
 *
 * @return {Number} A timestamp value used for testing.
 */
export function getTimestamp(range: AnyInput, start: AnyInput): number {
    if (typeof start !== 'number' || start <= 0) {
        start = Date.now();
    }
    if (typeof range !== 'number') {
        range = 10000;
    }
    return start + Math.floor(Math.random() * range);
}

/**
 * Generates and returns a random integer by using the start value, shifted
 * up or down by a random value within the specified range.
 *
 * @param {AnyInput} [range=100] The range from which to choose the number.
 *        Positive value shift up, negative values shift down.
 * @param {AnyInput} [start=0] An optional start point, defaults to 0.
 *
 * @return {Number} A random number generated within the range.
 */
export function getNumber(range: AnyInput, start: AnyInput): number {
    if (typeof start !== 'number') {
        start = 0;
    }
    if (typeof range !== 'number') {
        range = 100;
    }
    return start + Math.floor(Math.random() * range);
}
