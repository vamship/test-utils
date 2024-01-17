import _path from 'path';
import { fileURLToPath } from 'url';
import _esmock from './esmock-wrapper.js';

/**
 * Declarations of dependencies that need to be mocked. These are specified by
 * mapping a string `mock key` to a dependency `import path`.
 *
 * @remarks
 * The `mock key` can be any string, and is used to specify mocks when importing
 * the target module.
 *
 * The `import path` is the path to the dependency that needs to be mocked. It
 * is a non-empty string that supports special prefixes:
 *
 * - `project://` The path is assumed to be relative to the source root of the
 * project, and can be used to mock modules defined within the project.
 * - `global://` The path is assumed to be a node js global (such as console).
 * - All other non prefixed paths are treated as external modules from
 * node_modules.
 */
export type MockDeclarations = Record<string, string>;

/**
 * Definitions of mocks that need to be injected into the module. This is a map
 * that maps a `mock key` to a mock definition, which is a mock object that
 * replaces the module that would be imported.
 */
/* eslint-disable  tsel/no-explicit-any */
export type MockDefinitions = Record<string, any>;

/**
 * Class that can be used to import modules, and inject mocks into them for
 * testing.
 *
 * Supports mocking of local files, libraries installed in node_modules, and
 * also globals (such as console).
 *
 * @typeParam T The type of the module that is being imported.
 */
export class MockImporter<T> {
    private readonly _importPath: string;
    private readonly _mockDeclarations: MockDeclarations;
    private readonly _memberName: string;
    private _srcRoot: string;

    /**
     * Initializes a new MockImporter, designed to import a specific module.
     * Local modules are assumed to be relative to the source root of the
     * project. This path is determined by the value of the `sourceRoot`
     * property and can be updated if necessary.
     *
     * @param importPath The path to the module to import.
     * @param mockDeclarations A map of mock declarations that identify the
     * dependencies that need to be mocked.
     * @param [memberName=''] The name of the member to import from the module.
     * This is an optional parameter, and if not specified, the default export
     * of the module will be imported.
     *
     * @see {@link MockImporter::sourceRoot}
     */
    constructor(
        importPath: string,
        mockDeclarations: MockDeclarations,
        memberName: string = '',
    ) {
        if (typeof importPath !== 'string' || importPath.length <= 0) {
            throw new Error('Invalid importPath (arg #1)');
        }

        if (
            !mockDeclarations ||
            mockDeclarations instanceof Array ||
            typeof mockDeclarations !== 'object'
        ) {
            throw new Error('Invalid mockDeclarations (arg #2)');
        }

        if (typeof memberName !== 'string') {
            throw new Error('Invalid memberName (arg #3)');
        }

        this._importPath = importPath;
        this._mockDeclarations = mockDeclarations;
        this._memberName = memberName;
        this._srcRoot = _path.resolve(
            fileURLToPath(import.meta.url),
            '../../../',
        );
    }

    private _getActualPath(path: string): string {
        if (path.startsWith('global://')) {
            return path.replace(/^global:\/\//, '');
        } else if (path.startsWith('project://')) {
            return _path.resolve(
                this._srcRoot,
                path.replace(/^project:\/\//, ''),
            );
        } else {
            return path;
        }
    }

    /**
     * The path to the root of the project's source files.
     */
    public get srcRoot(): string {
        return this._srcRoot;
    }

    /**
     * Sets the path to the root of the project's source files.
     */
    public set srcRoot(value: string) {
        if (typeof value !== 'string') {
            throw new Error('Invalid value for srcRoot');
        }

        this._srcRoot = value;
    }

    /**
     * Returns the path to the module that needs to be imported.
     */
    public get importPath(): string {
        return this._importPath;
    }

    /**
     * Returns a copy of the mock declarations for the module that needs to be
     * imported.
     */
    public get mockDeclarations(): MockDeclarations {
        return {
            ...this._mockDeclarations,
        };
    }

    /**
     * Returns the name of the member to import from the module.
     */
    public get memberName(): string {
        return this._memberName;
    }

    /**
     * Imports the module, injecting the specified mock modules into it.
     *
     * @param mockDefinitions A map of mock definitions that specify the mock
     * objects that need to be injected into the module.
     * @returns A promise that resolves to the imported module.
     */
    public async import(mockDefinitions: MockDefinitions): Promise<T> {
        if (
            !mockDefinitions ||
            mockDefinitions instanceof Array ||
            typeof mockDefinitions !== 'object'
        ) {
            throw new Error('Invalid mockDefinitions (arg #1)');
        }

        type MockDefinitionMap = {
            mockKey: string;
            importPath: string;
            mockDefinition: any;
            isSrc: boolean;
            isGlobal: boolean;
        };

        const definitionMap = Object.keys(mockDefinitions).map(
            (mockKey: string): MockDefinitionMap => {
                const mockDefinition = mockDefinitions[mockKey];
                const importPath = this._mockDeclarations[mockKey];
                if (typeof importPath === 'undefined') {
                    throw new Error(
                        `Mock was not declared for import [${mockKey}]`,
                    );
                }
                return {
                    mockKey,
                    importPath: this._getActualPath(importPath),
                    mockDefinition,
                    isSrc: importPath.startsWith('project://'),
                    isGlobal: importPath.startsWith('global://'),
                };
            },
        );

        const libs = definitionMap
            .filter((mockInfo) => !mockInfo.isGlobal)
            .reduce(
                (result: Record<string, any>, mockInfo: MockDefinitionMap) => {
                    result[mockInfo.importPath] = mockInfo.mockDefinition;
                    return result;
                },
                {},
            );

        const globals = definitionMap
            .filter((mockInfo) => mockInfo.isGlobal)
            .reduce(
                (result: Record<string, any>, mockInfo: MockDefinitionMap) => {
                    result[mockInfo.importPath] = mockInfo.mockDefinition;
                    return result;
                },
                {},
            );

        const importPath = this._getActualPath(this._importPath);
        const importResult = await _esmock(importPath, libs, globals);

        return (
            this._memberName === ''
                ? importResult
                : importResult[this._memberName]
        ) as T;
    }
}
