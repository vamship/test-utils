import _path from 'path';
import { fileURLToPath } from 'url';
import _esmock from 'esmock';

/* eslint-disable tsel/no-explicit-any */
type MockDefinitions = Record<string, any>;
type Importer<T> = (mocks: MockDefinitions) => Promise<T>;

/**
 * Creates an importer function that imports a module with mocks injected into
 * dependencies.
 *
 * @param modulePath The path to the module that is being imported
 * @param importPaths A map of keys to dependent module paths. The keys used
 * in this dictionary should be used as the keys to the mocks passed when the
 * importer is invoked.
 * @param memberName The name of member within the module that needs to be
 * imported.
 * @typeParam T The type of the module that is being imported.
 *
 * @returns A function that can be used to import the module with
 * mocks injected as dependencies.
 */
export function createModuleImporter<T>(
    modulePath: string,
    importPaths: Record<string, string>,
    memberName?: string,
): Importer<T> {
    const basePath = _path.resolve(fileURLToPath(import.meta.url), '../../../');
    const getActualPath = (path: string): string => {
        if (path.startsWith('global::')) {
            return path.replace(/global::/, '');
        } else if (path.startsWith('src/')) {
            return _path.resolve(basePath, path);
        } else {
            return path;
        }
    };

    return async (mockDefs: MockDefinitions): Promise<T> => {
        const { libs, globals } = Object.keys({ ...mockDefs }).reduce(
            (result: Record<string, any>, key: string) => {
                const importPath = importPaths[key];
                if (!importPath) {
                    throw new Error(
                        `[Module Importer] Import path not defined for module: ${key}`,
                    );
                }
                let target = importPath.startsWith('global::')
                    ? 'globals'
                    : 'libs';

                const actualPath = getActualPath(importPath);
                result[target][actualPath] = mockDefs[key];
                return result;
            },
            { libs: {}, globals: {} },
        );

        const module = await _esmock(
            _path.resolve(basePath, getActualPath(modulePath)),
            libs,
            globals,
        );

        return typeof memberName !== 'string' ? module : module[memberName];
    };
}
