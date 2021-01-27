"use strict";
var __memory;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchedConcepts = exports.ConceptContext = exports.ConceptHandlerContext = exports.ConceptMatch = exports.intentHandler = exports.contexts = exports.conceptHandler = exports.concept = exports.conceptTypes = void 0;
const Match_1 = require("./Match");
const DictionaryItem_1 = require("./DictionaryItem");
const TimeReferencedObject_1 = require("./TimeReferencedObject");
const POS_1 = require("./POS");
/** An array of all concept types registered by applying the '@concept()' decorator to register them. */
exports.conceptTypes = [];
/**
 * Registers a concept type with the system.
 * @param enabled If true (default) then a concept type is included.  Set to false to disable a concept.
 */
function concept(enabled = true) {
    return (target) => {
        var o = target;
        o.enabled = enabled;
        exports.conceptTypes.push(target);
    };
}
exports.concept = concept;
/**
 *  Associates a method on a derived 'Concept' class with words that will trigger it.
 */
function conceptHandler(...args) {
    return (target, propertyName, descriptor) => {
        const originalFunction = descriptor.value;
        // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
        /// <param name="triggerWords">Words that will trigger this concept.  You can append a caret (^) to a word to set a part of speech (i.e. "w1^N,w2^V" makes w1 a noun and w2 a verb).</param>
        /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
        /// To create a different pattern for different words, use multiple attributes on the same method.</param>
        originalFunction.triggerWords = args === null || args === void 0 ? void 0 : args.map(v => v instanceof DictionaryItem_1.default ? v : new DictionaryItem_1.default(v));
    };
}
exports.conceptHandler = conceptHandler;
/**
 *  Associates a function on a derived 'Concept' class with a list of contexts that will trigger it.
 *  Not ALL contexts are required.
 */
function contexts(...args) {
    return (target, propertyName, descriptor) => {
        const originalFunction = descriptor.value;
        // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
        /// <param name="triggerWords">Words that will trigger this concept.  You can append a caret (^) to a word to set a part of speech (i.e. "w1^N,w2^V" makes w1 a noun and w2 a verb).</param>
        /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
        /// To create a different pattern for different words, use multiple attributes on the same method.</param>
        originalFunction.contexts = args === null || args === void 0 ? void 0 : args.filter(v => !(v instanceof DictionaryItem_1.default)).map(v => typeof v == 'string' ? v : v.tag).filter(v => !!v);
    };
}
exports.contexts = contexts;
/**
 *  Associates a method on a derived 'Concept' class with words that will trigger it.
 */
function intentHandler(...args) {
    return (target, propertyName, descriptor) => {
        const originalFunction = descriptor.value;
        // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
        /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
        /// To create a different pattern for different words, use multiple attributes on the same method.</param>
        originalFunction.triggerWords = args === null || args === void 0 ? void 0 : args.filter(v => v instanceof DictionaryItem_1.default);
        originalFunction.contexts = args === null || args === void 0 ? void 0 : args.filter(v => !(v instanceof DictionaryItem_1.default)).map(v => typeof v == 'string' ? v : v.tag).filter(v => !!v);
    };
}
exports.intentHandler = intentHandler;
/**
 *  Holds the score and other parameters for concepts while trying to find best concept matches.
 */
