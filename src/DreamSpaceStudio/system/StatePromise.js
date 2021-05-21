var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var DS;
(function (DS) {
    var __state;
    /**
     * Creates a promise that is resolved when some state is set. This allows a task to stay dormant until some external state changes.
     */
    class SpecializedPromise extends Promise {
        constructor(executor) {
            super(typeof executor == 'function' ? executor : ((res, rej) => { _res = res; _rej = rej; }));
            this._completed = false;
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
            if (typeof executor != 'function') {
                var _res; // (this will be hoisted and available to the promise executor)
                var _rej; // (this will be hoisted and available to the promise executor)
                this._resolve = _res;
                this._reject = _rej;
            }
        }
        /**
         * Returns true once a state have been set. Once the state is set it cannot be changed.
         */
        get completed() { return !!this._completed; }
        /**
         * Gets or sets an error state on this object.
         * Setting an error state (such as an Error object reference) will trigger "reject" on the promise.
         * Note: Even if error is set to undefined or null, it still counts as an error state, and 'failed' will be true.
         */
        get error() { return this._error; }
        set error(err) {
            var rej = this._reject;
            if (rej) {
                this._cleanUp();
                this._error = err;
                this._failed = true;
                rej && rej(this._error);
            }
        }
        /**
         * Returns true if this promise erred out.
         */
        get failed() { return !!this._failed; }
        doResolve(value) {
            this._completed = true;
            this._resolve && this._resolve(value);
        }
        _cleanUp() {
            this._resolve = null;
            this._reject = null;
        }
        /** Adds this state promise to an array of states and returns the same state promise instance. */
        addTo(queue) {
            if (queue && queue.push)
                queue.push(this);
            return this;
        }
        /**
         *  Forces this promise to continue in an uncompleted state, which assumes the developer is aware an will handle the state accordingly.
         * @param {T} value The value to resolve with in order to continue.
         */
        continueUncompleted(value) {
            if (!this._completed) {
                this._resolve && this._resolve(value);
                this._cleanUp();
            }
            else
                throw DS.Exception.error("SpecializedPromise.continueUncompleted()", "The promise has already set 'completed' to true.");
        }
        /** Just a shortcut to set an "Aborted." error message, which rejects the promise. */
        abort() {
            this.error = "Aborted.";
        }
    }
    DS.SpecializedPromise = SpecializedPromise;
    class TimeBasedPromise extends SpecializedPromise {
        constructor(executor) {
            super(executor);
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
        }
        /**
         * Called 'setTimeout()' with the specified time, in milliseconds, along with the callback function.
         * @param time The time in milliseconds.
         * @param callback The callback to execute. If not supplied the promise resolves automatically once the time elapses.
         */
        _setTimer(time, callback) {
            this._time = time;
            if (time > 0)
                this._timerHandle = setTimeout(callback !== null && callback !== void 0 ? callback : this.doResolve.bind(this), this._time);
        }
        /** Clears any timer handles and resets some internal values. */
        _cleanUp() {
            super._cleanUp();
            if (this._timerHandle !== null && this._timerHandle !== void 0)
                clearTimeout(this._timerHandle);
            this._timerHandle = null;
        }
    }
    DS.TimeBasedPromise = TimeBasedPromise;
    /**
     * Creates a promise that is resolved when some state is set. This allows a task to stay dormant until some external state changes.
     */
    class StatePromise extends TimeBasedPromise {
        constructor(executorOrTimeout) {
            super(executorOrTimeout);
            __state.set(this, void 0);
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
            if (typeof executorOrTimeout == 'number') {
                this._setTimer(executorOrTimeout, () => this.error = 'Timed out.');
            }
        }
        /**
         * Any user-specific state value that will resolve this promise.
         * Setting this to undefined has no effect (see also: continueUncompleted()).
         */
        get state() { return __classPrivateFieldGet(this, __state); }
        set state(v) {
            if (__classPrivateFieldGet(this, __state) === void 0) {
                __classPrivateFieldSet(this, __state, v);
                if (this._completed)
                    this.doResolve(true);
            }
        }
        /**
         *  Forces this promise to continue in an uncompleted state, which assumes the developer is aware an will handle the state accordingly.
         */
        continueUncompleted() {
            super.continueUncompleted(false);
        }
    }
    __state = new WeakMap();
    DS.StatePromise = StatePromise;
})(DS || (DS = {}));
//# sourceMappingURL=StatePromise.js.map