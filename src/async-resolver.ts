import { wait } from './async-helper.js';

/**
 * Interface definition for an enumeration of method steps.
 */
interface IStep {
    /**
     * The name of the step.
     */
    stepName: string;

    /**
     * The resolver function that resolves the step.
     */
    resolver: (iteration: number) => Promise<unknown>;
}

/**
 * Utility class that can be used to resolve one or more mocked async steps that
 * are typically a part of the execution flow of some method under test. This
 * class can be used to resolve one or more async actions, and pause execution
 * to evalaute the method under test after the execution of a set of steps.
 *
 * Broad steps to follow when using the class are described below:
 *
 * Setup:
 *  1. Identify the asynchronous actions that the method under test performs
 *  2. Create mocks for each of the asynchronous actions
 *  3. Create an instance of this class
 *  4. Register methods that resolve each of the async mocks
 *
 * During Tests:
 *  1. Invoke the method under test
 *  2. Use the resolveUntil() method to resolve all async steps upto, but not
 *     including the point in the method that needs to be tested
 *  3. Perform the necessary evaluations of the code
 *  4. Repeat steps 1 - 3
 */
export class AsyncResolver {
    private _steps: Array<IStep>;

    /**
     * Creates a new instance. Individual resolver steps must be registered
     * with the instance before it can be used effectively.
     */
    constructor() {
        this._steps = [];
    }

    private _hasStep(stepName: string): boolean {
        return !!this._steps.find((step) => step.stepName === stepName);
    }

    /**
     * Returns a list of steps available to the controller.
     */
    public get steps(): string[] {
        return this._steps.map((step) => step.stepName);
    }

    /**
     * Registers a new step with the controller. The step is identified by the
     * specified name, and the resolver function is used to resolve the step.
     *
     * @param name The name of the step. The step name must be unique.
     * @param resolver The resolver function that resolves the step.
     * @return The current instance.
     */
    public registerStep(
        stepName: string,
        resolver: (iteration: number) => Promise<unknown>,
    ): AsyncResolver {
        if (!stepName || typeof stepName !== 'string') {
            throw new Error(`Invalid stepName (arg #1)`);
        }
        if (!resolver || typeof resolver !== 'function') {
            throw new Error(`Invalid resolver (arg #2)`);
        }
        if (this._hasStep(stepName)) {
            throw new Error(`Step is already registered: [${stepName}]`);
        }

        this._steps.push({ stepName, resolver });
        return this;
    }

    /**
     * Steps execution forward until the specified step. Will execute actions,
     * chaining them togehter until the specified step is reached. A promise
     * that represents the completion of the final step is returned.
     *
     * @param stepName The name of the step to resolve until.
     * @param iteration An optional iteration value that is indicative of the
     * test iteration, when the same function is invoked multiple times within a
     * single test case.
     *
     * @return A promise that represents execution until the specified step.
     */
    public async resolveUntil<T>(stepName: string, iteration = 0): Promise<T> {
        if (!stepName || typeof stepName !== 'string') {
            throw new Error(`Invalid stepName (arg #1)`);
        }
        if (typeof iteration !== 'number' || iteration < 0) {
            throw new Error(`Invalid iteration (arg #2)`);
        }
        if (this._steps.length === 0) {
            throw new Error('No steps have been registered');
        }
        if (!this._hasStep(stepName)) {
            throw new Error(`Step is not registered: [${stepName}]`);
        }

        let ret: unknown;
        for (let index = 0; index < this._steps.length; index++) {
            const step = this._steps[index];

            if (step.stepName !== stepName) {
                ret = step.resolver(iteration);
                await wait(1)(undefined);
            }
        }

        return ret as Promise<T>;
    }
}
