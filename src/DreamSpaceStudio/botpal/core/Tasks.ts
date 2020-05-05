import TimeReferencedObject from "./TimeReferencedObject";
import Brain from "./Brain";

/**
 *  Represents a task that is running on the brain instance.
*/
export default class BrainTask extends TimeReferencedObject {
    // --------------------------------------------------------------------------------------------------------------------

    readonly Brain: Brain;

    #_index = -1; // (used to quickly remove the task from a brain's task list; note: never read/modify this without first locking Brain._Tasks)

    /** The maximum time to wait for a result. The default is 5 minutes (8 hours if a debugger is attached). */
    static get MaxWaitTime(): DS.TimeSpan { return new DS.TimeSpan(0, 5, 0); }

    /**
     * Set for delayed tasks.
     */
    get Delay(): DS.TimeSpan { return this.#_delay; }
    #_delay: DS.TimeSpan;

    /**
     *  Set for delayed tasks.
     */
    get Category() { return this.#_category; }
    #_category: string;

    /**
     *  Set for delayed tasks.
     */
    get Name() { return this.#_name; }
    #_name: string;

    /**
     *  Used with delayed tasks. A properly registered key will have 'IsDelayed' return true.
     *  <para>Note: Reading this key will auto generated a GUID for the name if the task does not have a name.</para>
     */
    get Key() {
        if (this.Name == null)
            this.Name = DS.Utilities.createGUID();
        return (this.Category ?? "") + "_" + this.Name;
    }

    /**
     *  Returns true if this task was started in a delayed state (even if 0 was used).
     *  If true, a Key will exist, which is the key used 
    */
    public bool IsDelayed { get { return Category != null || Name != null; } }

public Task Task { get; protected set; }

public bool CanBeCanceled { get { return _CancellationSource != null && _CancellationSource.Token.CanBeCanceled; } }

public bool IsCancellationRequested { get { return _CancellationSource != null && _CancellationSource.IsCancellationRequested; } }

public CancellationToken Token { get { return _CancellationSource?.Token ?? CancellationToken.None; } }

public CancellationTokenSource TokenSource { get { return _CancellationSource; } }

protected CancellationTokenSource _CancellationSource;

/**
 *  Set only if the action triggered an exception (usually as an error, or cancellation request).
*/
public Exception Error { get; protected set; }

// These action and run methods exist to prevent having to use lambdas.
protected Func < Task > _Action0;
protected Func < BrainTask, Task > _Action1;
protected void _run0()
{
    try { _CheckDelay(); if (_Action0 != null) _Action0.Invoke().Wait(MaxWaitTime); }
    catch (Exception ex) { Error = ex; throw ex; }
    finally { _CleanUp(); }
}
protected void _run1()
{
    try { _CheckDelay(); if (_Action1 != null) _Action1.Invoke(this).Wait(MaxWaitTime); }
    catch (Exception ex) { Error = ex; throw ex; }
    finally { _CleanUp(); }
}

protected bool _CheckDelay() // (returns true if the task was delayed before running - but not currently used at the moment however)
{
    if (Delay.TotalMilliseconds > 0) {
        Token.WaitHandle.WaitOne(Delay);
        Token.ThrowIfCancellationRequested();
        return true;
    }
    return false;
}
protected void _CleanUp()
{
    Brain?.RemoveTask(this);
}

// --------------------------------------------------------------------------------------------------------------------

/**
 *  Constructs a brain task with a delegate that does not require a state object.
*/
public BrainTask(Brain brain) { Brain = brain; }
public BrainTask(Brain brain, Func < Task > action) { Brain = brain; _Action0 = action; Task = new Task(_run0); }
public BrainTask(Brain brain, Func < BrainTask, Task > action) { Brain = brain; _Action1 = action; Task = new Task(_run1); }
public BrainTask(Brain brain, Func < BrainTask, Task > action, CancellationToken cancellationToken) { Brain = brain; _Action1 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run1, cancellationToken); }
public BrainTask(Brain brain, Func < BrainTask, Task > action, TaskCreationOptions creationOptions) { Brain = brain; _Action1 = action; Task = new Task(_run1, creationOptions); }
public BrainTask(Brain brain, Func < BrainTask, Task > action, CancellationToken cancellationToken, TaskCreationOptions creationOptions) { Brain = brain; _Action1 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run1, cancellationToken, creationOptions); }

internal BrainTask() { Task = new Task(_run0); }

// --------------------------------------------------------------------------------------------------------------------

/**
 *  Start the task now.
*/
public BrainTask Start() { Task.Start(); return this; }
/**
 *  Start the task after a period of time elapses.
 *  The task can be registered using a category and name. This can be used later to reset the delay, or clear the task before it runs.
*/
public BrainTask Start(TimeSpan delay, string category = null, string name = null)
{
    if (delay.TotalMilliseconds < 0)
        throw new InvalidOperationException("You cannot delay brain tasks indefinitely.");
    Delay = delay;
    Category = category;
    Name = name;
    lock(Brain._DelayedTasks)
    {
        var existingTask = Brain._DelayedTasks.Value(Key);
        if (existingTask != null) {
            // ... clear the key and flag the task to abort, as we are replacing it ...
            existingTask.Category = null;
            existingTask.Name = null;
            existingTask.Cancel();
        }
        Brain._DelayedTasks[Key] = this;
    }
    Task.Start();
    return this;
}

public void Cancel()
{
    if (_CancellationSource == null)
        throw new InvalidOperationException("This task cannot be canceled.");
    if (!_CancellationSource.IsCancellationRequested)
        _CancellationSource.Cancel();
}

// --------------------------------------------------------------------------------------------------------------------
// Locking

public BrainTask SetReadLock(string category, string name)
{
    var locker = Brain.GetLocker(category, name);
    return SetReadLock(locker);
}
public BrainTask SetReadLock(Locker locker)
{
    locker.TryEnterReadLock();
    return this;
}

public BrainTask SetWriteLock(string category, string name)
{
    var locker = Brain.GetLocker(category, name);
    return SetWriteLock(locker);
}
public BrainTask SetWriteLock(Locker locker)
{
    locker.TryEnterWriteLock();
    return this;
}

    // --------------------------------------------------------------------------------------------------------------------
}

public class BrainTask<TState> : BrainTask where TState: class {
    Action<BrainTask<TState>> _Action2;
Action < BrainTask < TState >, TState > _Action3;
    public TState State;

