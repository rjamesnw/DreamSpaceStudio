var DS;
(function (DS) {
    /**
     * Creates a promise that delays for a time before continuing.
     * The promise also supports aborting the delay, which also rejects the promise.
     */
    class DelayedPromise extends DS.TimeBasedPromise {
        constructor(executorOrDelay) {
            super(executorOrDelay);
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
            if (typeof executorOrDelay == 'number') {
                this._setTimer(executorOrDelay);
            }
            else if (executorOrDelay === void 0 || executorOrDelay == null)
                throw DS.Exception.argumentRequired('DelayedPromise()', 'ms');
            else if (typeof executorOrDelay !== 'function')
                throw DS.Exception.invalidArgument('DelayedPromise()', 'ms');
        }
        /**
         *  Forces this promise to continue in an uncompleted state, which assumes the developer is aware an will handle the state accordingly.
         */
        continueUncompleted() {
            super.continueUncompleted(false);
        }
    }
    DS.DelayedPromise = DelayedPromise;
})(DS || (DS = {}));
if (!Promise.delay)
    Promise.delay = function (ms) {
        return new DS.DelayedPromise(ms);
    };
//# sourceMappingURL=DelayedPromise.js.map