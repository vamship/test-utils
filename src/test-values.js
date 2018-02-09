'use strict';

function _getTestValues(...omit) {
    const inputs = [undefined, null, 123, 'abc', true, {}, [], () => {}];
    return inputs.filter((testValue) => {
        let include = true;
        omit.forEach((type) => {
            if (type === 'null' && testValue === null) {
                include = false;
            } else if (type === 'array' && testValue instanceof Array) {
                include = false;
            } else if (testValue instanceof Array || testValue === null) {
                // Do nothing, because typeof Array or typeof null
                // evaluates to "object"
            } else if (typeof testValue === type) {
                include = false;
            }
        });
        return include;
    });
}

/**
 * Utility module that generates random values to be used during testing.
 * Where possible, generated values are suffixed with a property name to allow
 * for easy debugging.
 *
 * @module testValues
 */
module.exports = {
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
     * @param {...*} [omit] Args to be omitted from the test values.
     *
     * @return {Array} An array of test values
     */
    allButSelected: function(...omit) {
        return _getTestValues(...omit);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * an undefined value.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButUndefined: function(...extras) {
        return _getTestValues('undefined').concat(extras);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * a null value.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButNull: function(...extras) {
        return _getTestValues('null').concat(extras);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * a string.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButString: function(...extras) {
        return _getTestValues('string').concat(extras);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * a number.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButNumber: function(...extras) {
        return _getTestValues('number').concat(extras);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * an object.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButObject: function(...extras) {
        return _getTestValues('object').concat(extras);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * an array.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButArray: function(...extras) {
        return _getTestValues('array').concat(extras);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * a function.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButFunction: function(...extras) {
        return _getTestValues('function').concat(extras);
    },

    /**
     * Returns an array of values that has valid samples of all types except
     * a boolean.
     *
     * @param {...*} [extras] Optional extra parameters to append to the test
     *        value list.
     * @return {Array} An array of test values
     */
    allButBoolean: function(...extras) {
        return _getTestValues('boolean').concat(extras);
    }
};
