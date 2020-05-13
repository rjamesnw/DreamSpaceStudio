namespace DS {

    export type TExecutor = (resolve: (value?: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) => void;

    /**
     * Creates a promise that is resolved when some state is set. This allows a task to stay dormant until some external state changes.
     */
    export class SpecializedPromise<T = any, TData = any> extends Promise<T> {
        /** 
         * Returns true once a state have been set. Once the state is set it cannot be changed.
         */
        get completed() { return !!this._completed; }
        protected _completed = false;

        /**
         * Gets or sets an error state on this object.
         * Setting an error state (such as an Error object reference) will trigger "reject" on the promise.
         * Note: Even if error is set to undefined or null, it still counts as an error state, and 'failed' will be true.
         */
        get error() { return this._error; }
        set error(err: any) {
            var rej = this._reject;
            if (rej) {
                this._cleanUp();
                this._error = err;
                this._failed = true;
                rej && rej(this._error);
            }
        }
        protected _error: any;

        /**
         * Returns true if this promise erred out.
         */
        get failed() { return !!this._failed; }
        protected _failed: boolean;

        protected _resolve: (value?: T | PromiseLike<T>) => void;
        protected _reject: (reason?: any) => void;

        /** Any user-specific data that needs to be associated with this promise. */
        data?: TData;

        constructor(executor?: TExecutor | any) {
            super(typeof executor == 'function' ? executor : ((res, rej) => { _res = res; _rej = rej; }));
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
            if (typeof executor != 'function') {
                var _res: typeof SpecializedPromise.prototype._resolve; // (this will be hoisted and available to the promise executor)
                var _rej: typeof SpecializedPromise.prototype._reject; // (this will be hoisted and available to the promise executor)
                this._resolve = _res;
                this._reject = _rej;
            }
        }

        protected doResolve(value?: T) {
            this._completed = true;
            this._resolve && this._resolve(value);
        }

        protected _cleanUp() {
            this._resolve = null;
            this._reject = null;
        }

        /** Adds this state promise to an array of states and returns the same state promise instance. */
        addTo(queue: SpecializedPromise[]) {
            if (queue && queue.push)
                queue.push(this);
            return this;
        }

        /** 
         *  Forces this promise to continue in an uncompleted state, which assumes the developer is aware an will handle the state accordingly. 
         * @param {T} value The value to resolve with in order to continue.
         */
        continueUncompleted(value: T) {
            if (!this._completed) {
                this._resolve && this._resolve(value);
                this._cleanUp();
            }
            else throw Exception.error("SpecializedPromise.continueUncompleted()", "The promise has already set 'completed' to true.");
        }

        /** Just a shortcut to set an "Aborted." error message, which rejects the promise. */
        abort() {
            this.error = "Aborted.";
        }
    }

    export class TimeBasedPromise<T = any, TData = any> extends SpecializedPromise<T, TData> {
        protected _time: number; // (in milliseconds)
        protected _timerHandle: any;

        constructor(executor?: TExecutor | any) {
            super(executor);
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
        }

        /**
         * Called 'setTimeout()' with the specified time, in milliseconds, along with the callback function.
         * @param time The time in milliseconds.
         * @param callback The callback to execute. If not supplied the promise resolves automatically once the time elapses.
         */
        protected _setTimer(time: number, callback?: Action) {
            this._time = time;
            if (time > 0)
                this._timerHandle = setTimeout(callback ?? this.doResolve.bind(this), this._time);
        }

        /** Clears any timer handles and resets some internal values. */
        protected _cleanUp() {
            super._cleanUp();

            if (this._timerHandle !== null && this._timerHandle !== void 0)
                clearTimeout(this._timerHandle);
            this._timerHandle = null;
        }
    }

    /**
     * Creates a promise that is resolved when some state is set. This allows a task to stay dormant until some external state changes.
     */
    export class StatePromise<TState = boolean, TData = any> extends TimeBasedPromise<boolean, TData> {
        /** 
         * Any user-specific state value that will resolve this promise. 
         * Setting this to undefined has no effect (see also: continueUncompleted()).
         */
        get state() { return this.#_state; }
        set state(v) {
            if (this.#_state === void 0) {
                this.#_state = v;
                if (this._completed)
                    this.doResolve(true);
            }
        }
        #_state: TState;

        /**
         * Constructs a new StatePromise instance.
         * @param {number} timeout An optional timeout period, in milliseconds, after which a rejection occurs.
         */
        constructor(timeout?: number); // (this just hides the execute parameter)
        constructor(executorOrTimeout?: number | TExecutor) {
            super(executorOrTimeout);
            // (note: '.then()', etc., will also create an instance of this and pass in executor, so we need to respect that and return a normal promise)
            if (typeof executorOrTimeout == 'number') {
                this._setTimer(executorOrTimeout, () => this.error = 'Timed out.');
            }
        }

        /** 
         *  Forces this promise to continue in an uncompleted state, which assumes the developer is aware an will handle the state accordingly. 
         */
        continueUncompleted() {
            super.continueUncompleted(false);
        }
    }
}