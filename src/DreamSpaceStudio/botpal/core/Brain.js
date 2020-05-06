"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __operations, __isShuttingDown, __isStopped;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thread = void 0;
const Memory_1 = require("./Memory");
const Response_1 = require("../core/Response");
const BrainTask_1 = require("./BrainTask");
const Operation_1 = require("./Operation");
const TTSService_1 = require("../services/tts/TTSService");
const Concept_1 = require("./Concept");
class Thread {
}
exports.Thread = Thread;
/** The brain is the whole system that observes, evaluates, and decides what to do based on user inputs. */
class Brain {
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Creates a new brain.
    */
    /// <param name="synchronizationContext">A SynchronizationContext instance to use to allow the Brain to synchronize events in context with the main thread.
    /// This should be available for both WinForms and WPF.  If not specified, and it cannot be detected, the events will be called directly from worker threads.
    /// <para>Note: Auto-detection reads from 'SynchronizationContext.Current', which means, if used, the constructor must be called on the main UI thread.</para></param>
    /// <param name="configureConcepts">If true (default), then all concepts defined in this assembly are added to the brain.</param>
    constructor(synchronizationContext = null, configureConcepts = true) {
        // --------------------------------------------------------------------------------------------------------------------
        this.LanguageParsingRegex = new RegExp("\".*?\"|'.*?'|[A-Za-z']+|[0-9]+|\\s+|.", 'm');
        //? public Thought Thought; // (this should never be null when a brain is loaded, as thoughts are historical; otherwise this is a brand new brain, and this can be null)
        this._Tasks = [];
        this._DelayedTasks = new Map();
        __operations.set(this, []);
        __isShuttingDown.set(this, void 0);
        __isStopped.set(this, void 0);
        // --------------------------------------------------------------------------------------------------------------------
        /**
         *  Concepts are registered here as singletons so they can be referenced by other concepts.
         *  This is required so that each concept can register and expose the words it recognizes,
         *  complete with lexical details about the word (or text/phrase).
        */
        this._Concepts = new Map();
        this.ConceptHandlerLoadErrors = new List(); // (one place for all concepts to log errors on registration - the UI should display this on first load)
        this._MainThread = Thread.CurrentThread;
        this._SynchronizationContext = synchronizationContext !== null && synchronizationContext !== void 0 ? synchronizationContext : SynchronizationContext.Current; // (supported both in WinForms AND WPF!)
        this.Memory = new Memory_1.default(this);
        if (configureConcepts)
            this.ConfigureDefaultConcepts();
        var task = this._ProcessOperations(null);
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Root operations to run in parallel; however, each operation can have chained operations, which are sequential.
     *  <para>Note: because the operations are executed in a thread, you must used the locker returned from 'OperationsLocker'.
     *  If any operation instance is in a "completed" state however, no locking is required.</para>
    */
    get Operations() { return __classPrivateFieldGet(this, __operations); }
    /**
     *  Set to true internally when 'Stop()' is called.
    */
    get IsShuttingDown() { return __classPrivateFieldGet(this, __isShuttingDown); }
    /**
     *  Set to true internally after 'Stop()' is called and the brain has completed the shutdown process.
    */
    get IsStopped() { return __classPrivateFieldGet(this, __isStopped); }
    /** Make the bot respond with some text.  Keep in mind this simply pushes a response to the listening host, and the bot will not know about it. */
    async DoResponse(response) {
        if (typeof response == 'string')
            response = new Response_1.default(response);
        if (this.Response != null)
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
    async Say(text, voiceCode = null) {
        if (this.TTSService == null)
            this.TTSService = new TTSService_1.DefaultTTSService();
        await this.TTSService.Say(text, voiceCode);
    }
    get Concepts() { return this._Concepts.Values; }
    ConfigureDefaultConcepts() {
        var conceptTypes = (from), t;
         in Assembly.GetExecutingAssembly().GetTypes();
        where;
        t.IsClass && !t.IsGenericType && !t.IsAbstract && t.IsSubclassOf(typeof (Concept_1.default));
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
            Concept_1.default;
            conceptInstance = (Concept_1.default);
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
}
exports.default = Brain;
__operations = new WeakMap(), __isShuttingDown = new WeakMap(), __isStopped = new WeakMap();
(T);
_Concepts.Value(typeof (T));
///**
    *
// Registers a concept for given text to watch for, and also creates and returns the dictionary word that will be associated with the watched text.
    //*/
    ///// <param name="concept">The concept to register.</param>
    ///// <param name="textpart">The text that will trigger the concept.</param>
    ///// <param name="pos">The part of speech for the text (usually for words).</param>
    ///// <param name="tense">The tense for the text (usually for words).</param>
    ///// <param name="plurality">The plurality of the text (usually for words).</param>
    //internal DictionaryItem _RegisterConcept(Concept concept, string textpart, PartOfSpeech pos, TenseTypes tense = TenseTypes.NA, Plurality plurality = Plurality.NA)
    //{
    //    string grpKey = TextPart.ToGroupKey(textpart);
    //    DictionaryItem dicItem = null;
    //    if (!string.IsNullOrEmpty(textpart))
    //    {
    //        dicItem = FindEntry(grpKey, pos, tense, plurality) ?? AddTextPart(textpart, pos, tense, plurality);
    //        if (!dicItem._Concepts.Contains(concept))
    //            dicItem._Concepts.Add(concept);
    //    }
    //    var concepts = _Concepts.Value(grpKey);
    //    if (concepts == null)
    //    {
    //        _Concepts[grpKey] = concepts = new List<Concept>();
    //        concepts.Add(concept);
    //        dicItem?._Concepts.Add(concept);
    //    }
    //    else if (!concepts.Contains(concept))
    //    {
    //        concepts.Add(concept);
    //        dicItem?._Concepts.Add(concept);
    //    }
    //    return dicItem;
    //}
    ///**
    * // Find and return an array of concepts that match the given text part.
        // *  The 'textpart' text is normalized as needed to return a list of concepts the seem to match the visual look of the text, and not necessarily the specific characters themselves.
        //*/
        //public Concept[] GetConcepts(string textpart)
        //{
        //    var grpKey = TextPart.ToGroupKey(textpart);
        //    var concepts = _Concepts.Value(grpKey);
        //    return concepts.ToArray();
        //}
        // --------------------------------------------------------------------------------------------------------------------
        public;
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
_ProcessOperations(BrainTask_1.default, btask);
{
    if (btask != null) {
        Operation_1.default[];
        ops;
        Operation_1.default;
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
void AddOperation(Operation_1.default, op);
{
    lock(_Operations);
    if (!_Operations.Contains(op))
        _Operations.Add(op);
}
BrainTask_1.default;
CreateEmptyTask();
{
    var btask = new BrainTask_1.default(this);
    lock(_Tasks);
    {
        _Tasks.Add(btask);
    }
    return btask;
}
BrainTask_1.default;
CreateTask(Func < BrainTask_1.default, Task > action, CancellationToken ? cancelToken = null : );
{
    if (action != null) {
        var btask = new BrainTask_1.default(this, action, cancelToken !== null && cancelToken !== void 0 ? cancelToken : new CancellationToken());
        lock(_Tasks);
        {
            _Tasks.Add(btask);
        }
        return btask;
    }
    else
        return null;
}
BrainTask_1.default < TState > Create;
i;
Promise(Action < BrainTask_1.default < TState >> action, TState, state, CancellationToken ? cancelToken = null : );
where;
TState: class {
    if(action) { }
}
 != null;
{
    var btask = new BrainTask_1.default(this, action, state, cancelToken !== null && cancelToken !== void 0 ? cancelToken : new CancellationToken());
    lock(_Tasks);
    {
        btask._Index = _Tasks.Count;
        _Tasks.Add(btask);
    }
    return btask;
}
return null;
BrainTask_1.default < TState > CreateTask(Action < BrainTask_1.default < TState > , TState > action, TState, state, CancellationToken ? cancelToken = null : );
where;
TState: class {
    if(action) { }
}
 != null;
{
    var btask = new BrainTask_1.default(this, action, state, cancelToken !== null && cancelToken !== void 0 ? cancelToken : new CancellationToken());
    lock(_Tasks);
    {
        _Tasks.Add(btask);
    }
    return btask;
}
return null;
BrainTask_1.default;
RemoveTask(BrainTask_1.default, btask);
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
            if (btask.isDelayed)
                lock(_DelayedTasks);
            _DelayedTasks.Remove(btask.key);
        }
    }
    return btask;
}
BrainTask_1.default;
GetTask(string, category, string, name);
{
    lock(_DelayedTasks);
    return _DelayedTasks.Value((category !== null && category !== void 0 ? category : "") + "_" + name);
}
BrainTask_1.default;
CancelTask(string, category, string, name, bool, ignoreIfCannotBeCanceled = false);
{
    var btask = GetTask(category, name);
    if (btask != null && (btask.canBeCanceled || !ignoreIfCannotBeCanceled)) //canceled 
        btask.cancel();
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