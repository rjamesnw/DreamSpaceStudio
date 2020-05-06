import TimeReferencedObject from "./TimeReferencedObject";
import Brain from "./Brain";

/**
 *  Represents a task that is running on the brain instance.
*/
export default class BrainTask<TState extends any = any> extends TimeReferencedObject {
    // --------------------------------------------------------------------------------------------------------------------
    state: TState;

    /**
     * A reference to the brain instance that this task belongs to.
     */
    get brain() { return this.#_brain; }
    #_brain: Brain;

    readonly _index = -1; // (used to quickly remove the task from a brain's task list; note: never read/modify this without first locking Brain._Tasks)

    /** The maximum time to wait for a result. The default is 5 minutes (8 hours if a debugger is attached). */
    static get maxWaitTime(): DS.TimeSpan { return new DS.TimeSpan(0, 5, 0); }

    /**
     * Set for delayed tasks.
     */
    get delay(): DS.TimeSpan { return this.#_delay; }
    #_delay: DS.TimeSpan;

    /**
     *  Set for delayed tasks.
     */
    get category() { return this.#_category; }
    #_category: string;

    /**
     *  Set for delayed tasks.
     */
    get name() { return this.#_name; }
    #_name: string;

    /** 
     * If set to am integer greater than 0, specifies the number of milliseconds before a timeout occurs to abort the task.
     * Note: Changing this after a task has been started has no affect.
     */
    timeout: number;

    /**
     *  Used with delayed tasks. A properly registered key will have 'isDelayed' return true.
     *  Note: Reading this key will auto generated a GUID for the name if the task does not have a name.
     */
    get key() {
        if (!this.#_name)
            this.#_name = DS.Utilities.createGUID();
        return DS.StringUtils.append(this.#_category || "", this.#_name, "_");
    }

    /**
     *  Returns true if this task was started in a delayed state (even if 0 was used).
     *  If true, a Key will exist, which is the key used 
    */
    get isDelayed(): boolean { return this.category != null || this.name != null; }

    /**
     * This is set to a special state-based promise object when 'start()' is called, and is undefined prior to that.
     * @returns
     */
    get promise(): DS.StatePromise { return this.#_promise; }
    #_promise: DS.StatePromise;

    /**
     * Returns true if this task can be cancelled.
     * @returns
     */
    get canBeCanceled(): boolean { return this._canBeCancelled; }
    protected _canBeCancelled: boolean;

    /**
     * Returns true if this task was requested to be cancelled.
     * @returns
     */
    get cancelled(): boolean { return this._cancelled; }
    protected _cancelled: boolean;

    /**
     *  Set only if the action triggered an exception (usually as an error, or cancellation request).
    */
    get error(): DS.Exception { return this.#_promise?.error ?? this.#_error; }
    #_error: DS.Exception;

    // These action and run methods exist to prevent having to use lambdas to wrap and execute the given actions.
    #_action: Func1<BrainTask, Promise>;
    private async _run() {
        try {
            await this._checkDelay();
            if (this.#_action != null) {
                var result = this.#_action.call(this);
                if (result instanceof Promise)
                    await result;
            }
            this.#_promise.state = true;
        }
        catch (ex) { this.#_promise.error = ex; }
        finally { this._cleanUp(); }
    };

    protected async _checkDelay(): Promise<boolean> // (returns true if the task was delayed before running - but the return value is not currently used at the moment)
    {
        var delayTime = this.delay?.getTime();
        if (delayTime > 0) {
            await Promise.delay(delayTime);
            return true;
        }
        return Promise.resolve(false);
    }
    protected _cleanUp() {
        this.#_brain?.removeTask(this);
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Constructs a brain task with a delegate that does not require a state object.
     * @param {Brain} brain A reference to the brain where the task belongs to.
     * @param {Func1<BrainTask<TState>, Promise>?} action The action to execute for this task.
     * @param {number?} timeout An optional timeout in ms.
     */
    constructor(brain: Brain, action: Func1<BrainTask<TState>, Promise>, timeout?: number) {
        super();

        if (!brain)
            throw DS.Exception.argumentRequired("BrainTask.cancel()", "brain");
        if (!action)
            throw DS.Exception.argumentRequired("BrainTask.cancel()", "action");

        this.#_brain = brain;
        this.#_action = action;
        this.timeout = timeout;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Start the task now.
     *  Note: If you need to wait for the task, you can do 'await brainTask.start().promise'.
     */
    start(): this;
    /**
     *  Start the task after a period of time elapses.
     *  The task can be registered using a category and name. This can be used later to reset the delay, or clear the task before it runs.
    */
    start(delay: DS.TimeSpan, category?: string, name?: string): this;
    start(delay?: DS.TimeSpan, category: string = null, name: string = null): this {
        if (arguments.length > 0) {
            if (delay.getTime() < 0)
                delay = new DS.TimeSpan(0);
            this.#_delay = delay;
            this.#_category = category;
            this.#_name = name;
            var existingTask: BrainTask = this.#_brain._DelayedTasks.Value(this.key);
            if (existingTask != null) {
                // ... clear the key and flag the task to abort, as we are replacing it ...
                existingTask.#_category = null;
                existingTask.#_name = null;
                existingTask.cancel();
            }
            this.#_brain._DelayedTasks[this.key] = this;
        }
        this.#_promise = new DS.StatePromise(this.timeout);
        this._run();
        return this;
    }

    cancel() {
        if (this.#_promise && !this.#_promise.completed && !this.#_promise.failed) {
            if (!this.canBeCanceled)
                throw DS.Exception.error("BrainTask.cancel()", "This task cannot be canceled.");

            this.#_promise.error = "Aborted.";
        }
    }
}


//export default class BrainTask<TState extends object> extends BrainTaskBase {
//    _Action2: Action<BrainTask<TState>>;
//    _Action3: Action2<BrainTask<TState>, TState>;
//    State: TState;

//    protected void _run2() {
//        try { _CheckDelay(); _Action2?.Invoke(this); }
//        catch (Exception ex) { Error = ex; throw ex; }
//        finally { _CleanUp(); }
//    }

//    _run3(state: object) {
//        try { _CheckDelay(); _Action3?.Invoke(this, State); }
//        catch (Exception ex) { Error = ex; throw ex; }
//        finally { _CleanUp(); }
//    }

//    /**
//     *  Constructs a brain task with a delegate that doesn't require a state (usually for instance method references, where the state might be the instance itself).
//    */
//    constructor(brain: Brain, action: Action<BrainTask<TState>>, state: TState): base(brain)
//{ State = state; _Action2 = action; Task = new Task(_run2); }
//constructor(brain: Brain, action: Action < BrainTask < TState >> , state: TState, cancellationToken: CancellationToken) : base(brain)
//{ State = state; _Action2 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run2, cancellationToken); }
//constructor(brain: Brain, action: Action < BrainTask < TState >> , state: TState, creationOptions: TaskCreationOptions) : base(brain)
//{ State = state; _Action2 = action; Task = new Task(_run2, creationOptions); }
//constructor(brain: Brain, action: Action < BrainTask < TState >> , state: TState, cancellationToken: CancellationToken, creationOptions: TaskCreationOptions) : base(brain)
//{ State = state; _Action2 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run2, cancellationToken, creationOptions); }

///**
// *  Constructs a brain task with a delegate that requires a state object.
//*/
//constructor(brain: Brain, action: Action < BrainTask < TState >, TState > , TState state) : base(brain) { State = state; _Action3 = action; Task = new Task(_run3, this); }
//constructor(brain: Brain, action: Action < BrainTask < TState >, TState > , TState state, cancellationToken: CancellationToken) : base(brain) { _Action3 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run3, this, cancellationToken); }
//constructor(brain: Brain, action: Action < BrainTask < TState >, TState > , TState state, creationOptions: TaskCreationOptions) : base(brain) { _Action3 = action; Task = new Task(_run3, this, creationOptions); }
//constructor(brain: Brain, action: Action < BrainTask < TState >, TState > , TState state, cancellationToken: CancellationToken, creationOptions: TaskCreationOptions) : base(brain) { _Action3 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run3, this, cancellationToken, creationOptions); }
//}
