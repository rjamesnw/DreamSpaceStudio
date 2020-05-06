namespace DS {
    /**
     * Creates a promise that delays for a time before continuing.
     * The promise also supports aborting the delay, which also rejects the promise.
     */
    export class DelayedPromise<TData = any> extends TimeBasedPromise<boolean, TData> {

        constructor(ms: number); // (this just hides the execute parameter)
        constructor(executorOrDelay?: number | TExecutor) {
            super(executorOrDelay);
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
            if (typeof executorOrDelay == 'number') {
                this._setTimer(executorOrDelay);
            }
            else if (executorOrDelay === void 0 || executorOrDelay == null)
                throw Exception.argumentRequired('DelayedPromise()', 'ms');
            else if (typeof executorOrDelay !== 'function')
                throw Exception.invalidArgument('DelayedPromise()', 'ms');
        }

        /** 
         *  Forces this promise to continue in an uncompleted state, which assumes the developer is aware an will handle the state accordingly. 
         */
        continueUncompleted() {
            super.continueUncompleted(false);
        }
    }
}

interface PromiseConstructor {
    /**
     * Delays for the specified number of milliseconds before continuing.
     * @param {number} ms
     */
    delay(ms: number): DS.DelayedPromise;
}
if (!Promise.delay)
    Promise.delay = function (ms: number) {
        return new DS.DelayedPromise(ms);
    };

