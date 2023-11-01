'use strict';

/**
 * Utility library that provides useful functionality for writing tests.
 */

/**
 * Helper module that provides utilities for testing of async methods.
 */
export * as asyncHelper from './async-helper.js';

/**
 * Helper module that generates random values to be used during testing.
 */
export * as testValues from './test-values.js';

/**
 * Class that can be used to mock out methods on existing objects, or
 * create new objects with mocked methods.
 */
export { ObjectMock } from './object-mock.js';
