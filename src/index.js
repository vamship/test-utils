'use strict';

/**
 * Utility library that provides useful functionality for writing tests.
 */
module.exports = {
    /**
     * Helper module that provides utilities for testing of async methods.
     */
    asyncHelper: require('./async-helper'),

    /**
     * Helper module that provides utilities for manipulating the behavior of
     * console statements.
     */
    consoleHelper: require('./console-helper'),

    /**
     * Helper module that generates random values to be used during testing.
     */
    testValues: require('./test-values'),

    /**
     * Helper module that can be used to spy on super() calls in parent-child
     * inheritance hierarchies.
     */
    superSpy: require('./super-spy'),

    /**
     * Class that can be used to mock out methods on existing objects, or
     * create new objects with mocked methods.
     */
    ObjectMock: require('./object-mock')
};
