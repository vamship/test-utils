# @vamship/test-lib

_Utility library that provides useful functionality for writing tests_

This library exports a collection of classes and modules that makes writing
tests easier. While not specific to any given testing library or framework,
this library has been developed with [mocha](https://mochajs.org/) and
[chai](http://chaijs.com/) in mind.

## Motivation

Testing is an important part of application development, and as well tested
applications and libraries grow in size, so do the automated tests that go
with them. Over time, common test patterns emerge, and one finds oneself
rewriting the same scaffolding or utility classes to execute these test
patterns.

The idea behind this library is to encapsulate these testing patterns, or at
least the building blocks for these patterns into a single library that can be
imported and reused in other projects.

For example, the `testValues` module exports a collection of functions that can
be used to generate dummy values for testing. The `ObjectMock` class provides
a simple way to mock out methods on objects allowing unit tests to be executed
while having mocks replace dependencies for the entities under test.

## Installation

This library can be installed using npm:

```
npm install @vamship/test-utils
```

## Usage

The classes and modules exported by this library are independent, and can be
used by importing them into the source code as follows:

```
const _rewire = require('rewire');
const _testValues = require('@vamship/test-utils').testValues;
const {ArgError} = require('@vamship/arg-utils').args;
...

let User = require('../../src/user');

describe('MyClass', () => {
    beforeEach(() => {
        // Load up the object under test. Use rewire to load the object
        // so that mocks can be assigned if necessary.
        User = _rewire('../../src/user');
    });

    it('should throw an error if invoked without a valid username', () => {
        const error = 'Invalid username specified (arg #1)';

        // Create an array of test values containing all types except a string,
        // and then add an empty string to that list
        const inputs = _testValues.allButString('');

        inputs.forEach((username) => {
            const wrapper = () => {
                return new User(username);
            };

            expect(wrapper).to.throw(ArgError, error);
        });
    });
});
```

The example above is just one of many possible examples of how this library and
its exported modules and classes may be used. For more information, please
review the API documentation.
