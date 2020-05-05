import Memory from "./Memory";
import { Worker } from "cluster";
import Response from "../core/Response";
import ITTSService from "../services/tts/ITTSService";
import BrainTask from "./Tasks";
import Operation from "./Operation";

export interface ResponseHandler { (brain: Brain, response: Response): Promise<void>; }

export class Thread {
    target: Worker | typeof globalThis;
}

/** The brain is the whole system that observes, evaluates, and decides what to do based on user inputs. */
export default class Brain {
    // --------------------------------------------------------------------------------------------------------------------

    LanguageParsingRegex = new RegExp("\".*?\"|'.*?'|[A-Za-z']+|[0-9]+|\\s+|.", 'm');

    /**
     *  The memory instance, which also contains the core dictionary for quick lookups.
    */
    readonly Memory: Memory;

    /**
     *  A Text-To-Speech plugin object to use when calling "Brain.Say()".
     *  If null, upon calling the method, the default "Ivona" TTS service is used.
    */
    TTSService: ITTSService;

    //? public Thought Thought; // (this should never be null when a brain is loaded, as thoughts are historical; otherwise this is a brand new brain, and this can be null)

    protected _Tasks: BrainTask[] = [];
    protected _DelayedTasks = new Map<string, BrainTask>();

    /**
     *  The thread that the brain instance was created on.  This is always assumed as the main thread, and helps with dispatching
     *  events to the host, preventing the need for the host to handle dispatching calls to it's own main thread.
    */
    readonly _MainThread: Thread;

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Root operations to run in parallel; however, each operation can have chained operations, which are sequential.
     *  <para>Note: because the operations are executed in a thread, you must used the locker returned from 'OperationsLocker'.
     *  If any operation instance is in a "completed" state however, no locking is required.</para>
    */
    get Operations(): Operation[] { return this.#_operations; }
    #_operations: Operation[] = [];

    /**
     *  Set to true internally when 'Stop()' is called.
    */
    get IsShuttingDown() { return this.#_isShuttingDown; }
    #_isShuttingDown: boolean;

    /**
     *  Set to true internally after 'Stop()' is called and the brain has completed the shutdown process.
    */
    get IsStopped() { return this.#_isStopped; }
    #_isStopped: boolean;

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  The response event is a hook for host handlers to receive output responses from previously processed user input.
     *  <para>Note: THIS IS CALLED IN A DIFFERENT THREAD. For many UI frameworks you most likely need to execute responses
     *  on the MAIN thread. Make sure on the host side you use either "Invoke()" or "BeingInvoke()", or similar, on your
     *  WinForms control, or WPF "Dispatcher" reference.</para>
    */
    Response: ResponseHandler; //event

    /** Make the bot respond with some text.  Keep in mind this simply pushes a response to the listening host, and the bot will not know about it. */
    public virtual async Task DoResponse(Response response) {
        if (Response != null)
            if (_SynchronizationContext != null) {
                var taskSource = new TaskCompletionSource<bool>();
                _SynchronizationContext.Send(async _ => { await Response.Invoke(this, response); taskSource.SetResult(true); }, null);
                await taskSource.Task;
            }
            else
                await Response.Invoke(this, response); // (called directly from this thread as a last resort)

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
    public virtual Task DoResponse(string response) => DoResponse(new Response(response));

        public async Task Say(string text, string voiceCode = null)
{
    if (TTSService == null)
        TTSService = new DefaultTTSService();

    await TTSService.Say(text, voiceCode);
}

// --------------------------------------------------------------------------------------------------------------------

/**
 *  Creates a new brain.
*/
/// <param name="synchronizationContext">A SynchronizationContext instance to use to allow the Brain to synchronize events in context with the main thread.
/// This should be available for both WinForms and WPF.  If not specified, and it cannot be detected, the events will be called directly from worker threads.
/// <para>Note: Auto-detection reads from 'SynchronizationContext.Current', which means, if used, the constructor must be called on the main UI thread.</para></param>
/// <param name="configureConcepts">If true (default), then all concepts defined in this assembly are added to the brain.</param>
constructor(synchronizationContext : Worker = null, configureConcepts = true)
{
    _MainThread = Thread.CurrentThread;
    _SynchronizationContext = synchronizationContext ?? SynchronizationContext.Current; // (supported both in WinForms AND WPF!)

    Memory = new Memory(this);

    if (configureConcepts)
        ConfigureDefaultConcepts();

    var task = _ProcessOperations(null);
}

        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  Concepts are registered here as singletons so they can be referenced by other concepts.
         *  This is required so that each concept can register and expose the words it recognizes,
         *  complete with lexical details about the word (or text/phrase).
        */
        readonly Dictionary < Type, Concept > _Concepts = new Dictionary<Type, Concept>();
        public IEnumerable < Concept > Concepts => _Concepts.Values;

        public readonly List < Exception > ConceptHandlerLoadErrors = new List<Exception>(); // (one place for all concepts to log errors on registration - the UI should display this on first load)
        // TODO: Consider adding this as something the bot should ask (and remember): "There was a problem loading some concepts."

        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  Scans the current assembly for supported concepts and loads an instance of each one into the brain.
        */
        public void ConfigureDefaultConcepts()
{
    var conceptTypes = (from t in Assembly.GetExecutingAssembly().GetTypes() where t.IsClass && !t.IsGenericType && !t.IsAbstract && t.IsSubclassOf(typeof (Concept)) select t);

    foreach(var concept in conceptTypes)
    {
        var conceptAttrib = concept.GetCustomAttribute<ConceptAttribute>();
        if (conceptAttrib != null && !conceptAttrib.Enabled) continue;
        // ... iterate over the concept methods and store them for text matching later ...
        Concept conceptInstance = (Concept)Activator.CreateInstance(concept, this);
        _Concepts[concept] = conceptInstance;
        conceptInstance.RegisterHandlers();
    }

    // ... let all concepts know the core concepts are loaded and ready ...

    foreach(var concept in _Concepts.Values)
    concept.OnAfterAllRegistered();
}

        /** Returns a registered concept singleton. 
         * The most common use is to get a reference to the words that a concept registers.
         */
        public T GetConcept<T>() where T: Concept => (T)_Concepts.Value(typeof (T));

        ///**
         * // Registers a concept for given text to watch for, and also creates and returns the dictionary word that will be associated with the watched text.
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

    public Match < ConceptContext > [] FindConceptContexts(string text, double threshold = 0.8)
{
    var dicItems = threshold == 1 ? // (if 'threshold' is 1.0 then do a similar [near exact] match [using group keys], otherwise find close partial matches instead.
        Memory.Dictionary.FindSimilarEntries(Memory.Brain.ToGroupKey(text)).SelectMany(i => i.ConceptContexts.Select(c => new Match<ConceptContext>(c, 1.0)))
        : Memory.Dictionary.FindMatchingEntries(text, threshold).SelectMany(m => m.Item.ConceptContexts.Select(c => new Match<ConceptContext>(c, m.Score)));
    return dicItems.ToArray();
}

        // --------------------------------------------------------------------------------------------------------------------

        public void Stop(bool wait = true)
{
    IsShuttingDown = true;
    if (wait) {
        Task[] tasks;
        lock(_Tasks) tasks = _Tasks.Select(t => t.Task).ToArray();
        Task.WaitAll(tasks, 1000);
    }
}

// --------------------------------------------------------------------------------------------------------------------

async Task _ProcessOperations(BrainTask btask)
{
    if (btask != null) {
        Operation[] ops;
        Operation op;

        using(OperationsLocker.WriteLock())
        {
            ops = _Operations.ToArray(); // (since the list may update, get a snapshot of the list as it is now)
        }

        // TODO: Get time elapsed to break out in case an operation takes too long so we can abort and until the next time (to reduce CPU usage). 

        for (int i = 0, n = ops.Length; i < n && !IsShuttingDown; ++i)
        {
            op = ops[i];

            var completed = await op.Execute(btask);

            using(OperationsLocker.WriteLock())
            {
                if (completed)
                    _Operations.Remove(op);

                if (op.IsCompletedWithErrors)
                    await DoResponse(new Response("Hmmm. Sorry, it looks like I had an internal error with one of my operations. Please contact support and pass along the following details.", null, string.Join(Environment.NewLine, op.Errors.Select(er => Exceptions.GetFullErrorMessage(er)))));
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

        public void AddOperation(Operation op)
{
    lock(_Operations)
    if (!_Operations.Contains(op))
        _Operations.Add(op);
}

        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  Returns a task that completes immediately when started.
         *  It is used when there is nothing to do, but following tasks may also become added as part of normal operations.
        */
        public BrainTask CreateEmptyTask()
{
    var btask = new BrainTask(this);
    lock(_Tasks)
    {
        _Tasks.Add(btask);
    }
    return btask;
}

        /**
         *  Runs the given action as another task, which may be another thread.
        */
        public BrainTask CreateTask(Func < BrainTask, Task > action, CancellationToken ? cancelToken = null)
{
    if (action != null) {
        var btask = new BrainTask(this, action, cancelToken ?? new CancellationToken());
        lock(_Tasks)
        {
            _Tasks.Add(btask);
        }
        return btask;
    }
    else return null;
}

        /**
         *  Runs the given action as another task, which may be another thread.
        */
        public BrainTask < TState > Create i): Promise<TState>(Action < BrainTask < TState >> action, TState state, CancellationToken ? cancelToken = null) where TState: class {
    if(action != null)
{
    var btask = new BrainTask<TState>(this, action, state, cancelToken ?? new CancellationToken());
    lock(_Tasks)
    {
        btask._Index = _Tasks.Count;
        _Tasks.Add(btask);
    }
    return btask;
}
            else return null;
        }

        /**
         *  Runs the given action as another task, which may be another thread.
        */
        public BrainTask < TState > CreateTask<TState>(Action < BrainTask < TState >, TState > action, TState state, CancellationToken ? cancelToken = null) where TState: class {
    if(action != null)
{
    var btask = new BrainTask<TState>(this, action, state, cancelToken ?? new CancellationToken());
    lock(_Tasks)
    {
        _Tasks.Add(btask);
    }
    return btask;
}
            else return null;
        }

        /**
         *  Remove a given task.  This is called automatically during task cleanup after a task completes.
        */
        /// <param name="btask">The task to remove.  The task is not stopped, only removed from the brain's task list.</param>
        public BrainTask RemoveTask(BrainTask btask)
{
    lock(_Tasks)
    {
        if (btask._Index >= 0) {
            // ... swap with the end task in the list and delete from the end, which is faster ...
            int i = btask._Index, i2 = _Tasks.Count - 1;
            if (i2 > {
                _Tasks[i] = _Tasks[i2];
                _Tasks[i]._Index = i;
            }
            _Tasks.RemoveAt(i2);
            btask._Index = -1;
            // ... also remove from the delayed list if this is a delayed task ...
            if (btask.IsDelayed)
                lock(_DelayedTasks)
            _DelayedTasks.Remove(btask.Key);
        }
    }
    return btask;
}

        /**
         *  Find and return a task given its category and name.
        */
        public BrainTask GetTask(string category, string name)
{
    lock(_DelayedTasks) return _DelayedTasks.Value((category ?? "") + "_" + name);
}

        /**
         *  Find and cancel a task given its category and name. If found, the task is also returned.
        */
        /// <param name="ignoreIfCannotBeCanceled">If true, and the task cannot be canceled, the request is ignored, otherwise an exception is thrown.</param>
        public BrainTask CancelTask(string category, string name, bool ignoreIfCannotBeCanceled = false)
{
    var btask = GetTask(category, name);
    if (btask != null && (btask.CanBeCanceled || !ignoreIfCannotBeCanceled)) //canceled 
        btask.Cancel();
    return btask;
}

        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  Parses a given input string.
         *  This method calls 'CleanupWhitespaceParts()' automatically.
        */
        /// <param name="text">The text to parse.</param>
        /// <param name="language">An optional language name used to override the default language.</param>
        /// <returns>The text parts split by the language regex.</returns>
        public string[] Parse(string text)
{
    if (text == null) return new string[0];

    var parts = LanguageParsingRegex.Matches(text).Cast<Match>().Select(m => m.Value).ToArray();

    // ... remove any quotes on any quoted parts ...

    for (int i = 0, n = parts.Length; i < n; ++i)
    {
        var part = parts[i];
        if (part.Length > 1 && (part[0] == '\'' || part[0] == '"') && part[0] == part[part.Length - 1])
            parts[i] = part.Substring(1, part.Length - 2);
    }

    return CleanupWhitespaceParts(parts);
}

        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  Replaces any whitespace entries with a single space character.
        */
        /// <returns>The same parts array passed in.</returns>
        public string[] CleanupWhitespaceParts(string[] parts)
{
    // ... replace groups of whitespace entries with a single space ...
    // (this is required because the regex parser matches one or more spaces, so this is used to collapse them into a single space)
    for (var i = 0; i < parts.Length; ++i)
        if (parts[i].Length > 0 && parts[i][0] <= ' ')
            parts[i] = " ";
    return parts;
}

        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  Returns a valid key based on given text.
         *  This is used for looking up text from dictionaries/indexes using text as the key.
        */
        /// <param name="parts">The text parts split into word/number/symbol/etc groups using a language parser.  Any grouped
        /// whitespace entries in the array should already be replaced by a SINGLE 'space' character.</param>
        /// <returns></returns>
        public string GetKeyFromTextParts(string[] parts)
{
    if (parts == null)
        throw new ArgumentNullException("parts");
    if (parts.Length == 0)
        throw new InvalidOperationException("Cannot create a key from an empty text part array.");
    var keyText = String.Join("", parts); // (any whitespace is expected to be reduced to a single space)
    return keyText; // (create a key from the current text, which is always the case sensitive to represent the exact text entered by the user, without the whitespace)
}

        /**
         *  Returns a valid key based on given text.
         *  This is used for looking up text from dictionaries/indexes using text as the key.
        */
        public string GetKeyFromText(string text)
{
    if (string.IsNullOrWhiteSpace(text))
        throw new InvalidOperationException("Cannot create a key from an empty text.");
    var parts = Parse(text); // (split into text parts)
    return GetKeyFromTextParts(parts);
}

        /**
         *  Converts a normal text key (i.e. from 'GetKeyFromTextParts()', or '{TextParet}.Key') to a more *generic* grouping key.
        */
        public string KeyToGroupKey(string key)
{
    if (key == null)
        throw new ArgumentNullException("key");
    // TODO: Put conversions of text that LOOK similar to English characters here.
    return key.ToLower();
}

        /**
         *  Converts a text part, and returns a generic grouping key that can be used to search for similar text.
        */
        public string ToGroupKey(string textpart)
{
    var key = GetKeyFromText(textpart);
    return KeyToGroupKey(key);
}

        // --------------------------------------------------------------------------------------------------------------------

        public void Process()
{
    //? if (Thought == null)
    //?    Thought = new Thought(new Context(new TextInput(Memory, "").Parse()));
    //? Thought.Think();
}

        // --------------------------------------------------------------------------------------------------------------------

        public void AddInput(string text)
{
    AddOperation(new SplitTextOperation(this, text));
}

        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  Returns a locker object that can be used to lock threaded operations on global data or resources (such as files, 
         *  DB access, external API calls, or even simply Brain or system properties, etc.). API call locks are very useful to
         *  allow multiple calls at once, but limiting how many "reads" can happen at once.
        */
        /// <param name="category">Category and name are both used to generate a key that represents the lock.</param>
        /// <param name="name">Category and name are both used to generate a key that represents the lock.</param>
        /// <returns>A disposable lock object.  The object should be disposed when finished with.</returns>
        public Locker GetLocker(string category, string name)
{
    return _GlobalLocks.GetLocker(category, name);
}

        // --------------------------------------------------------------------------------------------------------------------
    }
}