    protected void _run2()
{
    try { _CheckDelay(); _Action2?.Invoke(this); }
    catch (Exception ex) { Error = ex; throw ex; }
        finally { _CleanUp(); }
}

void _run3(object state)
{
    try { _CheckDelay(); _Action3?.Invoke(this, State); }
    catch (Exception ex) { Error = ex; throw ex; }
        finally { _CleanUp(); }
}

    /**
     *  Constructs a brain task with a delegate that doesn't require a state (usually for instance method references, where the state might be the instance itself).
    */
    public BrainTask(Brain brain, Action < BrainTask < TState >> action, TState state) : base(brain)
{ State = state; _Action2 = action; Task = new Task(_run2); }
    public BrainTask(Brain brain, Action < BrainTask < TState >> action, TState state, CancellationToken cancellationToken) : base(brain)
{ State = state; _Action2 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run2, cancellationToken); }
    public BrainTask(Brain brain, Action < BrainTask < TState >> action, TState state, TaskCreationOptions creationOptions) : base(brain)
{ State = state; _Action2 = action; Task = new Task(_run2, creationOptions); }
    public BrainTask(Brain brain, Action < BrainTask < TState >> action, TState state, CancellationToken cancellationToken, TaskCreationOptions creationOptions) : base(brain)
{ State = state; _Action2 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run2, cancellationToken, creationOptions); }

    /**
     *  Constructs a brain task with a delegate that requires a state object.
    */
    public BrainTask(Brain brain, Action < BrainTask < TState >, TState > action, TState state) : base(brain) { State = state; _Action3 = action; Task = new Task(_run3, this); }
    public BrainTask(Brain brain, Action < BrainTask < TState >, TState > action, TState state, CancellationToken cancellationToken) : base(brain) { _Action3 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run3, this, cancellationToken); }
    public BrainTask(Brain brain, Action < BrainTask < TState >, TState > action, TState state, TaskCreationOptions creationOptions) : base(brain) { _Action3 = action; Task = new Task(_run3, this, creationOptions); }
    public BrainTask(Brain brain, Action < BrainTask < TState >, TState > action, TState state, CancellationToken cancellationToken, TaskCreationOptions creationOptions) : base(brain) { _Action3 = action; _CancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken); Task = new Task(_run3, this, cancellationToken, creationOptions); }
}
