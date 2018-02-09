'use strict';

/**
 * Utility library that provides useful functionality for writing tests.
 *
 * @module testUtils
 */
module.exports = {
    /**
     * Helper module that provides utilities for testing of async methods.
     *
     * @type {module:asyncHelper}
     */
    asyncHelper: require('./async-helper'),

    /**
     * Helper module that provides utilities for manipulating the behavior of
     * console statements.
     *
     * @type {module:consoleHelper}
     */
    consoleHelper: require('./console-helper')
};
