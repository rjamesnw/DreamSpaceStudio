"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thread = void 0;
const Memory_1 = require("./Memory");
const Response_1 = require("../core/Response");
class Thread {
}
exports.Thread = Thread;
/** The brain is the whole system that observes, evaluates, and decides what to do based on user inputs. */
class Brain {
    constructor() {
        // --------------------------------------------------------------------------------------------------------------------
        this.LanguageParsingRegex = new RegExp("\".*?\"|'.*?'|[A-Za-z']+|[0-9]+|\\s+|.", 'm');
        //? public Thought Thought; // (this should never be null when a brain is loaded, as thoughts are historical; otherwise this is a brand new brain, and this can be null)
        this._Tasks = new Array();
        this._DelayedTasks = new Map();
    }
}
exports.default = Brain;
{
    get;
    {
        lock(_Operations);
        return _Operations.ToArray();
    }
}
internal;
List < Operation > _Operations;
new List();
Locker;
OperationsLocker;
{
    get;
    {
        return GetLocker("Operations", "ProcessLoop");
    }
}
bool;
IsShuttingDown;
{
    get;
    internal;
    set;
}
bool;
IsStopped;
{
    get;
    internal;
    set;
}
event;
ResponseHandler;
Response_1.default;
virtual;
async;
Task;
DoResponse(Response_1.default, response);
{
    if (Response_1.default != null)
        if (_SynchronizationContext != null) {
            var taskSource = new TaskCompletionSource();
            _SynchronizationContext.Send(async (_) => { await Response_1.default.Invoke(this, response); taskSource.SetResult(true); }, null);
            await taskSource.Task;
        }
        else
            await Response_1.default.Invoke(this, response); // (called directly from this thread as a last resort)
    //else
    //{
    //    // ... try other attempts ...
    //    Dispatcher dispatcher = Dispatcher.FromThread(_MainThread);
    //    if (dispatcher != null)
    //    {
    //        // We know the thread have a dispatcher that we can use.
    //        dispatcher.BeginInvoke((Action)(() => Response?.Invoke(this, response)));
    //    }
    //    else if (Application.Current != null && !Application.Current.Dispatcher.CheckAccess())
    //    {
    //        Application.Current.Dispatcher.BeginInvoke((Action)(() => Response?.Invoke(this, response)));
    //    }
    //    else Response?.Invoke(this, response); // (called directly from this thread as a last resort)
    //}
}
virtual;
Task;
DoResponse(string, response);
DoResponse(new Response_1.default(response));
async;
Task;
Say(string, text, string, voiceCode = null);
{
    if (TTSService == null)
        TTSService = new DefaultTTSService();
    await TTSService.Say(text, voiceCode);
}
Brain(SynchronizationContext, synchronizationContext = null, bool, configureConcepts = true);
{
    _MainThread = Thread.CurrentThread;
    _SynchronizationContext = synchronizationContext !== null && synchronizationContext !== void 0 ? synchronizationContext : SynchronizationContext.Current; // (supported both in WinForms AND WPF!)
    Memory_1.default = new Memory_1.default(this);
    if (configureConcepts)
        ConfigureDefaultConcepts();
    var task = _ProcessOperations(null);
}
Dictionary < Type, Concept > _Concepts;
new Dictionary();
IEnumerable < Concept > Concepts;
_Concepts.Values;
List < Exception > ConceptHandlerLoadErrors;
new List(); // (one place for all concepts to log errors on registration - the UI should display this on first load)
void ConfigureDefaultConcepts();
{
    var conceptTypes = (from), t;
     in Assembly.GetExecutingAssembly().GetTypes();
    where;
    t.IsClass && !t.IsGenericType && !t.IsAbstract && t.IsSubclassOf(typeof (Concept));
    select;
    t;
    ;
    foreach();
    var concept;
     in conceptTypes;
    {
        var conceptAttrib = concept.GetCustomAttribute();
        if (conceptAttrib != null && !conceptAttrib.Enabled)
            continue;
        // ... iterate over the concept methods and store them for text matching later ...
        Concept;
        conceptInstance = (Concept);
        Activator.CreateInstance(concept, this);
        _Concepts[concept] = conceptInstance;
        conceptInstance.RegisterHandlers();
    }
    // ... let all concepts know the core concepts are loaded and ready ...
    foreach();
    var concept;
     in _Concepts.Values;
    concept.OnAfterAllRegistered();
}
T;
GetConcept();
where;
T: Concept => (T);
_Concepts.Value(typeof (T));
Match < ConceptContext > [];
FindConceptContexts(string, text, double, threshold = 0.8);
{
    var dicItems = threshold == 1 ? // (if 'threshold' is 1.0 then do a similar [near exact] match [using group keys], otherwise find close partial matches instead.
        Memory_1.default.Dictionary.FindSimilarEntries(Memory_1.default.Brain.ToGroupKey(text)).SelectMany(i => i.ConceptContexts.Select(c => new Match(c, 1.0)))
        : Memory_1.default.Dictionary.FindMatchingEntries(text, threshold).SelectMany(m => m.Item.ConceptContexts.Select(c => new Match(c, m.Score)));
    return dicItems.ToArray();
}
void Stop(bool, wait = true);
{
    IsShuttingDown = true;
    if (wait) {
        Task[];
        tasks;
        lock(_Tasks);
        tasks = _Tasks.Select(t => t.Task).ToArray();
        Task.WaitAll(tasks, 1000);
    }
}
// --------------------------------------------------------------------------------------------------------------------
async;
Task;
_ProcessOperations(BrainTask, btask);
{
    if (btask != null) {
        Operation[];
        ops;
        Operation;
        op;
        using(OperationsLocker.WriteLock());
        {
            ops = _Operations.ToArray(); // (since the list may update, get a snapshot of the list as it is now)
        }
        // TODO: Get time elapsed to break out in case an operation takes too long so we can abort and until the next time (to reduce CPU usage). 
        for (int; i = 0, n = ops.Length; i < n && !IsShuttingDown)
            ;
        ++i;
        {
            op = ops[i];
            var completed = await op.Execute(btask);
            using(OperationsLocker.WriteLock());
            {
                if (completed)
                    _Operations.Remove(op);
                if (op.IsCompletedWithErrors)
                    await DoResponse(new Response_1.default("Hmmm. Sorry, it looks like I had an internal error with one of my operations. Please contact support and pass along the following details.", null, string.Join(Environment.NewLine, op.Errors.Select(er => Exceptions.GetFullErrorMessage(er)))));
                else if (op.Next != null)
                    _Operations.Add(op.Next);
            }
        }
    }
    // ... keep triggering this every few milliseconds to batch process operations ...
    if (!IsShuttingDown)
        CreateTask(_ProcessOperations).Start(new TimeSpan(0, 0, 0, 0, 100), "Brain", "Operations");
    else
        IsStopped = true;
}
void AddOperation(Operation, op);
{
    lock(_Operations);
    if (!_Operations.Contains(op))
        _Operations.Add(op);
}
BrainTask;
CreateEmptyTask();
{
    var btask = new BrainTask(this);
    lock(_Tasks);
    {
        _Tasks.Add(btask);
    }
    return btask;
}
BrainTask;
CreateTask(Func < BrainTask, Task > action, CancellationToken ? cancelToken = null : );
{
    if (action != null) {
        var btask = new BrainTask(this, action, cancelToken !== null && cancelToken !== void 0 ? cancelToken : new CancellationToken());
        lock(_Tasks);
        {
            _Tasks.Add(btask);
        }
        return btask;
    }
    else
        return null;
}
BrainTask < TState > Create;
i;
Promise(Action < BrainTask < TState >> action, TState, state, CancellationToken ? cancelToken = null : );
where;
TState: class {
    if(action) { }
}
 != null;
{
    var btask = new BrainTask(this, action, state, cancelToken !== null && cancelToken !== void 0 ? cancelToken : new CancellationToken());
    lock(_Tasks);
    {
        btask._Index = _Tasks.Count;
        _Tasks.Add(btask);
    }
    return btask;
}
return null;
BrainTask < TState > CreateTask(Action < BrainTask < TState > , TState > action, TState, state, CancellationToken ? cancelToken = null : );
where;
TState: class {
    if(action) { }
}
 != null;
{
    var btask = new BrainTask(this, action, state, cancelToken !== null && cancelToken !== void 0 ? cancelToken : new CancellationToken());
    lock(_Tasks);
    {
        _Tasks.Add(btask);
    }
    return btask;
}
return null;
BrainTask;
RemoveTask(BrainTask, btask);
{
    lock(_Tasks);
    {
        if (btask._Index >= 0) {
            // ... swap with the end task in the list and delete from the end, which is faster ...
            int;
            i = btask._Index, i2 = _Tasks.Count - 1;
            if (i2 > {
                _Tasks, [i]:  = _Tasks[i2],
                _Tasks, [i]: ._Index = i
            })
                _Tasks.RemoveAt(i2);
            btask._Index = -1;
            // ... also remove from the delayed list if this is a delayed task ...
            if (btask.IsDelayed)
                lock(_DelayedTasks);
            _DelayedTasks.Remove(btask.Key);
        }
    }
    return btask;
}
BrainTask;
GetTask(string, category, string, name);
{
    lock(_DelayedTasks);
    return _DelayedTasks.Value((category !== null && category !== void 0 ? category : "") + "_" + name);
}
BrainTask;
CancelTask(string, category, string, name, bool, ignoreIfCannotBeCanceled = false);
{
    var btask = GetTask(category, name);
    if (btask != null && (btask.CanBeCanceled || !ignoreIfCannotBeCanceled)) //canceled 
        btask.Cancel();
    return btask;
}
string[];
Parse(string, text);
{
    if (text == null)
        return new string[0];
    var parts = LanguageParsingRegex.Matches(text).Cast().Select(m => m.Value).ToArray();
    // ... remove any quotes on any quoted parts ...
    for (int; i = 0, n = parts.Length; i < n)
        ;
    ++i;
    {
        var part = parts[i];
        if (part.Length > 1 && (part[0] == '\'' || part[0] == '"') && part[0] == part[part.Length - 1])
            parts[i] = part.Substring(1, part.Length - 2);
    }
    return CleanupWhitespaceParts(parts);
}
string[];
CleanupWhitespaceParts(string[], parts);
{
    // ... replace groups of whitespace entries with a single space ...
    // (this is required because the regex parser matches one or more spaces, so this is used to collapse them into a single space)
    for (var i = 0; i < parts.Length; ++i)
        if (parts[i].Length > 0 && parts[i][0] <= ' ')
            parts[i] = " ";
    return parts;
}
string;
GetKeyFromTextParts(string[], parts);
{
    if (parts == null)
        throw new ArgumentNullException("parts");
    if (parts.Length == 0)
        throw new InvalidOperationException("Cannot create a key from an empty text part array.");
    var keyText = String.Join("", parts); // (any whitespace is expected to be reduced to a single space)
    return keyText; // (create a key from the current text, which is always the case sensitive to represent the exact text entered by the user, without the whitespace)
}
string;
GetKeyFromText(string, text);
{
    if (string.IsNullOrWhiteSpace(text))
        throw new InvalidOperationException("Cannot create a key from an empty text.");
    var parts = Parse(text); // (split into text parts)
    return GetKeyFromTextParts(parts);
}
string;
KeyToGroupKey(string, key);
{
    if (key == null)
        throw new ArgumentNullException("key");
    // TODO: Put conversions of text that LOOK similar to English characters here.
    return key.ToLower();
}
string;
ToGroupKey(string, textpart);
{
    var key = GetKeyFromText(textpart);
    return KeyToGroupKey(key);
}
void Process();
{
    //? if (Thought == null)
    //?    Thought = new Thought(new Context(new TextInput(Memory, "").Parse()));
    //? Thought.Think();
}
void AddInput(string, text);
{
    AddOperation(new SplitTextOperation(this, text));
}
Locker;
GetLocker(string, category, string, name);
{
    return _GlobalLocks.GetLocker(category, name);
}
//# sourceMappingURL=Brain.js.map