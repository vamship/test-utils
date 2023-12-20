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

describe.only('MockImporter', function () {
    class Mockable {}
    type TargetModuleType = typeof MockImporter<Mockable>;
    type ImportResult = {
        testTarget: TargetModuleType;
        esmockMock: SinonSpy;
    };

    async function _importModule(): Promise<ImportResult> {
        const importModule = createModuleImporter<TargetModuleType>(
            'src/mock-importer.js',
            {
                esmock: 'src/esmock-wrapper.js',
            },
            'MockImporter',
        );

        const esmockMock = _sinon.spy();
        const esmockModule = {
            default: esmockMock,
        };

        const testTarget = await importModule({
            esmock: esmockModule,
        });

        return await {
            testTarget,
            esmockMock,
        };
    }

    async function _createInstance(
        importPath = '/path/to/module',
        mockDeclarations: MockDeclarations = {},
        memberName = '',
    ): Promise<{ instance: MockImporter<Mockable>; esmockMock: SinonSpy }> {
        const { testTarget: ModuleType, esmockMock } = await _importModule();

        const instance = new ModuleType(
            importPath,
            mockDeclarations,
            memberName,
        );

        return { instance, esmockMock };
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
        ) {
            const { instance, esmockMock } = await _createInstance(
                importPath,
                mockDeclarations,
            );

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

        it('should throw an error if the ')

        it('should invoke esmock to import the module specified by the import path', async function () {
            const importPath = 'path/to/module';

            const { esmockMock } = await _doImport(importPath, {});

            expect(esmockMock).to.have.been.calledOnce;
            expect(esmockMock.args[0]).to.have.lengthOf(3);

            expect(esmockMock.firstCall.args[0]).to.equal(importPath);
            expect(esmockMock.firstCall.args[1]).to.be.an('object');
            expect(esmockMock.firstCall.args[2]).to.be.an('object');
        });

        xit('should properly include all mocked library dependencies', async function () {
            const importPath = 'path/to/module';
            const mockDeclarations = {
                foo: 'path/to/foo',
                bar: 'path/to/bar',
                baz: 'path/to/baz',
            };

            const { esmockMock, mockDefinitions } = await _doImport(
                importPath,
                mockDeclarations,
            );

            const libs = esmockMock.firstCall.args[1];
            const mockPaths = Object.values(mockDeclarations);
            const mockKeys = Object.keys(mockDeclarations);

            expect(libs).to.contain.all.keys(mockPaths);
            mockPaths.forEach((path: string) => {
                const expectedMock = mockDefinitions[path];
                const actualMock = libs[path];
            });

            // Object.keys(mockDeclarations).forEach((key) => {
            //     const libPath = mockDeclarations[key];
            //     expect(libs[libPath]).to.equal(mockDefinitions[`${key}Mock`]);
            // }
            //     const { instance, esmockMock } = await _createInstance(
            //         importPath,
            //         mockDeclarations,
            //     );

            //     const fooMock = {};
            //     const barMock = {};
            //     const bazMock = {};

            //     const result = await instance.import({
            //         foo: fooMock,
            //         bar: barMock,
            //         baz: bazMock,
            //     });

            //     expect(esmockMock.args[0]).to.have.lengthOf(3);

            //     expect(esmockMock.firstCall.args[0]).to.equal(importPath);
            //     expect(esmockMock.firstCall.args[1]).to.be.an('object');
            //     expect(esmockMock.firstCall.args[2]).to.be.an('object');
        });
    });
});
