'use strict';

/**
 * Utility library that provides useful functionality for writing tests.
 */

/**
 * Helper module that provides utilities for testing of async methods.
 */
export * as asyncHelper from './async-helper';

/**
 * Helper module that provides utilities for manipulating the behavior of
 * console statements.
 */
export * as consoleHelper from './console-helper';

/**
 * Helper module that generates random values to be used during testing.
 */
export * as testValues from './test-values';

/**
 * Class that can be used to create spies on parent methods in class
 * hierarchies.
 */
export * as SuperSpyBuilder from './super-spy-builder';

/**
 * Class that can be used to mock out methods on existing objects, or
 * create new objects with mocked methods.
 */
export * as ObjectMock from './object-mock';
