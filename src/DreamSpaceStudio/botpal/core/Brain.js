"use strict";
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
var __operations, __isShuttingDown, __isStopped;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thread = void 0;
const Memory_1 = require("./Memory");
const Response_1 = require("../core/Response");
const BrainTask_1 = require("./BrainTask");
const TTSService_1 = require("../services/tts/TTSService");
const Concept_1 = require("./Concept");
class Thread {
}
exports.Thread = Thread;
/** The brain is the whole system that observes, evaluates, and decides what to do based on user inputs. */
class Brain {
    /**
     *  Creates a new brain.
     * @param configureConcepts If true (default), then all concepts defined in this assembly are added to the brain.
     */
    constructor(configureConcepts = true) {
        // --------------------------------------------------------------------------------------------------------------------
        this.languageParsingRegex = new RegExp("\".*?\"|'.*?'|[A-Za-z']+|[0-9]+|\\s+|.", 'gmi');
        //? public Thought Thought; // (this should never be null when a brain is loaded, as thoughts are historical; otherwise this is a brand new brain, and this can be null)
        this._tasks = [];
        this._delayedTasks = new Map();
        __operations.set(this, []);
        __isShuttingDown.set(this, void 0);
        __isStopped.set(this, void 0);
        // --------------------------------------------------------------------------------------------------------------------
        /**
         *  Concepts are registered here as singletons so they can be referenced by other concepts.
         *  This is required so that each concept can register and expose the words it recognizes,
         *  complete with lexical details about the word (or text/phrase).
        */
        this._concepts = new Map();
        this.conceptHandlerLoadErrors = []; // (one place for all concepts to log errors on registration - the UI should display this on first load)
        // --------------------------------------------------------------------------------------------------------------------
        /** A simple registry of concepts that will be called when text input is given. */
        this.textInputHandlers = [];
        this.memory = new Memory_1.default(this);
        if (configureConcepts)
            this.configureDefaultConcepts();
        var task = this._processOperations(null); // (trigger the process operations cycle)
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
    async doResponse(response) {
        if (typeof response == 'string')
            response = new Response_1.default(response);
        if (this.response != null)
            await this.response.call(this, response); // (called directly from this thread as a last resort)
    }
    async say(text, voiceCode = null) {
        if (this.ttsService == null)
            this.ttsService = new TTSService_1.DefaultTTSService();
        await this.ttsService.Say(text, voiceCode);
    }
    get concepts() { return this._concepts.values(); }
    // TODO: Consider adding this as something the bot should ask (and remember): "There was a problem loading some concepts."
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Scans the current assembly for supported concepts and loads an instance of each one into the brain.
    */
    configureDefaultConcepts() {
        for (var conceptType of Concept_1.conceptTypes) {
            // ... iterate over the concept methods and store them for text matching later ...
            var conceptInstance = new conceptType(this);
            this._concepts.set(conceptType, conceptInstance);
            conceptInstance.RegisterHandlers();
        }
        // ... let all concepts know the core concepts are loaded and ready ...
        for (var conceptInstance of this._concepts.values())
            conceptInstance['onAfterAllRegistered']();
    }
    /** Returns a registered concept singleton.
     * The most common use is to get a reference to the words that a concept registers.
     */
    getConcept(type) { return this._concepts.get(type); }
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
    //findConceptContexts(text: string, threshold = 0.8): Match<ConceptContext>[] {
    //    var dicItems = threshold == 1 ? // (if 'threshold' is 1.0 then do a similar [near exact] match [using group keys], otherwise find close partial matches instead.
    //        this.memory.dictionary.findSimilarEntriesByGroupKey(this.memory.brain.toGroupKey(text)).SelectMany(i => i.ConceptContexts.Select(c => new Match<ConceptContext>(c, 1.0)))
    //        : this.memory.dictionary.findMatchingEntries(text, threshold).SelectMany(m => m.Item.ConceptContexts.Select(c => new Match<ConceptContext>(c, m.Score)));
    //    return dicItems.ToArray();
    //}
    // --------------------------------------------------------------------------------------------------------------------
    async stop(wait = true) {
        __classPrivateFieldSet(this, __isShuttingDown, true);
        if (wait) {
            var tasks = this._tasks.map(t => { t.promise.continueUncompleted(); return t.promise; });
            await Promise.all(tasks);
        }
    }
    // --------------------------------------------------------------------------------------------------------------------
    async _processOperations(btask) {
        if (btask != null) {
            var ops = __classPrivateFieldGet(this, __operations); // (since the list may update, get a snapshot of the list as it is now)
            var op;
            // TODO: Get time elapsed to break out in case an operation takes too long so we can abort and until the next time (to reduce CPU usage). 
            for (var i = 0, n = ops.length; i < n && !__classPrivateFieldGet(this, __isShuttingDown); ++i) {
                op = ops[i];
                var completed = await op.execute(btask);
                if (completed)
                    __classPrivateFieldGet(this, __operations).remove(op);
                if (op.IsCompletedWithErrors) {
                    let errors = op.errors.map(ex => DS.getErrorMessage(ex)).join('\r\n');
                    await this.doResponse(new Response_1.default("Hmmm. Sorry, it looks like I had an internal error with one of my operations. Please contact support and pass along the following details.", null, errors));
                }
                else if (op.Next != null)
                    __classPrivateFieldGet(this, __operations).push(op.Next);
            }
        }
        // ... keep triggering this every few milliseconds to batch process operations ...
        if (!__classPrivateFieldGet(this, __isShuttingDown))
            this.createTask(this._processOperations).start(new DS.TimeSpan(0, 0, 0, 0, 100), "Brain", "Operations");
        else
            __classPrivateFieldSet(this, __isStopped, true);
    }
    addOperation(op) {
        if (__classPrivateFieldGet(this, __operations).indexOf(op) < 0)
            __classPrivateFieldGet(this, __operations).push(op);
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
    createTask(action, state) {
        if (action != null) {
            var btask = new BrainTask_1.default(this, action);
            btask._index = this._tasks.length;
            this._tasks.push(btask);
            return btask;
        }
        else
            return null;
    }
    /**
     *  Remove a given task.  This is called automatically during task cleanup after a task completes.
    */
    /// <param name="btask">The task to remove.  The task is not stopped, only removed from the brain's task list.</param>
    removeTask(btask) {
        if (btask._index >= 0) {
            // ... swap with the end task in the list and delete from the end, which is faster ...
            var i = btask._index, i2 = this._tasks.length - 1;
            if (i2 > i) {
                this._tasks[i] = this._tasks[i2];
                this._tasks[i]._index = -1;
            }
            this._tasks.removeAt(i2);
            btask._index = -1;
            // ... also remove from the delayed list if this is a delayed task ...
            if (btask.isDelayed)
                this._delayedTasks.delete(btask.key);
        }
        return btask;
    }
    /**
     *  Find and return a task given its category and name.
     */
    GetTask(category, name) {
        return this._delayedTasks.get((category !== null && category !== void 0 ? category : "") + "_" + name);
    }
    /**
     *  Find and cancel a task given its category and name. If found, the task is also returned.
    */
    /// <param name="ignoreIfCannotBeCanceled">If true, and the task cannot be canceled, the request is ignored, otherwise an exception is thrown.</param>
    CancelTask(category, name, ignoreIfCannotBeCanceled = false) {
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
    parse(text) {
        var _a;
        text = DS.StringUtils.toString(text);
        if (!text)
            return [];
        var parts = text.match(this.languageParsingRegex);
        // ... remove any quotes on any quoted parts ...
        for (var i = 0, n = (_a = parts === null || parts === void 0 ? void 0 : parts.length) !== null && _a !== void 0 ? _a : 0; i < n; ++i) {
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
    cleanupWhitespaceParts(parts) {
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
    getKeyFromTextParts(parts) {
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
    getKeyFromText(text) {
        if (DS.StringUtils.isEmptyOrWhitespace(text))
            throw DS.Exception.invalidArgument("Brain.getKeyFromText()", "Cannot create a key from an empty text.");
        var parts = this.parse(text); // (split into text parts)
        return this.getKeyFromTextParts(parts);
    }
    /**
     *  Converts a normal text key (i.e. from 'GetKeyFromTextParts()', or '{TextParet}.Key') to a more *generic* grouping key.
     */
    keyToGroupKey(key) {
        if (!key)
            throw DS.Exception.argumentRequired("Brain.getKeyFromTextParts()", "key");
        // TODO: Put conversions of text that LOOK similar to English characters here.
        return key.toLowerCase();
    }
    /**
     *  Converts a text part, and returns a generic grouping key that can be used to search for similar text.
     */
    toGroupKey(textpart) {
        var key = this.getKeyFromText(textpart);
        return this.keyToGroupKey(key);
    }
    // --------------------------------------------------------------------------------------------------------------------
    process() {
        //? if (Thought == null)
        //?    Thought = new Thought(new Context(new TextInput(Memory, "").Parse()));
        //? Thought.Think();
    }
    addInput(text) {
        for (var handler of this.textInputHandlers)
            try {
                handler.call(text);
            }
            catch (ex) {
                DS.error('Brain.addInput()', DS.getErrorMessage(ex));
            }
    }
}
exports.default = Brain;
__operations = new WeakMap(), __isShuttingDown = new WeakMap(), __isStopped = new WeakMap();
//# sourceMappingURL=Brain.js.map