import _path from 'path';
import { fileURLToPath } from 'url';

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

// Private type
type MockDefinitionMap = {
    mockKey: string;
    importPath: string;
    mockDefinition: any;
    isSrc: boolean;
    isGlobal: boolean;
};

/**
 * Class that can be used to generate mock definitions for use with esmock to
 * import modules with injected mocks.
 *
 * Supports generation of mock definitions of local files, libraries installed
 * in node_modules, and also globals (such as console).
 *
 * @typeParam T The type of the module that is being imported.
 */
export class MockImportHelper<T> {
    private readonly _importPath: string;
    private readonly _mockDeclarations: MockDeclarations;
    private readonly _srcRoot: string;
    private readonly _mockDefinitions: MockDefinitions = {};

    /**
     * Initializes a helper object for the specified module.
     *
     * @param importPath The path to the module to import.
     * @param mockDeclarations A map of mock declarations that identify the
     * dependencies that need to be mocked. Each declaration is a mapping of a
     * mock key to an import path. The mock key can be used to set mocks prior
     * to generating the mock definitions.
     * @param srcRoot The path to the source root of the project. This is used
     * to resolve local modules.
     */
    public constructor(
        importPath: string,
        mockDeclarations: MockDeclarations,
        srcRoot: string,
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

        if (typeof srcRoot !== 'string' || srcRoot.length <= 0) {
            throw new Error('Invalid srcRoot (arg #3)');
        }

        this._importPath = importPath;
        this._mockDeclarations = mockDeclarations;
        this._srcRoot = srcRoot.startsWith('file://')
            ? fileURLToPath(srcRoot)
            : srcRoot;
    }

    private _getActualPath(path: string): string {
        if (path.startsWith('global://')) {
            return path.replace(/^global:\/\//, '');
        } else if (path.startsWith('project://') || path.startsWith('.')) {
            return _path.resolve(
                this._srcRoot,
                path.replace(/^project:\/\//, ''),
            );
        } else {
            return path;
        }
    }

    private _getMockDefinitions(): MockDefinitionMap[] {
        return Object.keys(this._mockDefinitions).map(
            (mockKey: string): MockDefinitionMap => {
                const mockDefinition = this._mockDefinitions[mockKey];
                const importPath = this._mockDeclarations[mockKey];
                return {
                    mockKey,
                    importPath: this._getActualPath(importPath),
                    mockDefinition,
                    isSrc: importPath.startsWith('project://'),
                    isGlobal: importPath.startsWith('global://'),
                };
            },
        );
    }

    /**
     * Gets the import path for the module.
     */
    public get importPath(): string {
        return this._getActualPath(this._importPath);
    }

    /**
     * Sets a mock for a given mock key. Returns the helper object to allow
     * chaining of calls.
     *
     * @param mockKey The mock key to set the mock for.
     * @param mockDefinition The mock definition to set.
     */
    public setMock(
        mockKey: string,
        mockDefinition: unknown,
    ): MockImportHelper<T> {
        if (typeof mockKey !== 'string' || mockKey.length <= 0) {
            throw new Error('Invalid mockKey (arg #1)');
        }

        if (!this._mockDeclarations[mockKey]) {
            throw new Error(
                `Mock key [${mockKey}] was not declared for import`,
            );
        }
        this._mockDefinitions[mockKey] = mockDefinition;
        return this;
    }

    /**
     * Clears the mock for a given mock key. Returns the helper object to allow
     * chaining of calls.
     *
     * @param mockKey The mock key to clear the mock for.
     */
    public clearMock(mockKey: string): MockImportHelper<T> {
        if (typeof mockKey !== 'string' || mockKey.length <= 0) {
            throw new Error('Invalid mockKey (arg #1)');
        }

        if (!this._mockDeclarations[mockKey]) {
            throw new Error(
                `Mock key [${mockKey}] was not declared for import`,
            );
        }
        delete this._mockDefinitions[mockKey];
        return this;
    }

    /**
     * Clears all mocks that are currently set on the importer. Returns the
     * helper object to allow chaining of calls.
     */
    public clearAllMocks(): MockImportHelper<T> {
        Object.keys(this._mockDefinitions).forEach((mockKey: string) => {
            delete this._mockDefinitions[mockKey];
        });
        return this;
    }

    /**
     * Gets mock definitions for libraries and local modules. These definitions
     * will only include mocks that were set using the `setMock` method.
     */
    public getLibs(): MockDefinitions {
        return this._getMockDefinitions()
            .filter((mockInfo) => !mockInfo.isGlobal)
            .reduce(
                (result: Record<string, any>, mockInfo: MockDefinitionMap) => {
                    result[mockInfo.importPath] = mockInfo.mockDefinition;
                    return result;
                },
                {},
            );
    }

    /**
     * Gets mock definitions for global imports. These definitions will only
     * include mocks that were set using the `setMock` method.
     */
    public getGlobals(): MockDefinitions {
        return this._getMockDefinitions()
            .filter((mockInfo) => mockInfo.isGlobal)
            .reduce(
                (result: Record<string, any>, mockInfo: MockDefinitionMap) => {
                    result[mockInfo.importPath] = mockInfo.mockDefinition;
                    return result;
                },
                {},
            );
    }
}
