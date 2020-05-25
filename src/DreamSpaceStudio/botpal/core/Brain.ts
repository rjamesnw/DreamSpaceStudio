import Memory from "./Memory";
import { Worker } from "cluster";
import Response from "../core/Response";
import ITTSService from "../services/tts/ITTSService";
import BrainTask from "./BrainTask";
import Operation from "./Operation";
import { DefaultTTSService } from "../services/tts/TTSService";
import Concept, { conceptTypes } from "./Concept";
import Match from "./Match";

export interface ResponseHandler { (brain: Brain, response: Response): Promise<void>; }

export class Thread {
    target: Worker | typeof globalThis;
}

/** The brain is the whole system that observes, evaluates, and decides what to do based on user inputs. */
export default class Brain {
    // --------------------------------------------------------------------------------------------------------------------

    languageParsingRegex = new RegExp("\".*?\"|'.*?'|[A-Za-z']+|[0-9]+|\\s+|.", 'gmi');

    /**
     *  The memory instance, which also contains the core dictionary for quick lookups.
    */
    readonly memory: Memory;

    /**
     *  A Text-To-Speech plugin object to use when calling "Brain.Say()".
     *  If null, upon calling the method, the default "Ivona" TTS service is used.
    */
    ttsService: ITTSService;

    //? public Thought Thought; // (this should never be null when a brain is loaded, as thoughts are historical; otherwise this is a brand new brain, and this can be null)

    protected _tasks: BrainTask[] = [];
    protected _delayedTasks = new Map<string, BrainTask>();

    /**
     *  The thread that the brain instance was created on.  This is always assumed as the main thread, and helps with dispatching
     *  events to the host, preventing the need for the host to handle dispatching calls to it's own main thread.
    */
    readonly _mainThread: Thread;

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
     *  Note: THIS IS CALLED IN A DIFFERENT THREAD. For many UI frameworks you most likely need to execute responses
     *  on the MAIN thread.
    */
    response: ResponseHandler; //event

    /** Make the bot respond with some text.  Keep in mind this simply pushes a response to the listening host, and the bot will not know about it. */
    async doResponse(response: Response | string): Promise {
        if (typeof response == 'string')
            response = new Response(response);

        if (this.response != null)
            await this.response.call(this, response); // (called directly from this thread as a last resort)
    }

