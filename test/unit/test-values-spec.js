'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;
const _rewire = require('rewire');

let _testValues = null;

describe('testValues', function() {
    function _getExpectedValues() {
        return {
            primitives: [undefined, null, 123, 'abc', true],
            complex: ['object', 'array', 'function']
        };
    }

    function _checkResults(values, expectedValues) {
        expectedValues.extra = expectedValues.extra || [];
        expectedValues.primitives.forEach((item, index) => {
            const value = values[index];
            if (value === null) {
                expect(values[index]).to.equal(item);
            } else {
                expect(typeof values[index]).to.equal(typeof item);
            }
        });

        let baseIndex = expectedValues.primitives.length;

        expect(values).to.be.an('array');
        expectedValues.complex.forEach((itemType, index) => {
            expect(values[baseIndex + index]).to.be.an(itemType);
            if (itemType !== 'function') {
                expect(values[index + baseIndex]).to.be.empty;
            }
        });

        baseIndex += expectedValues.complex.length;
        expectedValues.extra.forEach((item, index) => {
            expect(values[baseIndex + index]).to.equal(item);
        });
    }

    beforeEach(() => {
        _testValues = _rewire('../../src/test-values');
    });

    it('should expose methods required by the interface', function() {
        expect(_testValues.allButSelected).to.be.a('function');
        expect(_testValues.allButString).to.be.a('function');
        expect(_testValues.allButNumber).to.be.a('function');
        expect(_testValues.allButObject).to.be.a('function');
        expect(_testValues.allButArray).to.be.a('function');
        expect(_testValues.allButFunction).to.be.a('function');
        expect(_testValues.allButBoolean).to.be.a('function');
    });

    describe('allButSelected()', () => {
        it('should return an array when invoked', () => {
            const values = _testValues.allButSelected();

            expect(values).to.be.an.instanceof(Array);
        });

        it('should return an array of all test values when invoked without arguments', () => {
            const values = _testValues.allButSelected();
            const expectedValues = _getExpectedValues();

            _checkResults(values, expectedValues);
        });

        it('should omit null values if one of the arguments is "null"', () => {
            const values = _testValues.allButSelected('null');
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(1, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit undefined values if one of the arguments is "undefined"', () => {
            const values = _testValues.allButSelected('undefined');
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(0, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit null values if one of the arguments is "number"', () => {
            const values = _testValues.allButSelected('number');
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(2, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit null values if one of the arguments is "string"', () => {
            const values = _testValues.allButSelected('string');
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(3, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit null values if one of the arguments is "boolean"', () => {
            const values = _testValues.allButSelected('boolean');
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(4, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit object values if one of the arguments is "object"', () => {
            const values = _testValues.allButSelected('object');
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(0, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit array values if one of the arguments is "array"', () => {
            const values = _testValues.allButSelected('array');
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(1, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit function values if one of the arguments is "function"', () => {
            const values = _testValues.allButSelected('function');
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(2, 1);
            _checkResults(values, expectedValues);
        });

        it('should omit multiple arguments when multiple args are specified', () => {
            const values = _testValues.allButSelected('function', 'string');
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(3, 1);
            expectedValues.complex.splice(2, 1);
            _checkResults(values, expectedValues);
        });
    });

    describe('allButUndefined()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButUndefined();
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(0, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButUndefined(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(0, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });

    describe('allButNull()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButNull();
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(1, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButNull(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(1, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });

    describe('allButNumber()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButNumber();
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(2, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButNumber(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(2, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });

    describe('allButString()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButString();
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(3, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButString(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(3, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });

    describe('allButObject()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButObject();
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(0, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButObject(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(0, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });

    describe('allButArray()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButArray();
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(1, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButArray(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(1, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });

    describe('allButFunction()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButFunction();
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(2, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButFunction(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.complex.splice(2, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });

    describe('allButBoolean()', () => {
        it('should return an array with expected values when invoked', () => {
            const values = _testValues.allButBoolean();
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(4, 1);
            _checkResults(values, expectedValues);
        });

        it('should append the specified arguments to the return array', () => {
            const extras = ['foo', -1, '', false];
            const values = _testValues.allButBoolean(...extras);
            const expectedValues = _getExpectedValues();

            expectedValues.primitives.splice(4, 1);
            expectedValues.extra = extras;
            _checkResults(values, expectedValues);
        });
    });
});
