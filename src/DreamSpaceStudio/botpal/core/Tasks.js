"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _a;
var __index, __delay, __category, __name;
Object.defineProperty(exports, "__esModule", { value: true });
const TimeReferencedObject_1 = require("./TimeReferencedObject");
const Brain_1 = require("./Brain");
/**
 *  Represents a task that is running on the brain instance.
*/
class BrainTask extends TimeReferencedObject_1.default {
    constructor() {
        // --------------------------------------------------------------------------------------------------------------------
        super(...arguments);
        __index.set(this, -1); // (used to quickly remove the task from a brain's task list; note: never read/modify this without first locking Brain._Tasks)
        __delay.set(this, void 0);
        __category.set(this, void 0);
        __name.set(this, void 0);
    }
    /** The maximum time to wait for a result. The default is 5 minutes (8 hours if a debugger is attached). */
    static get MaxWaitTime() { return new DS.TimeSpan(0, 5, 0); }
    /**
     * Set for delayed tasks.
     */
    get Delay() { return __classPrivateFieldGet(this, __delay); }
    /**
     *  Set for delayed tasks.
     */
    get Category() { return __classPrivateFieldGet(this, __category); }
    /**
     *  Set for delayed tasks.
     */
    get Name() { return __classPrivateFieldGet(this, __name); }
    /**
     *  Used with delayed tasks. A properly registered key will have 'IsDelayed' return true.
     *  <para>Note: Reading this key will auto generated a GUID for the name if the task does not have a name.</para>
     */
    get Key() {
        var _a;
        if (this.Name == null)
            this.Name = DS.Utilities.createGUID();
        return ((_a = this.Category) !== null && _a !== void 0 ? _a : "") + "_" + this.Name;
    }
}
exports.default = BrainTask;
__index = new WeakMap(), __delay = new WeakMap(), __category = new WeakMap(), __name = new WeakMap();
{
    get;
    {
        return Category != null || Name != null;
    }
}
Task;
Task;
{
    get;
    set;
}
bool;
CanBeCanceled;
{
    get;
    {
        return _CancellationSource != null && _CancellationSource.Token.CanBeCanceled;
    }
}
bool;
IsCancellationRequested;
{
    get;
    {
        return _CancellationSource != null && _CancellationSource.IsCancellationRequested;
    }
}
CancellationToken;
Token;
{
    get;
    {
        return (_a = _CancellationSource === null || _CancellationSource === void 0 ? void 0 : _CancellationSource.Token) !== null && _a !== void 0 ? _a : CancellationToken.None;
    }
}
CancellationTokenSource;
TokenSource;
{
    get;
    {
        return _CancellationSource;
    }
}
CancellationTokenSource;
_CancellationSource;
Exception;
Error;
{
    get;
    set;
}
Func < Task > _Action0;
Func < BrainTask, Task > _Action1;
void _run0();
{
    try {
        _CheckDelay();
        if (_Action0 != null)
            _Action0.Invoke().Wait(MaxWaitTime);
    }
    catch (Exception) { }
    ex;
    {
        Error = ex;
        throw ex;
    }
    try {
    }
    finally {
        _CleanUp();
    }
}
void _run1();
{
    try {
        _CheckDelay();
        if (_Action1 != null)
            _Action1.Invoke(this).Wait(MaxWaitTime);
    }
    catch (Exception) { }
    ex;
    {
        Error = ex;
        throw ex;
    }
    try {
    }
    finally {
        _CleanUp();
    }
}
bool;
_CheckDelay(); // (returns true if the task was delayed before running - but not currently used at the moment however)
{
    if (Delay.TotalMilliseconds > 0) {
        Token.WaitHandle.WaitOne(Delay);
        Token.ThrowIfCancellationRequested();
        return true;
    }
    return false;
}
void _CleanUp();
{
    Brain_1.default === null || Brain_1.default === void 0 ? void 0 : Brain_1.default.RemoveTask(this);
}
BrainTask(Brain_1.default, brain);
{
    Brain_1.default = brain;
}
BrainTask(Brain_1.default, brain, Func < Task > action);
{
    Brain_1.default = brain;
    _Action0 = action;
    Task = new Task(_run0);
}
BrainTask(Brain_1.default, brain, Func < BrainTask, Task > action);
{
    Brain_1.default = brain;
    _Action1 = action;
    Task = new Task(_run1);
}
BrainTask(Brain_1.default, brain, Func < BrainTask, Task > action, CancellationToken, cancellationToken);
{
    Brain_1.default = brain;
    _Action1 = action;
    _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    Task = new Task(_run1, cancellationToken);
}
BrainTask(Brain_1.default, brain, Func < BrainTask, Task > action, TaskCreationOptions, creationOptions);
{
    Brain_1.default = brain;
    _Action1 = action;
    Task = new Task(_run1, creationOptions);
}
BrainTask(Brain_1.default, brain, Func < BrainTask, Task > action, CancellationToken, cancellationToken, TaskCreationOptions, creationOptions);
{
    Brain_1.default = brain;
    _Action1 = action;
    _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    Task = new Task(_run1, cancellationToken, creationOptions);
}
internal;
BrainTask();
{
    Task = new Task(_run0);
}
BrainTask;
Start();
{
    Task.Start();
    return this;
}
BrainTask;
Start(TimeSpan, delay, string, category = null, string, name = null);
{
    if (delay.TotalMilliseconds < 0)
        throw new InvalidOperationException("You cannot delay brain tasks indefinitely.");
    Delay = delay;
    Category = category;
    Name = name;
    lock(Brain_1.default._DelayedTasks);
    {
        var existingTask = Brain_1.default._DelayedTasks.Value(Key);
        if (existingTask != null) {
            // ... clear the key and flag the task to abort, as we are replacing it ...
            existingTask.Category = null;
            existingTask.Name = null;
            existingTask.Cancel();
        }
        Brain_1.default._DelayedTasks[Key] = this;
    }
    Task.Start();
    return this;
}
void Cancel();
{
    if (_CancellationSource == null)
        throw new InvalidOperationException("This task cannot be canceled.");
    if (!_CancellationSource.IsCancellationRequested)
        _CancellationSource.Cancel();
}
BrainTask;
SetReadLock(string, category, string, name);
{
    var locker = Brain_1.default.GetLocker(category, name);
    return SetReadLock(locker);
}
BrainTask;
SetReadLock(Locker, locker);
{
    locker.TryEnterReadLock();
    return this;
}
BrainTask;
SetWriteLock(string, category, string, name);
{
    var locker = Brain_1.default.GetLocker(category, name);
    return SetWriteLock(locker);
}
BrainTask;
SetWriteLock(Locker, locker);
{
    locker.TryEnterWriteLock();
    return this;
}
class BrainTask {
}
BrainTask;
where;
TState: class {
}
 > _Action2;