    async say(text: string, voiceCode: string = null): Promise {
        if (this.ttsService == null)
            this.ttsService = new DefaultTTSService();

        await this.ttsService.Say(text, voiceCode);
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  The main worker that contains the main bot instance.  This allows the Brain to synchronize events in context with the
     *  main thread. If not specified, then the system looks for 'onmessage' and 'postMessage' in the global scope. If found,
     *  it will assume to be inside a worker, then it will set this to the global scope. If not found, then it will assume
     *  to be the main bot instance.
     *  If a main bot instance is moved to a worker instead, then this will no longer work, so this provides a way to connect
     *  all other workers to the main worker.
     */
    _mainWorker: Worker;

    /**
     *  Creates a new brain.
     * @param configureConcepts If true (default), then all concepts defined in this assembly are added to the brain.
     */
    constructor(configureConcepts = true) {
        this.memory = new Memory(this);

        if (configureConcepts)
            this.configureDefaultConcepts();

        var task = this._processOperations(null);
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Concepts are registered here as singletons so they can be referenced by other concepts.
     *  This is required so that each concept can register and expose the words it recognizes,
     *  complete with lexical details about the word (or text/phrase).
    */
    readonly _Concepts = new Map<IType<Concept>, Concept>();
    get Concepts(): Iterable<Concept> { return this._Concepts.values(); }

    readonly ConceptHandlerLoadErrors: Exception[] = []; // (one place for all concepts to log errors on registration - the UI should display this on first load)
    // TODO: Consider adding this as something the bot should ask (and remember): "There was a problem loading some concepts."

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Scans the current assembly for supported concepts and loads an instance of each one into the brain.
    */
    configureDefaultConcepts() {
        for (var conceptType of conceptTypes) {
            // ... iterate over the concept methods and store them for text matching later ...
            var conceptInstance = new conceptType(this);
            this._Concepts.set(conceptType, conceptInstance);
            conceptInstance.RegisterHandlers();
        }

        // ... let all concepts know the core concepts are loaded and ready ...

        for (var conceptInstance of this._Concepts.values())
            conceptInstance['onAfterAllRegistered']();
    }

    /** Returns a registered concept singleton. 
     * The most common use is to get a reference to the words that a concept registers.
     */
    getConcept<T extends Concept>(type: IType<T>): T { return <T>this._Concepts.get(type); }

    ///**
    //* Registers a concept for given text to watch for, and also creates and returns the dictionary word that will be associated with the watched text.
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
    // *  Find and return an array of concepts that match the given text part.
    // *  The 'textpart' text is normalized as needed to return a list of concepts the seem to match the visual look of the text, and not necessarily the specific characters themselves.
    //*/
    //public Concept[] GetConcepts(string textpart)
    //{
    //    var grpKey = TextPart.ToGroupKey(textpart);
    //    var concepts = _Concepts.Value(grpKey);
    //    return concepts.ToArray();
    //}

    // --------------------------------------------------------------------------------------------------------------------

    findConceptContexts(text: string, threshold = 0.8): Match<ConceptContext>[] {
        var dicItems = threshold == 1 ? // (if 'threshold' is 1.0 then do a similar [near exact] match [using group keys], otherwise find close partial matches instead.
            this.memory.dictionary.findSimilarEntries(Memory.Brain.ToGroupKey(text)).SelectMany(i => i.ConceptContexts.Select(c => new Match<ConceptContext>(c, 1.0)))
            : this.memory.dictionary.findMatchingEntries(text, threshold).SelectMany(m => m.Item.ConceptContexts.Select(c => new Match<ConceptContext>(c, m.Score)));
        return dicItems.ToArray();
    }

    // --------------------------------------------------------------------------------------------------------------------

    async stop(wait = true) {
        this.#_isShuttingDown = true;
        if (wait) {
            var tasks = this._tasks.map(t => { t.promise.continueUncompleted(); return t.promise; });
            await Promise.all(tasks);
        }
    }

    // --------------------------------------------------------------------------------------------------------------------

    async  _processOperations(btask: BrainTask) {
        if (btask != null) {
            var ops: Operation[] = this.#_operations; // (since the list may update, get a snapshot of the list as it is now)
            var op: Operation;

            // TODO: Get time elapsed to break out in case an operation takes too long so we can abort and until the next time (to reduce CPU usage). 

            for (var i = 0, n = ops.length; i < n && !this.#_isShuttingDown; ++i) {
                op = ops[i];

                var completed = await op.Execute(btask);

                if (completed)
                    this.#_operations.remove(op);

                if (op.IsCompletedWithErrors)
                    await this.doResponse(new Response("Hmmm. Sorry, it looks like I had an internal error with one of my operations. Please contact support and pass along the following details.", null, string.Join(Environment.NewLine, op.Errors.Select(er => Exceptions.GetFullErrorMessage(er)))));
                else if (op.Next != null)
                    this.#_operations.push(op.Next);
            }
        }

        // ... keep triggering this every few milliseconds to batch process operations ...

        if (!this.#_isShuttingDown)
            this.createTask(this._processOperations).start(new DS.TimeSpan(0, 0, 0, 0, 100), "Brain", "Operations");
        else
            this.#_isStopped = true;
    }

    addOperation(op: Operation) {
        if (this.#_operations.indexOf(op) < 0)
            this.#_operations.push(op);
    }

    // --------------------------------------------------------------------------------------------------------------------

    ///**
    // *  Returns a task that completes immediately when started.
    // *  It is used when there is nothing to do, but following tasks may also become added as part of normal operations.
    //*/
    //x CreateEmptyTask(): BrainTask {
    //    var btask = new BrainTask(this, DS.noop);
    //    this._Tasks.push(btask);
    //    return btask;
    //}

    /**
     *  Runs the given action as another task, which may be another thread.
    */
    createTask<TState = any>(action: Func1<BrainTask<TState>, Promise>, state?: TState): BrainTask<TState> {
        if (action != null) {
            var btask = new BrainTask(this, action);
            (<Writeable<BrainTask>>btask)._index = this._tasks.length;
            this._tasks.push(btask);
            return btask;
        }
        else return null;
    }

    /**
     *  Remove a given task.  This is called automatically during task cleanup after a task completes.
    */
    /// <param name="btask">The task to remove.  The task is not stopped, only removed from the brain's task list.</param>
    removeTask(btask: BrainTask): BrainTask {
        if (btask._index >= 0) {
            // ... swap with the end task in the list and delete from the end, which is faster ...
            var i = btask._index, i2 = this._tasks.length - 1;
            if (i2 > i) {
                this._tasks[i] = this._tasks[i2];
                (<Writeable<BrainTask>>this._tasks[i])._index = -1;
            }
            this._tasks.removeAt(i2);
            (<Writeable<BrainTask>>btask)._index = -1;
            // ... also remove from the delayed list if this is a delayed task ...
            if (btask.isDelayed)
                this._delayedTasks.delete(btask.key);
        }
        return btask;
    }

    /**
     *  Find and return a task given its category and name.
     */
    GetTask(category: string, name: string): BrainTask {
        return this._delayedTasks.get((category ?? "") + "_" + name);
    }

    /**
     *  Find and cancel a task given its category and name. If found, the task is also returned.
    */
    /// <param name="ignoreIfCannotBeCanceled">If true, and the task cannot be canceled, the request is ignored, otherwise an exception is thrown.</param>
    CancelTask(category: string, name: string, ignoreIfCannotBeCanceled = false): BrainTask {
        var btask = this.GetTask(category, name);
        if (btask != null && (btask.canBeCanceled || !ignoreIfCannotBeCanceled)) //canceled 
            btask.cancel();
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
    parse(text: string): string[] {
        text = DS.StringUtils.toString(text);
        if (!text) return [];

        var parts = text.match(this.languageParsingRegex);

        // ... remove any quotes on any quoted parts ...

        for (var i = 0, n = parts?.length ?? 0; i < n; ++i) {
            var part = parts[i];
            if (part.length > 1 && (part[0] == '\'' || part[0] == '"') && part[0] == part[part.length - 1])
                parts[i] = part.substr(1, part.length - 2);
        }

        return this.cleanupWhitespaceParts(parts);
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Replaces any whitespace entries with a single space character.
     *  @returns The same parts array passed in.
    */
    cleanupWhitespaceParts(parts: string[]): string[] {
        // ... replace groups of whitespace entries with a single space ...
        // (this is required because the regex parser matches one or more spaces, so this is used to collapse them into a single space)
        for (var i = 0; i < parts.length; ++i)
            if (parts[i].length > 0 && parts[i][0] <= ' ') // (the last check is fine, since only groups of spaces exist without anything else)
                parts[i] = " ";
        return parts;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /// <param name="parts"></param>
    /**
     * Returns a valid key based on given text.
     * This is used for looking up text from dictionaries/indexes using text as the key.
     * @param {string[]} parts The text parts split into word/number/symbol/etc groups using a language parser.  Any grouped
     * whitespace entries in the array should already be replaced by a SINGLE 'space' character.
     * @returns
     */
    getKeyFromTextParts(parts: string[]): string {
        if (!parts)
            throw DS.Exception.argumentRequired("Brain.getKeyFromTextParts()", "parts");
        if (parts.length == 0)
            throw DS.Exception.error("Brain.getKeyFromTextParts()", "Cannot create a key from an empty text part array.");
        var keyText = parts.join(""); // (any whitespace is expected to be reduced to a single space)
        return keyText; // (create a key from the current text, which is always the case sensitive to represent the exact text entered by the user, without the whitespace)
    }

    /**
     *  Returns a valid key based on given text.
     *  This is used for looking up text from dictionaries/indexes using text as the key.
     */
    getKeyFromText(text: string): string {
        if (DS.StringUtils.isEmptyOrWhitespace(text))
            throw DS.Exception.invalidArgument("Brain.getKeyFromText()", "Cannot create a key from an empty text.");
        var parts = this.parse(text); // (split into text parts)
        return this.getKeyFromTextParts(parts);
    }

    /**
     *  Converts a normal text key (i.e. from 'GetKeyFromTextParts()', or '{TextParet}.Key') to a more *generic* grouping key.
     */
    keyToGroupKey(key: string): string {
        if (!key)
            throw DS.Exception.argumentRequired("Brain.getKeyFromTextParts()", "key");
        // TODO: Put conversions of text that LOOK similar to English characters here.
        return key.toLowerCase();
    }

    /**
     *  Converts a text part, and returns a generic grouping key that can be used to search for similar text.
     */
    toGroupKey(textpart: string): string {
        var key = this.getKeyFromText(textpart);
        return this.keyToGroupKey(key);
    }

    // --------------------------------------------------------------------------------------------------------------------

    process() {
        //? if (Thought == null)
        //?    Thought = new Thought(new Context(new TextInput(Memory, "").Parse()));
        //? Thought.Think();
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** A simple registry of concepts that will be called when text input is given. */
    textInputHandlers: DS.Delegate<Concept, Action<string>>[] = [];

    addInput(text: string) {
        for (var handler of this.textInputHandlers)
            try {
                handler.call(text);
            }
            catch (ex) { DS.error('Brain.addInput()', DS.getErrorMessage(ex)); }
    }

    // --------------------------------------------------------------------------------------------------------------------
}
