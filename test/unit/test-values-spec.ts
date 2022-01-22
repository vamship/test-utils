import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import _rewire from 'rewire';

let _testValues = _rewire('../../src/test-values');
import { TestValues } from '../../src/test-values';

describe('testValues', function () {
    function _getExpectedValues(): {
        primitives: TestValues;
        complex: string[];
        extra: TestValues;
    } {
        return {
            primitives: [undefined, null, 123, 'abc', true],
            complex: ['object', 'array', 'function'],
            extra: [],
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

    it('should expose methods required by the interface', function () {
        expect(_testValues.allButSelected).to.be.a('function');
        expect(_testValues.allButString).to.be.a('function');
        expect(_testValues.allButNumber).to.be.a('function');
        expect(_testValues.allButObject).to.be.a('function');
        expect(_testValues.allButArray).to.be.a('function');
        expect(_testValues.allButFunction).to.be.a('function');
        expect(_testValues.allButBoolean).to.be.a('function');

        expect(_testValues.getString).to.be.a('function');
        expect(_testValues.getNumber).to.be.a('function');
        expect(_testValues.getTimestamp).to.be.a('function');
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

    describe('getString()', () => {
        function _split(str) {
            const tokens = str.split('_');
            const result: {
                tokens: string;
                prefix?: string;
                suffix?: string;
            } = {
                tokens: tokens.concat(),
            };

            result.prefix = tokens[0];
            tokens.shift();
            result.suffix = tokens.join('');

            return result;
        }
        it('should return string with the appropriate prefix', () => {
            const expectedPrefix = 'foo';
            const ret = _testValues.getString(expectedPrefix);

            expect(ret).to.be.a('string').and.not.to.be.empty;
            const { tokens, prefix, suffix } = _split(ret);

            expect(tokens.length).to.be.at.least(2);
            expect(prefix).to.equal(expectedPrefix);
            expect(suffix).to.be.a('string').and.not.to.be.empty;
        });

        it('should generate different suffixes for different invocations', () => {
            const expectedPrefix = 'foo';
            const ret1 = _testValues.getString(expectedPrefix);
            const ret2 = _testValues.getString(expectedPrefix);

            const { prefix, suffix } = _split(ret1);
            const results = _split(ret2);

            expect(results.prefix).to.equal(prefix);
            expect(results.suffix).to.not.equal(suffix);
        });

        it('should return a string without prefix if one was not specified', () => {
            const inputs = [
                undefined,
                null,
                12,
                '',
                true,
                {},
                [],
                () => undefined,
            ];

            inputs.forEach((prefix) => {
                const ret = _testValues.getString(prefix);

                expect(ret.startsWith('undefined')).to.be.false;
                expect(ret.substr(0, 1)).to.not.equal('_');
            });
        });
    });

    describe('getTimestamp()', () => {
        it('should return a timestamp when invoked with a start time and range', () => {
            const startTime = Date.now();
            const range = 1000;
            const ret = _testValues.getTimestamp(range, startTime);

            expect(ret).to.be.a('number');
            expect(ret).to.be.within(startTime, startTime + range);
        });

        it('should return use the start time as the upper bound if a negative range is specified', () => {
            const startTime = Date.now();
            const range = -1000;
            const ret = _testValues.getTimestamp(range, startTime);

            expect(ret).to.be.a('number');
            expect(ret).to.be.within(startTime + range, startTime);
        });

        it('should default the start time to the current time if a valid number is not provided', () => {
            const inputs = [
                undefined,
                null,
                'foo',
                -1,
                true,
                {},
                [],
                () => undefined,
            ];

            inputs.forEach((startTime) => {
                const range = 1000;
                const now = Date.now();
                const ret = _testValues.getTimestamp(range, startTime);

                expect(ret).to.be.within(now, now + range);
            });
        });

        it('should default the range to 10000 if a valid number is not provided', () => {
            const inputs = [
                undefined,
                null,
                'foo',
                true,
                {},
                [],
                () => undefined,
            ];
            const defRange = 10000;

            inputs.forEach((range) => {
                const startTime = Date.now();

                // NOTE: This is not a proper test. Since range is a randomly
                // generated value, it is hard to deterministically test its
                // value
                for (let index = 0; index < 1000; index++) {
                    const ret = _testValues.getTimestamp(range, startTime);
                    expect(ret).to.be.within(startTime, startTime + defRange);
                }
            });
        });
    });

    describe('getNumber()', () => {
        it('should return a number when invoked with a start value and range', () => {
            const start = 20;
            const range = 1000;
            const ret = _testValues.getNumber(range, start);

            expect(ret).to.be.a('number');
            expect(ret).to.be.within(start, start + range);
        });

        it('should return use the start value as the upper bound if a negative range is specified', () => {
            const start = 20;
            const range = -1000;
            const ret = _testValues.getNumber(range, start);

            expect(ret).to.be.a('number');
            expect(ret).to.be.within(start + range, start);
        });

        it('should default the start value to 0 if a valid number is not provided', () => {
            const inputs = [
                undefined,
                null,
                'foo',
                true,
                {},
                [],
                () => undefined,
            ];

            inputs.forEach((start) => {
                const range = 1000;
                const defaultStart = 0;
                const ret = _testValues.getNumber(range, start);

                expect(ret).to.be.within(defaultStart, defaultStart + range);
            });
        });

        it('should default the range to 10000 if a valid number is not provided', () => {
            const inputs = [
                undefined,
                null,
                'foo',
                true,
                {},
                [],
                () => undefined,
            ];
            const defRange = 100;

            inputs.forEach((range) => {
                const start = Date.now();

                // NOTE: This is not a proper test. Since range is a randomly
                // generated value, it is hard to deterministically test its
                // value
                for (let index = 0; index < 1000; index++) {
                    const ret = _testValues.getNumber(range, start);
                    expect(ret).to.be.within(start, start + defRange);
                }
            });
        });
    });
});
