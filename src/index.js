'use strict';

module.exports = {
    /**
     * Helper module that provides utilities for testing of async methods.
     *
     * @return {Object} Reference to the async helper module.
     */
    asyncHelper: require('./async-helper'),

    /**
     * Helper module that provides utilities for manipulating the behavior of
     * console statements.
     *
     * @return {Object} Reference to the console helper module.
     */
    consoleHelper: require('./console-helper')
};