Action < BrainTask < TState > , TState > _Action3;
TState;
State;
void _run2();
{
    try {
        _CheckDelay();
        _Action2 === null || _Action2 === void 0 ? void 0 : _Action2.Invoke(this);
    }
    catch (Exception) { }
    ex;
    {
        Error = ex;
        throw ex;
    }
    try {
    }
    finally {
        _CleanUp();
    }
}
void _run3(object, state);
{
    try {
        _CheckDelay();
        _Action3 === null || _Action3 === void 0 ? void 0 : _Action3.Invoke(this, State);
    }
    catch (Exception) { }
    ex;
    {
        Error = ex;
        throw ex;
    }
    try {
    }
    finally {
        _CleanUp();
    }
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState >> action, TState, state);
base(brain);
{
    State = state;
    _Action2 = action;
    Task = new Task(_run2);
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState >> action, TState, state, CancellationToken, cancellationToken);
base(brain);
{
    State = state;
    _Action2 = action;
    _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    Task = new Task(_run2, cancellationToken);
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState >> action, TState, state, TaskCreationOptions, creationOptions);
base(brain);
{
    State = state;
    _Action2 = action;
    Task = new Task(_run2, creationOptions);
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState >> action, TState, state, CancellationToken, cancellationToken, TaskCreationOptions, creationOptions);
base(brain);
{
    State = state;
    _Action2 = action;
    _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    Task = new Task(_run2, cancellationToken, creationOptions);
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState > , TState > action, TState, state);
base(brain);
{
    State = state;
    _Action3 = action;
    Task = new Task(_run3, this);
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState > , TState > action, TState, state, CancellationToken, cancellationToken);
base(brain);
{
    _Action3 = action;
    _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    Task = new Task(_run3, this, cancellationToken);
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState > , TState > action, TState, state, TaskCreationOptions, creationOptions);
base(brain);
{
    _Action3 = action;
    Task = new Task(_run3, this, creationOptions);
}
BrainTask(Brain_1.default, brain, Action < BrainTask < TState > , TState > action, TState, state, CancellationToken, cancellationToken, TaskCreationOptions, creationOptions);
base(brain);
{
    _Action3 = action;
    _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    Task = new Task(_run3, this, cancellationToken, creationOptions);
}
//# sourceMappingURL=Tasks.js.map