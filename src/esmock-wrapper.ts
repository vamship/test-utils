// This is a wraper module for esmock that is used to test esmock functionality.
// Wrapping esmock in a separate module allows esmock to mock out the separate
// module instead of attempting to mock itself (which does not seem to work).
import _esmock from 'esmock';

/**
 * Reference to the esmock object.
 */
export default _esmock;
