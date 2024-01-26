import { expect, use as _useWithChai } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinonChai from 'sinon-chai';
import _path from 'path';
import 'mocha';

_useWithChai(_sinonChai);
_useWithChai(_chaiAsPromised);

import {
    MockDeclarations,
    MockImportHelper,
} from '../../src/mock-import-helper.js';

describe('MockImportHelper', function () {
    class Mockable {}

    function _createInstance(
        importPath: string = 'path/to/module',
        mockDeclarations: MockDeclarations = {
            foo: 'foolib',
            bar: 'project://src/bar',
            baz: 'global://console',
        },
        srcRoot: string = './src',
    ): MockImportHelper<Mockable> {
        return new MockImportHelper<Mockable>(
            importPath,
            mockDeclarations,
            srcRoot,
        );
    }

    describe('ctor()', function () {
        [undefined, null, 123, true, [], '', {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid import path (value=${value})`, async function () {
                    const error = 'Invalid importPath (arg #1)';

                    /* eslint-disable tsel/no-explicit-any */
                    const importPath = value as any;
                    const mockDeclarations = {};
                    const srcRoot = './src';

                    const wrapper = () =>
                        new MockImportHelper<Mockable>(
                            importPath,
                            mockDeclarations,
                            srcRoot,
                        );

                    expect(wrapper).to.throw(error);
                });
            },
        );

        [undefined, null, 123, true, [], 'foo', () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without valid mock declarations (value=${value})`, async function () {
                    const error = 'Invalid mockDeclarations (arg #2)';

                    /* eslint-disable tsel/no-explicit-any */
                    const importPath = 'path/to/module';
                    const mockDeclarations = value as any;
                    const srcRoot = './src';

                    const wrapper = () =>
                        new MockImportHelper<Mockable>(
                            importPath,
                            mockDeclarations,
                            srcRoot,
                        );

                    expect(wrapper).to.throw(error);
                });
            },
        );

        [null, 123, true, [], {}, '', () => undefined].forEach((value) => {
            it(`should throw an error if invoked with an invalid srcRoot (value=${value})`, async function () {
                const error = 'Invalid srcRoot (arg #3)';

                /* eslint-disable tsel/no-explicit-any */
                const importPath = 'path/to/module';
                const mockDeclarations = {};
                const srcRoot = value as any;

                const wrapper = () =>
                    new MockImportHelper<Mockable>(
                        importPath,
                        mockDeclarations,
                        srcRoot,
                    );

                expect(wrapper).to.throw(error);
            });
        });
    });

    describe('[props]', function () {
        describe('importPath', function () {
            [
                {
                    srcRoot: 'src',
                    importPath: 'project://path/to/module',
                    expected: _path.resolve('src/path/to/module'),
                },
                {
                    srcRoot: 'src',
                    importPath: './path/to/module',
                    expected: _path.resolve('src/path/to/module'),
                },
                {
                    srcRoot: 'src',
                    importPath: '../path/to/module',
                    expected: _path.resolve('path/to/module'),
                },
                {
                    srcRoot: 'file:///src',
                    importPath: './path/to/module',
                    expected: '/src/path/to/module',
                },
                {
                    srcRoot: 'src',
                    importPath: '/path/to/module',
                    expected: '/path/to/module',
                },
                {
                    srcRoot: 'src',
                    importPath: 'node-lib',
                    expected: 'node-lib',
                },
                {
                    srcRoot: 'src',
                    importPath: 'global://some-global-lib',
                    expected: 'some-global-lib',
                },
            ].forEach(({ importPath, srcRoot, expected }) => {
                it(`should return the module import path (srcRoot=${srcRoot}, importPath=${importPath})`, async function () {
                    const mockDeclarations = {};

                    const instance = _createInstance(
                        importPath,
                        mockDeclarations,
                        srcRoot,
                    );

                    expect(instance.importPath).to.equal(expected);
                });
            });
        });
    });

    describe('setMock()', function () {
        [undefined, null, 123, true, [], '', {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid mock key (value=${value})`, async function () {
                    const error = 'Invalid mockKey (arg #1)';

                    /* eslint-disable tsel/no-explicit-any */
                    const mockKey = value as any;
                    const mock = {};
                    const instance = _createInstance();

                    const wrapper = () => instance.setMock(mockKey, mock);
                    expect(wrapper).to.throw(error);
                });
            },
        );

        it('should throw an error if the mock key was not included in the declarations', async function () {
            const mockKey = 'bad-lib';
            const mock = {};
            const error = `Mock key [${mockKey}] was not declared for import`;

            const instance = _createInstance();

            const wrapper = () => instance.setMock(mockKey, mock);
            expect(wrapper).to.throw(error);
        });

        it('should register the mock if the mock key was valid', async function () {
            const mockKey = 'foo';
            const mock = {};
            const instance = _createInstance();

            instance.setMock(mockKey, mock);

            /// WARNING: This is a private member access. Should be used for
            //testing only.
            expect(instance['_mockDefinitions'][mockKey]).to.equal(mock);
        });

        it('should return an instance of the helper if the mock key was valid', async function () {
            const mockKey = 'foo';
            const mock = {};
            const instance = _createInstance();

            const ret = instance.setMock(mockKey, mock);

            expect(ret).to.equal(instance);
        });
    });

    describe('clearMock()', function () {
        [undefined, null, 123, true, [], '', {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid mock key (value=${value})`, async function () {
                    const error = 'Invalid mockKey (arg #1)';

                    /* eslint-disable tsel/no-explicit-any */
                    const mockKey = value as any;
                    const instance = _createInstance();

                    const wrapper = () => instance.clearMock(mockKey);
                    expect(wrapper).to.throw(error);
                });
            },
        );

        it('should throw an error if the mock key was not included in the declarations', async function () {
            const mockKey = 'bad-lib';
            const error = `Mock key [${mockKey}] was not declared for import`;

            const instance = _createInstance();

            const wrapper = () => instance.clearMock(mockKey);
            expect(wrapper).to.throw(error);
        });

        it('should clear the mock registration if the mock key was valid', async function () {
            const mockKey = 'foo';
            const mock = {};
            const instance = _createInstance();

            instance.setMock(mockKey, mock);

            /// WARNING: This is a private member access. Should be used for
            //testing only.
            expect(instance['_mockDefinitions'][mockKey]).to.equal(mock);

            instance.clearMock(mockKey);

            /// WARNING: This is a private member access. Should be used for
            //testing only.
            expect(instance['_mockDefinitions'][mockKey]).to.be.undefined;
        });

        it('should return an instance of the helper if the mock key was valid', async function () {
            const mockKey = 'foo';
            const instance = _createInstance();

            const ret = instance.clearMock(mockKey);

            expect(ret).to.equal(instance);
        });
    });

    describe('getLibs()', function () {
        it('should return an empty object if no mocks were registered', async function () {
            const srcRoot = 'src';
            const declarations = {
                foo: 'foolib',
                bar: 'project://subdir/bar',
                baz: 'global://console',
            };
            const instance = _createInstance(undefined, declarations, srcRoot);
            const ret = instance.getLibs();

            expect(ret).to.be.an('object').that.is.empty;
        });

        it('should return an empty object if only globals are registered', async function () {
            const srcRoot = 'src';
            const declarations = {
                foo: 'foolib',
                bar: 'project://subdir/bar',
                baz: 'global://console',
            };
            const instance = _createInstance(undefined, declarations, srcRoot);
            instance.setMock('baz', {});
            const ret = instance.getLibs();

            expect(ret).to.be.an('object').that.is.empty;
        });

        it('should return mock library definitions for each mock that was registered', async function () {
            const srcRoot = 'src';
            const declarations = {
                foo: 'foolib',
                bar: 'project://subdir/bar',
                baz: 'global://console',
            };
            const instance = _createInstance(undefined, declarations, srcRoot);

            const fooMock = {};
            const barMock = {};
            const bazMock = {};

            instance
                .setMock('foo', fooMock)
                .setMock('bar', barMock)
                .setMock('baz', bazMock);

            const ret = instance.getLibs();

            expect(ret).to.deep.equal({
                foolib: fooMock,
                [_path.resolve('src', 'subdir', 'bar')]: barMock,
            });
        });
    });

    describe('getGlobals()', function () {
        it('should return an empty object if no mocks were registered', async function () {
            const srcRoot = 'src';
            const declarations = {
                foo: 'foolib',
                bar: 'project://subdir/bar',
                baz: 'global://console',
            };
            const instance = _createInstance(undefined, declarations, srcRoot);
            const ret = instance.getGlobals();

            expect(ret).to.be.an('object').that.is.empty;
        });

        it('should return an empty object if only globals are registered', async function () {
            const srcRoot = 'src';
            const declarations = {
                foo: 'foolib',
                bar: 'project://subdir/bar',
                baz: 'global://console',
            };
            const instance = _createInstance(undefined, declarations, srcRoot);
            instance.setMock('foo', {});
            instance.setMock('bar', {});
            const ret = instance.getGlobals();

            expect(ret).to.be.an('object').that.is.empty;
        });

        it('should return mock library definitions for each mock that was registered', async function () {
            const srcRoot = 'src';
            const declarations = {
                foo: 'foolib',
                bar: 'project://subdir/bar',
                baz: 'global://console',
            };
            const instance = _createInstance(undefined, declarations, srcRoot);

            const fooMock = {};
            const barMock = {};
            const bazMock = {};

            instance
                .setMock('foo', fooMock)
                .setMock('bar', barMock)
                .setMock('baz', bazMock);

            const ret = instance.getGlobals();

            expect(ret).to.deep.equal({
                console: bazMock,
            });
        });
    });
});
