import _chai, { expect } from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import _sinon, { SinonSpy } from 'sinon';
import _sinonChai from 'sinon-chai';
import _path from 'path';
import 'mocha';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);

import { createModuleImporter } from '../utils/utils.js';
import { MockDeclarations, MockImporter } from '../../src/mock-importer.js';

describe('MockImporter', function () {
    class Mockable {}
    type TargetModuleType = typeof MockImporter<Mockable>;
    type ImportResult = {
        testTarget: TargetModuleType;
        esmockMock: SinonSpy;
        mockResult: Record<string, any>;
    };

    async function _importModule(): Promise<ImportResult> {
        const importModule = createModuleImporter<TargetModuleType>(
            'project://mock-importer.js',
            {
                esmock: 'project://esmock-wrapper.js',
            },
            'MockImporter',
        );

        const mockResult = {};
        const esmockMock = _sinon.stub().resolves(mockResult);

        const esmockModule = {
            default: esmockMock,
        };

        const testTarget = await importModule({
            esmock: esmockModule,
        });

        return await {
            testTarget,
            esmockMock,
            mockResult,
        };
    }

    async function _createInstance(
        importPath = '/path/to/module',
        mockDeclarations: MockDeclarations = {},
        memberName = '',
    ): Promise<{
        instance: MockImporter<Mockable>;
        esmockMock: SinonSpy;
        mockResult: Record<string, any>;
    }> {
        const {
            testTarget: ModuleType,
            esmockMock,
            mockResult,
        } = await _importModule();

        const instance = new ModuleType(
            importPath,
            mockDeclarations,
            memberName,
        );

        return { instance, esmockMock, mockResult };
    }

    describe('ctor()', function () {
        [undefined, null, 123, true, [], '', {}, () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without a valid import path (value=${value})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();
                    const error = 'Invalid importPath (arg #1)';

                    /* eslint-disable tsel/no-explicit-any */
                    const importPath = value as any;
                    const mockDeclarations = {};
                    const memberName = undefined;

                    const wrapper = () =>
                        new MockImporter(
                            importPath,
                            mockDeclarations,
                            memberName,
                        );

                    expect(wrapper).to.throw(error);
                });
            },
        );

        [undefined, null, 123, true, [], 'foo', () => undefined].forEach(
            (value) => {
                it(`should throw an error if invoked without valid mock declarations (value=${value})`, async function () {
                    const { testTarget: TargetModuleType } =
                        await _importModule();
                    const error = 'Invalid mockDeclarations (arg #2)';

                    /* eslint-disable tsel/no-explicit-any */
                    const importPath = 'path/to/module';
                    const mockDeclarations = value as any;
                    const memberName = undefined;

                    const wrapper = () =>
                        new MockImporter(
                            importPath,
                            mockDeclarations,
                            memberName,
                        );

                    expect(wrapper).to.throw(error);
                });
            },
        );

        [null, 123, true, [], {}, () => undefined].forEach((value) => {
            it(`should throw an error if invoked with an invalid membername (value=${value})`, async function () {
                const { testTarget: TargetModuleType } = await _importModule();
                const error = 'Invalid memberName (arg #3)';

                /* eslint-disable tsel/no-explicit-any */
                const importPath = 'path/to/module';
                const mockDeclarations = {};
                const memberName = value as any;

                const wrapper = () =>
                    new MockImporter(importPath, mockDeclarations, memberName);

                expect(wrapper).to.throw(error);
            });
        });
    });

    describe('[properties]', function () {
        describe('srcRoot', function () {
            it('should return the path to the project source root', async function () {
                const { instance } = await _createInstance();

                // This is a little suspect - there is a dependency between the
                // behavior of the property and the path of the module. For now,
                // there's no better way to test this.
                const expectedPath = _path.resolve(process.cwd());

                expect(instance.srcRoot).to.be.a('string').and.not.empty;
                expect(instance.srcRoot).to.equal(expectedPath);
            });
        });

        describe('srcRoot (setter)', function () {
            [null, 123, true, [], {}, () => undefined].forEach((value) => {
                it(`should throw an error if invoked without a valid value (value=${value})`, async function () {
                    const { instance } = await _createInstance();
                    const error = 'Invalid value for srcRoot';
                    const srcRoot = value as any;

                    const wrapper = () => (instance.srcRoot = srcRoot);
                    expect(wrapper).to.throw(error);
                });
            });

            it('should set the path to the project source root', async function () {
                const { instance } = await _createInstance();

                const newPath = '/path/to/new/root';
                instance.srcRoot = newPath;

                expect(instance.srcRoot).to.equal(newPath);
            });
        });

        describe('importPath', function () {
            it('should return the import path used to initialize the instance', async function () {
                const importPath = '/path/to/module';
                const { instance } = await _createInstance(importPath);

                expect(instance.importPath).to.equal(importPath);
            });
        });

        describe('mockDeclarations', function () {
            it('should return the mock declarations used to initialize the instance', async function () {
                const mockDeclarations = {
                    foo: 'bar',
                };
                const { instance } = await _createInstance(
                    '/path/to/module',
                    mockDeclarations,
                );

                expect(instance.mockDeclarations).to.deep.equal(
                    mockDeclarations,
                );
            });

            it('should return a copy of the declarations, and not the original reference', async function () {
                const mockDeclarations = {
                    foo: 'bar',
                };
                const { instance } = await _createInstance(
                    '/path/to/module',
                    mockDeclarations,
                );

                expect(instance.mockDeclarations).to.not.equal(
                    mockDeclarations,
                );
            });
        });

        describe('memberName', function () {
            it('should return the member name used to initialize the instance', async function () {
                const memberName = 'foo';
                const { instance } = await _createInstance(
                    '/path/to/module',
                    {},
                    memberName,
                );

                expect(instance.memberName).to.equal(memberName);
            });
        });
    });

    describe('import()', function () {
        async function _doImport(
            importPath = 'path/to/module',
            mockDeclarations: Record<string, any> = {
                foo: 'path/to/foo',
                bar: 'path/to/bar',
                baz: 'path/to/baz',
            },
            memberName = '',
            srcRoot: string | undefined = undefined,
        ) {
            const { instance, esmockMock } = await _createInstance(
                importPath,
                mockDeclarations,
            );

            if (srcRoot) {
                instance.srcRoot = srcRoot;
            }

            expect(esmockMock).to.not.have.been.called;

            const mockDefinitions = Object.keys(mockDeclarations).reduce(
                (result: Record<string, any>, key: string) => {
                    result[key] = _sinon.spy();
                    return result;
                },
                {},
            );

            const importResult = await instance.import(mockDefinitions);
            return {
                instance,
                esmockMock,
                mockDefinitions,
                importResult,
            };
        }

        [undefined, null, 123, true, [], 'foo', () => undefined].forEach(
            (value) => {
                it(`should throw an error if inovked without valid mock definitions (value=${value})`, async function () {
                    const { instance } = await _createInstance();
                    const error = 'Invalid importPath (arg #1)';

                    const mockDefinitions = value as any;

                    expect(instance.import(mockDefinitions)).to.be.rejectedWith(
                        error,
                    );
                });
            },
        );

        it('should throw an error if the mock definition was not previously defined', async function () {
            const { instance } = await _createInstance(undefined, {
                foo: 'path/to/foo',
            });
            const badMockKey = 'bar';

            const mockDefinitions = {
                [badMockKey]: {},
            };

            const error = `Mock was not declared for import [${badMockKey} ]`;
            expect(instance.import(mockDefinitions)).to.be.rejectedWith(error);
        });

        it('should invoke esmock to import the module specified by the import path', async function () {
            const importPath = 'path/to/module';

            const { esmockMock } = await _doImport(importPath, {});

            expect(esmockMock).to.have.been.calledOnce;
            expect(esmockMock.args[0]).to.have.lengthOf(3);

            expect(esmockMock.firstCall.args[0]).to.equal(importPath);
            expect(esmockMock.firstCall.args[1]).to.be.an('object');
            expect(esmockMock.firstCall.args[2]).to.be.an('object');
        });

        it('should modify the import path when the project prefix is used', async function () {
            const importPath = 'project://path/to/module';
            const srcRoot = 'path/to/src/root';
            const expectedPath = _path.resolve(
                srcRoot,
                importPath.replace(/^project:\/\//, ''),
            );

            const { esmockMock } = await _doImport(
                importPath,
                {},
                undefined,
                srcRoot,
            );

            expect(esmockMock).to.have.been.calledOnce;
            expect(esmockMock.args[0]).to.have.lengthOf(3);

            expect(esmockMock.firstCall.args[0]).to.equal(expectedPath);
            expect(esmockMock.firstCall.args[1]).to.be.an('object');
            expect(esmockMock.firstCall.args[2]).to.be.an('object');
        });

        it('should properly include all mocked library dependencies', async function () {
            const importPath = 'path/to/module';
            const srcRoot = 'path/to/src/root';
            const mockDeclarations: MockDeclarations = {
                foo: 'path/to/foo',
                bar: 'path/to/bar',
                baz: 'path/to/baz',
            };

            const { esmockMock, mockDefinitions } = await _doImport(
                importPath,
                mockDeclarations,
                undefined,
                srcRoot,
            );

            const libs = esmockMock.firstCall.args[1];
            const mockPaths = Object.values(mockDeclarations);

            expect(libs).to.contain.all.keys(mockPaths);

            Object.keys(mockDefinitions).forEach((key: string) => {
                const path = mockDeclarations[key];
                const expectedMock = mockDefinitions[key];
                const actualMock = libs[path];

                expect(actualMock).to.equal(expectedMock);
            });
        });

        it('should properly resolve import paths for project local imports', async function () {
            const srcRoot = 'path/to/src/root';
            const importPath = 'path/to/module';
            const mockDeclarations: MockDeclarations = {
                foo: 'project://path/to/foo',
                bar: 'project://path/to/bar',
                baz: 'project://path/to/baz',
            };
            const resolvePath = (path: string): string =>
                _path.resolve(srcRoot, path.replace(/^project:\/\//, ''));

            const { esmockMock, mockDefinitions } = await _doImport(
                importPath,
                mockDeclarations,
                undefined,
                srcRoot,
            );

            const libs = esmockMock.firstCall.args[1];
            const mockPaths = Object.values(mockDeclarations).map(resolvePath);

            expect(libs).to.contain.all.keys(mockPaths);

            Object.keys(mockDefinitions).forEach((key: string) => {
                const path = resolvePath(mockDeclarations[key]);
                const expectedMock = mockDefinitions[key];
                const actualMock = libs[path];

                expect(actualMock).to.equal(expectedMock);
            });
        });

        it('should properly resolve import paths for global imports', async function () {
            const srcRoot = 'path/to/src/root';
            const importPath = 'path/to/module';
            const mockDeclarations: MockDeclarations = {
                foo: 'global://foo',
                bar: 'global://bar',
                baz: 'global://baz',
            };
            const resolvePath = (path: string): string =>
                path.replace(/^global:\/\//, '');

            const { esmockMock, mockDefinitions } = await _doImport(
                importPath,
                mockDeclarations,
                undefined,
                srcRoot,
            );

            const globals = esmockMock.firstCall.args[2];
            const mockPaths = Object.values(mockDeclarations).map(resolvePath);

            expect(globals).to.contain.all.keys(mockPaths);

            Object.keys(mockDefinitions).forEach((key: string) => {
                const path = resolvePath(mockDeclarations[key]);
                const expectedMock = mockDefinitions[key];
                const actualMock = globals[path];

                expect(actualMock).to.equal(expectedMock);
            });
        });

        it('should return the default import if no member name was specified', async function () {
            const { instance, mockResult } = await _createInstance(
                undefined,
                undefined,
                '',
            );

            const mockedModule = await instance.import({});
            expect(mockedModule).to.equal(mockResult);
        });

        it('should return the specified member if a member name was specified', async function () {
            const memberName = 'foo';
            const { instance, mockResult } = await _createInstance(
                undefined,
                undefined,
                memberName,
            );

            const mockedModule = await instance.import({});
            expect(mockedModule).to.equal(mockResult[memberName]);
        });
    });
});
