"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __brain, __delay, __category, __name, __promise, __error, __action;
Object.defineProperty(exports, "__esModule", { value: true });
const TimeReferencedObject_1 = require("./TimeReferencedObject");
/**
 *  Represents a task that is running on the brain instance.
*/
class BrainTask extends TimeReferencedObject_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    /**
     * Constructs a brain task with a delegate that does not require a state object.
     * @param {Brain} brain A reference to the brain where the task belongs to.
     * @param {Func1<BrainTask<TState>, Promise>?} action The action to execute for this task.
     * @param {number?} timeout An optional timeout in ms.
     */
    constructor(brain, action, timeout) {
        super();
        __brain.set(this, void 0);
        this._index = -1; // (used to quickly remove the task from a brain's task list; note: never read/modify this without first locking Brain._Tasks)
        __delay.set(this, void 0);
        __category.set(this, void 0);
        __name.set(this, void 0);
        __promise.set(this, void 0);
        __error.set(this, void 0);
        // These action and run methods exist to prevent having to use lambdas to wrap and execute the given actions.
        __action.set(this, void 0);
        if (!brain)
            throw DS.Exception.argumentRequired("BrainTask.cancel()", "brain");
        if (!action)
            throw DS.Exception.argumentRequired("BrainTask.cancel()", "action");
        __classPrivateFieldSet(this, __brain, brain);
        __classPrivateFieldSet(this, __action, action);
        this.timeout = timeout;
    }
    /**
     * A reference to the brain instance that this task belongs to.
     */
    get brain() { return __classPrivateFieldGet(this, __brain); }
    /** The maximum time to wait for a result. The default is 5 minutes (8 hours if a debugger is attached). */
    static get maxWaitTime() { return new DS.TimeSpan(0, 5, 0); }
    /**
     * Set for delayed tasks.
     */
    get delay() { return __classPrivateFieldGet(this, __delay); }
    /**
     *  Set for delayed tasks.
     */
    get category() { return __classPrivateFieldGet(this, __category); }
    /**
     *  Set for delayed tasks.
     */
    get name() { return __classPrivateFieldGet(this, __name); }
    /**
     *  Used with delayed tasks. A properly registered key will have 'isDelayed' return true.
     *  Note: Reading this key will auto generated a GUID for the name if the task does not have a name.
     */
    get key() {
        if (!__classPrivateFieldGet(this, __name))
            __classPrivateFieldSet(this, __name, DS.Utilities.createGUID());
        return DS.StringUtils.append(__classPrivateFieldGet(this, __category) || "", __classPrivateFieldGet(this, __name), "_");
    }
    /**
     *  Returns true if this task was started in a delayed state (even if 0 was used).
     *  If true, a Key will exist, which is the key used
    */
    get isDelayed() { return this.category != null || this.name != null; }
    /**
     * This is set to a special state-based promise object when 'start()' is called, and is undefined prior to that.
     * @returns
     */
    get promise() { return __classPrivateFieldGet(this, __promise); }
    /**
     * Returns true if this task can be cancelled.
     * @returns
     */
    get canBeCanceled() { return this._canBeCancelled; }
    /**
     * Returns true if this task was requested to be cancelled.
     * @returns
     */
    get cancelled() { return this._cancelled; }
    /**
     *  Set only if the action triggered an exception (usually as an error, or cancellation request).
    */
    get error() { var _a, _b; return (_b = (_a = __classPrivateFieldGet(this, __promise)) === null || _a === void 0 ? void 0 : _a.error) !== null && _b !== void 0 ? _b : __classPrivateFieldGet(this, __error); }
    async _run() {
        try {
            await this._checkDelay();
            if (__classPrivateFieldGet(this, __action) != null) {
                var result = __classPrivateFieldGet(this, __action).call(this);
                if (result instanceof Promise)
                    await result;
            }
            __classPrivateFieldGet(this, __promise).state = true;
        }
        catch (ex) {
            __classPrivateFieldGet(this, __promise).error = ex;
        }
        finally {
            this._cleanUp();
        }
    }
    ;
    async _checkDelay() {
        var _a;
        var delayTime = (_a = this.delay) === null || _a === void 0 ? void 0 : _a.getTime();
        if (delayTime > 0) {
            await Promise.delay(delayTime);
            return true;
        }
        return Promise.resolve(false);
    }
    _cleanUp() {
        var _a;
        (_a = __classPrivateFieldGet(this, __brain)) === null || _a === void 0 ? void 0 : _a.removeTask(this);
    }
    start(delay, category = null, name = null) {
        if (arguments.length > 0) {
            if (delay.getTime() < 0)
                delay = new DS.TimeSpan(0);
            __classPrivateFieldSet(this, __delay, delay);
            __classPrivateFieldSet(this, __category, category);
            __classPrivateFieldSet(this, __name, name);
            var existingTask = __classPrivateFieldGet(this, __brain)._DelayedTasks.Value(this.key);
            if (existingTask != null) {
                // ... clear the key and flag the task to abort, as we are replacing it ...
                __classPrivateFieldSet(existingTask, __category, null);
                __classPrivateFieldSet(existingTask, __name, null);
                existingTask.cancel();
            }
            __classPrivateFieldGet(this, __brain)._DelayedTasks[this.key] = this;
        }
        __classPrivateFieldSet(this, __promise, new DS.StatePromise(this.timeout));
        this._run();
        return this;
    }
    cancel() {
        if (__classPrivateFieldGet(this, __promise) && !__classPrivateFieldGet(this, __promise).completed && !__classPrivateFieldGet(this, __promise).failed) {
            if (!this.canBeCanceled)
                throw DS.Exception.error("BrainTask.cancel()", "This task cannot be canceled.");
            __classPrivateFieldGet(this, __promise).error = "Aborted.";
        }
    }
}
exports.default = BrainTask;
__brain = new WeakMap(), __delay = new WeakMap(), __category = new WeakMap(), __name = new WeakMap(), __promise = new WeakMap(), __error = new WeakMap(), __action = new WeakMap();
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
//# sourceMappingURL=BrainTask.js.map