class ConceptMatch extends Match_1.default {
    constructor(owner, conceptContext, score = null) {
        super(conceptContext, score);
        this._owner = owner;
    }
}
exports.ConceptMatch = ConceptMatch;
/**
 *  The context for the concept handler call.
 *  This object maintains an array of concepts, starting from the left side, and growing towards the right.
 *  As the ProcessConceptsOperation instance processes combinations, it clones contexts and expands the
 *  matched concepts array to match a new combination of concepts.
 *  <para>Note that the context is shared by each handler called in the call chain, and only the 'Index' value (and resulting 'LeftHandlerContext,MatchedConcept,RightHandlerContext' references) is specific to the called handler itself.</para>
*/
class ConceptHandlerContext {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(operation /*ProcessConceptsOperation*/, index, initialMatchedConceptsCapacity = null) {
        __memory.set(this, void 0);
        if (!operation)
            throw DS.Exception.argumentUndefinedOrNull(DS.Utilities.nameof(() => ConceptHandlerContext), 'operation');
        this.operation = operation;
        this.context = null; //?new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
        this.index = index;
        this.Confidence = 0.0;
        this.confidenceSum = 0.0;
        this.matchedConcepts = initialMatchedConceptsCapacity != null ? Array(initialMatchedConceptsCapacity) : [];
        this.probableIntentHandlers = [];
    }
    // --------------------------------------------------------------------------------------------------------------------
    get memory() { return this.operation.Memory; }
    /** Gets the average confidence at the current <see cref="Index"/>. */
    /// <value> The average confidence. </value>
    get avergeConfidence() { return this.confidenceSum / (this.index + 1); }
    /**
     *  For concept handlers, this is the concept matched to the immediate left.
    */
    leftHandlerMatch() { var _a; return this.index > 0 && this.index <= ((_a = this.matchedConcepts) === null || _a === void 0 ? void 0 : _a.length) ? this.matchedConcepts[this.index - 1] : null; }
    /**
     *  For concept handlers, this is the current concept match details (the one the handler belongs to).
    */
    get currentMatch() { var _a; return this.index >= 0 && this.index < ((_a = this.matchedConcepts) === null || _a === void 0 ? void 0 : _a.length) ? this.matchedConcepts[this.index] : null; }
    /** Gets the dictionary item that resulted in the current concept match. */
    /// <value> The dictionary item of the current concept match. </value>
    get currentDictionaryItem() { var _a; return (_a = this.currentMatch) === null || _a === void 0 ? void 0 : _a.item.DictionaryItem; }
    /**
     *  For concept handlers, this is the concept matched to the immediate right.
    */
    get RightHandlerMatch() { var _a; return this.index >= -1 && this.index + 1 < ((_a = this.matchedConcepts) === null || _a === void 0 ? void 0 : _a.length) ? this.matchedConcepts[this.index + 1] : null; }
    //ConceptHandlerContext(operation: ProcessConceptsOperation, index: number, initialMatchedConcepts: Iterable<ConceptMatch>, probableIntentHandlers: Iterable<Iterable<Match<IntentHandler>>> = null) {
    //    this.operation = operation ?? throw new ArgumentNullException(nameof(operation));
    //    this.context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
    //    this.Index = index;
    //    this.Confidence = 0.0;
    //    this.ConfidenceSum = 0.0;
    //    this.MatchedConcepts = initialMatchedConcepts != null ? [initialMatchedConcepts] : [];
    //    this.ProbableIntentHandlers = probableIntentHandlers != null
    //        ? [...probableIntentHandlers.Select(h => h != null ? [h].SortMatches() : null)]
    //        : [];
    //}
    //ConceptHandlerContext(operation: ProcessConceptsOperation, index: number, matchedConcept: ConceptMatch) {
    //    this.operation = operation ?? throw new ArgumentNullException(nameof(operation));
    //    this.context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
    //    this.Index = index;
    //    this.Confidence = 0.0;
    //    this.ConfidenceSum = 0.0;
    //    this.MatchedConcepts = [];
    //    this.ProbableIntentHandlers = [];
    //    if (matchedConcept != null)
    //        this.MatchedConcepts.Add(matchedConcept);
    //}
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Makes a copy of the 'MatchedConcepts' list with 'matchedConcept' appended and returns it as a new 'ConceptHandlerContext' value.
     *  This is used to multiply contexts when processing concept combinations.
    */
    /// <returns>A new concept handler context to use with calling concept handlers.
    /// The clone is returned with a 0.0 Confidence value and the 'matchedConcept' reference added.</returns>
    //Clone(index: number, matchedConcept: ConceptMatch): ConceptHandlerContext {
    //    var matchedConceptsCopy: Iterable<ConceptMatch> = this.matchedConcepts;
    //    if (matchedConcept != null)
    //        matchedConceptsCopy = [...this.matchedConcepts, matchedConcept];
    //    var ctx = new ConceptHandlerContext(this.operation, index, matchedConceptsCopy, this.probableIntentHandlers)
    //    ctx.context = this.context;
    //    ctx.confidenceSum = this.confidenceSum // (note: 'Confidence' is NEVER copied, as it must be 0 for each new concept handler call)
    //    return ctx;
    //}
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Provides a convenient way to return a context with a modified confidence value.
    */
    /// <param name="confidence">The new confidence value.</param>
    SetConfidence(confidence) {
        this.Confidence = confidence;
        return this;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Registers a possible handler to process the intent based on the most likely meaning of the context tree generated from the concept handlers.
     *  <para>If the handler context confidence value is less than the given confidence value for the intent handler, the handler context confidence will be updated to match.</para>
    */
    /// <param name="handler">The intent callback to execute to handle the meaning of the input given by the user.</param>
    /// <param name="confidence">How much confidence that this registered handler can handle the user's meaning.</param>
    addIntentHandler(handler, confidence) {
        // ... Keep added handlers at the same position of this current context index ...
        var _a, _b;
        for (var i = 0; i <= this.index; ++i)
            this.probableIntentHandlers.push(null);
        var handlers;
        // ... get the sorted intent handler set, or create a new entry ...
        if (this.probableIntentHandlers[this.index] == null)
            this.probableIntentHandlers[this.index] = handlers = [];
        else
            handlers = this.probableIntentHandlers[this.index];
        handlers.push(new Match_1.default(handler, confidence));
        //? var confidence = ProbableIntentHandlers.Sum(h => h.Score ?? 0d) / ProbableIntentHandlers.Count; // (calculates average based on all added intents for this curren context)
        var topCurrentConfidence = (_b = (_a = handlers.max((a, b) => a.score > b.score ? 1 : 0)[0]) === null || _a === void 0 ? void 0 : _a.score) !== null && _b !== void 0 ? _b : 0;
        if (this.Confidence < topCurrentConfidence)
            this.Confidence = topCurrentConfidence; // (the handler context confidence should be the highest of all intent handlers)
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Returns true if the given text matches any following text.
     *  The match relies on a group key, which is the text processed to remove
    */
    /// <param name="text">The text to look for.</param>
    /// <param name="exactMatch">If false (default) then a group key is used to match similar text (such as removing letter casing and reducing spaces, etc.).</param>
    /// <returns></returns>
    IsNext(text, exactMatch = false) {
        var _a, _b, _c;
        if (this.RightHandlerMatch == null)
            return DS.StringUtils.isEmptyOrWhitespace(text);
        if (exactMatch) {
            return (text !== null && text !== void 0 ? text : "") == ((_b = (_a = this.RightHandlerMatch) === null || _a === void 0 ? void 0 : _a.item.DictionaryItem.textPart.text) !== null && _b !== void 0 ? _b : "");
        }
        else {
            var grpkey = DS.StringUtils.isEmptyOrWhitespace(text) ? null : (_c = this.memory) === null || _c === void 0 ? void 0 : _c.brain.toGroupKey(text);
            return grpkey == this.RightHandlerMatch.item.DictionaryItem.textPart.groupKey;
        }
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Returns true if the given text matches any preceding text.
     *  The match relies on a group key, which is the text processed to remove
    */
    /// <param name="text">The text to look for.</param>
    /// <param name="exactMatch">If false (default) then a group key is used to match similar text (such as removing letter casing and reducing spaces, etc.).</param>
    /// <returns></returns>
    WasPrevious(text, exactMatch = false) {
        throw DS.Exception.notImplemented("WasPrevious");
        //if (this.leftHandlerMatch == null)
        //    return DS.StringUtils.isEmptyOrWhitespace(text);
        //if (exactMatch)
        //    return (text ?? "") == (this.leftHandlerMatch?.Item.DictionaryItem.TextPart.Text ?? "");
        //else {
        //    var grpkey = DS.StringUtils.isEmptyOrWhitespace(text) ? null : this.#_memory?.brain.toGroupKey(text);
        //    return grpkey == this.leftHandlerMatch.Item.DictionaryItem.TextPart.GroupKey;
        //}
    }
}
exports.ConceptHandlerContext = ConceptHandlerContext;
__memory = new WeakMap();
/**
 *  Created when concept handlers are found that match a text part that was parsed from user input.
*/
class ConceptContext {
    constructor(dictionaryItem, concept, handler) {
        if (!dictionaryItem)
            throw DS.Exception.argumentRequired('new ConceptContext()', "dictionaryItem");
        if (!handler)
            throw DS.Exception.argumentRequired('new ConceptContext()', "handler");
        if (!handler)
            throw DS.Exception.argumentRequired('new ConceptContext()', "handler");
        this._dictionaryItem = dictionaryItem;
        this._handler = concept[handler];
    }
    /**
     *  The dictionary item when the concept was found.
    */
    get DictionaryItem() { return this._dictionaryItem; }
    /**
     *  The concept for this context, which is also used as the 'this' context when calling the handler.
    */
    get Concept() { return this._concept; }
    /**
     *  The handler of the underlying concept that matches the text part (that will be used to process it).
    */
    get Handler() { return this._handler; }
}
exports.ConceptContext = ConceptContext;
/**
 *  Holds all concepts that match a particular text part during text processing.
*/
class MatchedConcepts extends Array {
    constructor(textpartOrIndex, textPartIndex) {
        super();
        if (arguments.length == 1)
            textPartIndex = +textpartOrIndex;
        if (isNaN(textPartIndex) || textPartIndex < 0)
            throw DS.Exception.error("new MatchedConcepts()", "The text part index must be greater or equal to 0.");
        this.OriginalTextPartIndex = textPartIndex;
        if (arguments.length = 2) {
            textpartOrIndex = DS.StringUtils.toString(textpartOrIndex);
            if (DS.StringUtils.isEmptyOrWhitespace(textpartOrIndex))
                throw DS.Exception.error("new MatchedConcepts()", "A text part cannot be null, empty, or white text.");
            this.OriginalTextPart = textpartOrIndex;
        }
    }
    // --------------------------------------------------------------------------------------------------------------------
    ///**
    // *  Sorts all items in this list and returns the list.
    // */
    //sort(): this {
    //    super.sort(ConceptMatch.DefaultComparer);
    //    return this;
    //}
    // --------------------------------------------------------------------------------------------------------------------
    add(c, score = null) {
        this.push(new ConceptMatch(this, c, score));
    }
    AddMatch(match) {
        this.add(match.item, match.score);
    }
}
exports.MatchedConcepts = MatchedConcepts;
/**
 *  A concept is a mapping to some sort of understanding or intention. For instance, if the user wants to find a file on their computer,
 *  a general "Files", or perhaps more specific "FileSearch" concept might be triggered if that concept is determined to be the best match
 *  to the user's intention. Concepts are loaded and activated as singleton instances.  Only one instance of each type is created per bot
 *  instance, and each concept is passed a ConceptContext for it to use when processing inputs it is designed to handle.
 *  Being a singleton, concepts can also be plugins for global states, such as tracking a bots simulated "feeling" level, or states that
 *  are updated by external hooks (for instance, polling for emails or IM streams, detecting light brightness, sound activity, etc.).
 *  <para>
 *  If the bot has no concept of anything, it will not be able to understand any requests or thought processes. In such a case,
 *  all inputs are simply parsed and recorded with no responses possible (brain-dead like state).</para>
 *  <para>Internally, concepts build a tree of context objects (such as subjects and attributes) to handle various situations by analyzing
 *  surrounding concepts that were found based on user inputs in order to detect possible meanings.
 */
class Concept extends TimeReferencedObject_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    ///**
    // * // The expected dictionary items used in the derived concept which is used to analyze the incoming dictionary items based on user input.
    // *  It is recommended to use '_AddWord()' to add these items, and not do so directly.
    //*/
    //protected Dictionary<string, List<TextPartHandler>> _TextPartHandlers = new Dictionary<string, List<TextPartHandler>>();
    constructor(brain) {
        super();
        // --------------------------------------------------------------------------------------------------------------------
        ///**
        // * // Registers text that should trigger this concept.  When the text is encountered, the concept's matching handler registered for that text will be triggered.
        // *  <para>Note: POS, tense, and plurality MUST all match the same context as an existing word in the database, or a new entry will be created.</para>
        //*/
        ///// <param name="textpart">The text part to register. If null or empty, the given handler is registered for ANY text part not matching any other handler.</param>
        ///// <param name="pos">A part of speech (POS) to classify the context for the word.</param>
        ///// <param name="tense">A tense type to classify the context for the word (is NA in most cases).</param>
        ///// <param name="plurality">A plurality type to classify the context for the word (is NA in most cases).</param>
        //protected DictionaryItem _RegisterTextPartHandler(string textpart, PartOfSpeech pos, TextPartHandler wordHandler, TenseTypes tense = TenseTypes.NA, Plurality plurality = Plurality.NA)
        //{
        //    // ... register this concept for the given text part with the brain instance ...
        //    var dicItem = Brain._RegisterConcept(this, textpart, pos, tense, plurality);
        //    // ... register the handler that will trigger when this word text is seen ...
        //    var key = TextPart.ToGroupKey(textpart);
        //    var handlers = _TextPartHandlers.Value(key);
        //    if (handlers == null)
        //    {
        //        _TextPartHandlers[key] = handlers = new List<TextPartHandler>();
        //        handlers.Add(wordHandler);
        //    }
        //    else if (!handlers.Contains(wordHandler))
        //        handlers.Add(wordHandler);
        //    return dicItem;
        //}
        // --------------------------------------------------------------------------------------------------------------------
        /**
         *  A dictionary of concept handlers and the dictionary items they support.
         *  This is populated when the brain loads the concept and calls 'RegisterHandlers()'.
        */
        this._ConceptPatterns = new Map();
        if (!brain)
            throw DS.Exception.argumentRequired("new Concept()", "brain");
        this.brain = brain;
        this._ApplyStaticDictionaryItems();
    }
    get memory() { return this.brain.memory; }
    /**
     * Scans the properties of the type that created this instance for static dictionary items to add to the dictionary
     * associated with this concept instance. This allows concepts to define their terms and conditions, which in turn
     * helps to populate the dictionary with a base level of words.  The secondary purpose is also to copy the registered
     * words to the instance side so that the specific dictionary words can be easily referenced while coding.
     */
    _ApplyStaticDictionaryItems() {
        var type = this.constructor;
        for (var p in type)
            if (type.hasOwnProperty(p)) {
                var val = type[p];
                if (val instanceof DictionaryItem_1.default)
                    this[p] = this.memory.dictionary.AddEntry(val); // (adds the item and returns the registered item [which could be an existing one instead])
            }
    }
    // --------------------------------------------------------------------------------------------------------------------
    /** Executes once the after all core system concepts have been registered. */
    onAfterAllRegistered() { }
    /**
     *  Called by the system when it is ready for this concept to register any handlers on it.
    */
    RegisterHandlers() {
        var methods = DS.Utilities.getPropertiesOfType(this, 'function');
        var hf;
        for (var method of methods)
            if ((hf = this[method]).triggerWords && hf.triggerWords.length) {
                // ... since a handler can have many trigger words and/or patterns, look for and process multiple trigger patterns ...
                //? if (_Concepts.ContainsKey(attr.Pattern))
                //?     System.Diagnostics.Debug.WriteLine("The concept type '" + concept.Name + "' contains pattern '" + attr.Pattern + "' which matches another pattern on concept '" + _Concepts[attr.Pattern].GetType().Name + "'. Try to avoid duplicate patterns and be more specific if possible.", "Warning");
                for (var pattern in hf.triggerWords)
                    try {
                        this.addConceptTriggerWords(pattern, new DS.Delegate(this, hf));
                    }
                    catch (ex) {
                        this.brain.conceptHandlerLoadErrors.push(new DS.Exception("Failed to register concept handler " + method + ": \r\n" + ex.Message, this, ex));
                    }
                //? if (_Concepts[attr.Pattern] == null)
                //?     _Concepts[attr.Pattern] = new List<Concept>();
                //? _Concepts[attr.Pattern].Add(conceptInstance);
            }
    }
    /**
     *  Parses and adds a concept pattern and associates it with a callback handler.
     */
    /// <param name="words">One or more words (separated by commas or spaces) that will trigger the handler.</param>
    /// <param name="handler">A callback delegate to execute when the pattern matches.</param>
    /// <param name="dictionary">A dictionary to hold the pattern parts. If null, the dictionary associated with brain's main memory is used.</param>
    /// <returns>The patterns are mapped to the handler and stored within the concept instance, but pattern entries are also returned if needed.</returns>
    addConceptTriggerWords(words, handler, dictionary = null) {
        var _a, _b;
        if (DS.StringUtils.isEmptyOrWhitespace(words))
            return;
        if (!dictionary)
            dictionary = (_b = (_a = this.brain) === null || _a === void 0 ? void 0 : _a.memory) === null || _b === void 0 ? void 0 : _b.dictionary;
        if (!dictionary)
            throw DS.Exception.error(DS.Utilities.nameof(() => Concept.addConceptTriggerWords, true) + "()", "No dictionary was given, and 'this.brain.memory.dictionary' is did not return anything.");
        var dictionaryItems = [];
        var expectedWords = words.split(/'\s|,'/g).filter(v => !DS.StringUtils.isEmptyOrWhitespace(v));
        for (var i = 0; i < expectedWords.length; ++i) {
            var wordpart = expectedWords[i];
            var worddetails = wordpart.split('^').filter(v => !DS.StringUtils.isEmptyOrWhitespace(v));
            var word = worddetails[0]; // (there's always at least 1 item)
            // (Note: if 'word' is empty, it is a wild card place holder for text)
            for (var i2 = 1, n2 = worddetails.length; i2 < n2; ++i2) {
                var posStr = worddetails[i2];
                var pos = null;
                var dicItem;
                if (word == "*")
                    word = ""; // (in case user uses * for a wildcard at this point, just accept and convert it)
                else if (word.startsWith("**"))
                    word = DS.StringUtils.replace(word, "**", "*"); // (double will be the escape for a single)
                if (!DS.StringUtils.isEmptyOrWhitespace(posStr)) {
                    switch (posStr.toUpperCase()) {
                        case "D":
                            pos = POS_1.default.Determiner;
                            break;
                        case "DD":
                            pos = POS_1.default.Determiner_Definite;
                            break;
                        case "DI":
                            pos = POS_1.default.Determiner_Indefinite;
                            break;
                        case "N":
                            pos = POS_1.default.Noun;
                            break;
                        case "NA":
                            pos = POS_1.default.Noun_Action;
                            break;
                        case "NC":
                            pos = POS_1.default.Noun_Creature;
                            break;
                        case "NO":
                            pos = POS_1.default.Noun_Object;
                            break;
                        case "NP":
                            pos = POS_1.default.Noun_Person;
                            break;
                        case "NPL":
                            pos = POS_1.default.Noun_Place;
                            break;
                        case "NQF":
                            pos = POS_1.default.Noun_Quality_Or_Feeling;
                            break;
                        case "NS":
                            pos = POS_1.default.Noun_Spatial;
                            break;
                        case "NT":
                            pos = POS_1.default.Noun_Temporal;
                            break;
                        case "NTR":
                            pos = POS_1.default.Noun_Trait;
                            break;
                        case "V":
                            pos = POS_1.default.Verb;
                            break;
                        case "VAP":
                            pos = POS_1.default.Verb_AbleToOrPermitted;
                            break;
                        case "VA":
                            pos = POS_1.default.Verb_Action;
                            break;
                        case "VIS":
                            pos = POS_1.default.Verb_Is;
                            break;
                        case "VO":
                            pos = POS_1.default.Verb_Occurrence;
                            break;
                        case "VS":
                            pos = POS_1.default.Verb_State;
                            break;
                        case "AV":
                            pos = POS_1.default.Adverb;
                            break;
                        case "A":
                            pos = POS_1.default.Adjective;
                            break;
                        case "AT":
                            pos = POS_1.default.Adjective_Trait;
                            break;
                        case "PN":
                            pos = POS_1.default.Pronoun;
                            break;
                        case "PNP":
                            pos = POS_1.default.Pronoun_Possessive;
                            break;
                        case "PS":
                            pos = POS_1.default.Pronoun_Subject;
                            break;
                        case "PP":
                            pos = POS_1.default.Preposition;
                            break;
                        case "PPA":
                            pos = POS_1.default.Preposition_Amount;
                            break;
                        case "PPC":
                            pos = POS_1.default.Preposition_Contact;
                            break;
                        case "PPD":
                            pos = POS_1.default.Preposition_Directional;
                            break;
                        case "PPE":
                            pos = POS_1.default.Preposition_End;
                            break;
                        case "PPI":
                            pos = POS_1.default.Preposition_Including;
                            break;
                        case "PPIN":
                            pos = POS_1.default.Preposition_Intention;
                            break;
                        case "PPINV":
                            pos = POS_1.default.Preposition_Involvement;
                            break;
                        case "PPO":
                            pos = POS_1.default.Preposition_Onbehalf;
                            break;
                        case "PPS":
                            pos = POS_1.default.Preposition_Spatial;
                            break;
                        case "PPST":
                            pos = POS_1.default.Preposition_State;
                            break;
                        case "PPSU":
                            pos = POS_1.default.Preposition_Supporting;
                            break;
                        case "PPT":
                            pos = POS_1.default.Preposition_Temporal;
                            break;
                        case "PPTW":
                            pos = POS_1.default.Preposition_Towards;
                            break;
                        case "PPUS":
                            pos = POS_1.default.Preposition_Using;
                            break;
                        case "&":
                            pos = POS_1.default.Conjunction;
                            break;
                        case "I":
                            pos = POS_1.default.Interjection;
                            break;
                        case "!":
                            pos = POS_1.default.Exclamation;
                            break;
                        case "IN":
                            pos = POS_1.default.InfinitiveMarker;
                            break;
                        case "#":
                            pos = POS_1.default.Numeric;
                            break;
                        case "$":
                            pos = POS_1.default.Numeric_currency;
                            break;
                        case "DA":
                            pos = POS_1.default.Date;
                            break;
                        case "TM":
                            pos = POS_1.default.Time;
                            break;
                        case "DT":
                            pos = POS_1.default.Datetime;
                            break;
                        default:
                            throw DS.Exception.error(DS.Utilities.nameof(() => Concept.addConceptTriggerWords, true) + "()", "Unknown part of speech code '" + pos + "': " + words);
                    }
                }
                dicItem = DS.StringUtils.isEmptyOrWhitespace(word) ? dictionary.globalEntry
                    : dictionary.addTextPart(word, pos); // (this adds the word into the dictionary, build a small word base from the concept patterns)
                dicItem.addConceptHandler(handler);
                // (dictionary items should reference back to the concepts that created them; when a word match is found, the concept is considered [in context])
            }
        }
    }
    // --- This is removed now in favor of concrete word matches, but pattern could be an add on later, so keep this old method idea for reference ---
    ///**
    //// Parses and adds a concept pattern and associates it with a callback handler.
    //*/
    ///// <param name="pattern">A text pattern that will trigger the handler.</param>
    ///// <param name="handler">A callback method to execute when the pattern matches.</param>
    ///// <param name="dictionary">A dictionary to hold the pattern parts. If null, the dictionary associated with brain's main memory is used.</param>
    ///// <returns>The patterns are mapped to the handler and stored within the concept instance, but pattern entries are also returned if needed.</returns>
    //public DictionaryItem[][] AddConceptPattern(string pattern, ConceptHandler handler, Dictionary dictionary = null)
    //{
    //    if (DS.StringUtils.isEmptyOrWhitespace(pattern)) return new DictionaryItem[0][];
    //    if (dictionary == null)
    //        dictionary = Brain?.Memory?.Dictionary ?? throw new ArgumentNullException("dictionary", "No dictionary was given, and 'this.Brain.Memory.Dictionary' is null.");
    //    List<DictionaryItem[]> dictionaryItems = new List<DictionaryItem[]>();
    //    dictionary = dictionary ?? Brain?.Memory?.Dictionary;
    //    if (dictionary == null) throw new ArgumentNullException("dictionary");
    //    var parts = pattern.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
    //    for (var i = 0; i < parts.Length; ++i)
    //    {
    //        var patternpart = parts[i];
    //        var wordparts = patternpart.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
    //        var supportedWordEntries = new List<DictionaryItem>();
    //        for (var i2 = 0; i2 < wordparts.Length; ++i2)
    //        {
    //            var wordpart = wordparts[i2];
    //            var worddetails = patternpart.Split(new char[] { '^' }, StringSplitOptions.RemoveEmptyEntries);
    //            var word = worddetails[0];
    //            // (Note: if 'word' is empty, it is a wild card place holder for text)
    //            var posstr = worddetails[1];
    //            PartOfSpeech pos = null;
    //            DictionaryItem dicItem;
    //            if (word == "*")
    //                word = ""; // (in case user uses * for a wildcard at this point, just accept and convert it)
    //            else if (word.StartsWith("**"))
    //                word.Replace("**", "*"); // (double will be the escape for a single)
    //            if (!DS.StringUtils.isEmptyOrWhitespace(posstr))
    //            {
    //                switch (posstr.ToUpper())
    //                {
    //                    case "D": pos = POS.Determiner; break;
    //                    case "DD": pos = POS.Determiner_Definite; break;
    //                    case "DI": pos = POS.Determiner_Indefinite; break;
    //                    case "N": pos = POS.Noun; break;
    //                    case "NA": pos = POS.Noun_Action; break;
    //                    case "NC": pos = POS.Noun_Creature; break;
    //                    case "NO": pos = POS.Noun_Object; break;
    //                    case "NP": pos = POS.Noun_Person; break;
    //                    case "NPL": pos = POS.Noun_Place; break;
    //                    case "NQF": pos = POS.Noun_Quality_Or_Feeling; break;
    //                    case "NS": pos = POS.Noun_Spatial; break;
    //                    case "NT": pos = POS.Noun_Temporal; break;
    //                    case "NTR": pos = POS.Noun_Trait; break;
    //                    case "V": pos = POS.Verb; break;
    //                    case "VAP": pos = POS.Verb_AbleToOrPermitted; break;
    //                    case "VA": pos = POS.Verb_Action; break;
    //                    case "VIS": pos = POS.Verb_Is; break;
    //                    case "VO": pos = POS.Verb_Occurrence; break;
    //                    case "VS": pos = POS.Verb_State; break;
    //                    case "AV": pos = POS.Adverb; break;
    //                    case "A": pos = POS.Adjective; break;
    //                    case "AT": pos = POS.Adjective_Trait; break;
    //                    case "PN": pos = POS.Pronoun; break;
    //                    case "PNP": pos = POS.Pronoun_Possessive; break;
    //                    case "PS": pos = POS.Pronoun_Subject; break;
    //                    case "PP": pos = POS.Preposition; break;
    //                    case "PPA": pos = POS.Preposition_Amount; break;
    //                    case "PPC": pos = POS.Preposition_Contact; break;
    //                    case "PPD": pos = POS.Preposition_Directional; break;
    //                    case "PPE": pos = POS.Preposition_End; break;
    //                    case "PPI": pos = POS.Preposition_Including; break;
    //                    case "PPIN": pos = POS.Preposition_Intention; break;
    //                    case "PPINV": pos = POS.Preposition_Involvement; break;
    //                    case "PPO": pos = POS.Preposition_Onbehalf; break;
    //                    case "PPS": pos = POS.Preposition_Spatial; break;
    //                    case "PPST": pos = POS.Preposition_State; break;
    //                    case "PPSU": pos = POS.Preposition_Supporting; break;
    //                    case "PPT": pos = POS.Preposition_Temporal; break;
    //                    case "PPTW": pos = POS.Preposition_Towards; break;
    //                    case "PPUS": pos = POS.Preposition_Using; break;
    //                    case "&": pos = POS.Conjunction; break;
    //                    case "I": pos = POS.Interjection; break;
    //                    case "!": pos = POS.Exclamation; break;
    //                    case "IN": pos = POS.InfinitiveMarker; break;
    //                    case "#": pos = POS.Numeric; break;
    //                    case "$": pos = POS.Numeric_currency; break;
    //                    case "DA": pos = POS.Date; break;
    //                    case "TM": pos = POS.Time; break;
    //                    case "DT": pos = POS.Datetime; break;
    //                    default: throw new InvalidOperationException("Unknown part of speech code '" + pos + "': " + pattern);
    //                }
    //            }
    //            dicItem = DS.StringUtils.isEmptyOrWhitespace(word) ? new DictionaryItem(null, null, pos)
    //                : dictionary.AddTextPart(word, pos); // (this adds the word into the dictionary, build a small word base from the concept patterns)
    //            dicItem.AddConceptHandler(this, handler); // (dictionary items should reference back to the concepts that created them)
    //            supportedWordEntries.Add(dicItem);
    //        }
    //        dictionaryItems.Add(supportedWordEntries.ToArray());
    //    }
    //    var patternItems = dictionaryItems.ToArray();
    //    _ConceptPatterns[handler] = patternItems;
    //    return patternItems;
    //}
    // --------------------------------------------------------------------------------------------------------------------
    IsMatch(left, item, right) {
        return false;
    }
}
exports.default = Concept;
/**
 * Used to determined whether or not to include a derived type concept when adding to a new brain instance.
 * This can be updated on a derived type when the '@concept()' decorator is applied to it.
 */
Concept.enabled = true;
//# sourceMappingURL=Concept.js.map