import Match from "./Match";
import Memory, { IMemoryObject } from "./Memory";
import DictionaryItem from "./DictionaryItem";
import TimeReferencedObject from "./TimeReferencedObject";
import Brain from "./Brain";

/** An array of all concept types registered by applying the '@concept()' decorator to register them. */
export const conceptTypes: IType<Concept>[] = [];

export function concept(enabled = true) {
    return (target: IType<Concept>): any => {
        var o: IndexedObject = target;
        o.enabled = enabled;
        conceptTypes.push(target);
    };
}

/**
 *  Associates a method on a derived 'Concept' class with words that will trigger it.
 */
export function conceptHandler(triggerWords: string, pattern: string = null) {
    return (target: IndexedObject, propertyName: string, descriptor: PropertyDescriptor): any => { // (target: Either the constructor function of the class for a static member, or the prototype of the class for an instance member.)
        const originalFunction = descriptor.value;
        // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
        /// <param name="triggerWords">Words that will trigger this concept.  You can append a caret (^) to a word to set a part of speech (i.e. "w1^N,w2^V" makes w1 a noun and w2 a verb).</param>
        /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
        /// To create a different pattern for different words, use multiple attributes on the same method.</param>
        originalFunction.triggerWords = triggerWords;
        originalFunction.pattern = pattern;
    };
}

/**
 *  Associates a method on a derived 'Concept' class with words that will trigger it.
 */
export function intentHandler(triggerWords: string, pattern: string = null) {
    return (target: IndexedObject, propertyName: string, descriptor: PropertyDescriptor): any => { // (target: Either the constructor function of the class for a static member, or the prototype of the class for an instance member.)
        const originalFunction = descriptor.value;
        // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
        /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
        /// To create a different pattern for different words, use multiple attributes on the same method.</param>
        originalFunction.triggerWords = triggerWords;
        originalFunction.pattern = pattern;
    };
}

/**
 *  Holds the score and other parameters for concepts while trying to find best concept matches.
 */
export class ConceptMatch extends Match<ConceptContext>
{
    readonly _owner: MatchedConcepts; // (the concepts set that owns this concept match)
    constructor(owner: MatchedConcepts, conceptContext: ConceptContext, score: number = null) {
        super(conceptContext, score);
        this._owner = owner;
    }
}

//? public delegate Context TextPartHandler(HandlerContext context);
/**
 *  A method on a concept that will handle given key words.
 */
/// <param name="context">A context struct to hold the context for a handler call.</param>
/// <returns>The return should be the same or updated copy of the given context.</returns>
export interface ConceptHandler { (context: ConceptHandlerContext): Promise<ConceptHandlerContext> }

/**
 *  A handler to execute on a concept to process the most likely intent that was detected.
 *  If the intent handler encounters issues with understanding the data, it can either spawn questions and return true, or give up and return false.
 *  Returning false causes the next best handler, if any, to execute.
*/
/// <param name="context">After all input is processed and concept handlers are run, the intent with the best score is executed.</param>
/// <returns>True if the intent was handled. If for some reason the intent cannot be handled, false can be returned to cause the next handler (if any) to execute instead.</returns>
export interface IntentHandler { (context: ConceptHandlerContext): Promise<boolean> }

/**
 *  The context for the concept handler call. 
 *  This object maintains an array of concepts, starting from the left side, and growing towards the right.
 *  As the ProcessConceptsOperation instance processes combinations, it clones contexts and expands the
 *  matched concepts array to match a new combination of concepts.
 *  <para>Note that the context is shared by each handler called in the call chain, and only the 'Index' value (and resulting 'LeftHandlerContext,MatchedConcept,RightHandlerContext' references) is specific to the called handler itself.</para>
*/
export class ConceptHandlerContext implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    get memory(): Memory { return this.Operation.Memory; }
    #_memory: Memory;

    /**
     *  The current brain task operation that is processing the concepts.
    */
    readonly Operation: ProcessConceptsOperation;

    /**
     *  The new or existing context that is the result of various concept handlers. It is used to build the content of the user's intent.
     *  New contexts should be added or associated as required, or data loss will occur; causing much confusion.
     *  An intent context is shared globally within a single text-part-combination path and helps to build the over all intent of the user.
    */
    Context: IntentContext;

    /**
     *  When a concept returns a context, it also sets a confidence level from 0.0 to 1.0 on how sure it is that it is the direction of intent by the user.
    */
    Confidence: number;

    /**
     *  Upon return from a concept handler, the system keeps track of the confidence total to calculate an average later.
    */
    ConfidenceSum: number;

    /** Gets the average confidence at the current <see cref="Index"/>. */
    /// <value> The average confidence. </value>
    get AvergeConfidence(): number { return this.ConfidenceSum / (this.Index + 1); }

    /**
     *  A match to a handler that might be able to process the most likely intent of the user.
    */
    ProbableIntentHandlers: Match<IntentHandler>[][];

    /**
     *  Returns true if this context has any callbacks to handler intents (user input meanings).
    */
    get HasProbableIntentHandlers(): boolean { return this.ProbableIntentHandlers?.Any(i => i.Count > 0) ?? false; }

    /**
     *  A growing list of executing concepts that were matched against user input.
     *  The list is growing because the final list is not known until initial handlers execute early to catch any invalid combinations.
    */
    MatchedConcepts: ConceptMatch[];

    /**
     *  The current index of the current matched concept in relation to other handlers being executed.
    */
    Index: number;

    /**
     *  For concept handlers, this is the concept matched to the immediate left.
    */
    LeftHandlerMatch(): ConceptMatch { return this.Index > 0 && this.Index <= MatchedConcepts?.Count ? MatchedConcepts[this.Index - 1] : null; }

    /**
     *  For concept handlers, this is the current concept match details (the one the handler belongs to).
    */
    get CurrentMatch(): ConceptMatch { return this.Index >= 0 && this.Index < MatchedConcepts?.Count ? MatchedConcepts[this.Index] : null; }

    /** Gets the dictionary item that resulted in the current concept match. */
    /// <value> The dictionary item of the current concept match. </value>
    get CurrentDictionaryItem(): DictionaryItem { return CurrentMatch?.Item.DictionaryItem; }

    /**
     *  For concept handlers, this is the concept matched to the immediate right.
    */
    get RightHandlerMatch(): ConceptMatch { return this.Index >= -1 && this.Index + 1 < MatchedConcepts?.Count ? MatchedConcepts[this.Index + 1] : null; }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(operation: ProcessConceptsOperation, index: number, initialMatchedConceptsCapacity: number = null) {
        this.Operation = operation ?? throw new ArgumentNullException(nameof(operation));
        this.Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
        this.Index = index;
        this.Confidence = 0.0;
        this.ConfidenceSum = 0.0;
        this.MatchedConcepts = initialMatchedConceptsCapacity != null
            ? [initialMatchedConceptsCapacity.Value] : [];
        this.ProbableIntentHandlers = [];
    }

    ConceptHandlerContext(operation: ProcessConceptsOperation, index: number, initialMatchedConcepts: Iterable<ConceptMatch>, probableIntentHandlers: Iterable<Iterable<Match<IntentHandler>>> = null) {
        this.Operation = operation ?? throw new ArgumentNullException(nameof(operation));
        this.Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
        this.Index = index;
        this.Confidence = 0.0;
        this.ConfidenceSum = 0.0;
        this.MatchedConcepts = initialMatchedConcepts != null ? [initialMatchedConcepts] : [];
        this.ProbableIntentHandlers = probableIntentHandlers != null
            ? [...probableIntentHandlers.Select(h => h != null ? [h].SortMatches() : null)]
            : [];
    }

    ConceptHandlerContext(operation: ProcessConceptsOperation, index: number, matchedConcept: ConceptMatch) {
        this.Operation = operation ?? throw new ArgumentNullException(nameof(operation));
        this.Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
        this.Index = index;
        this.Confidence = 0.0;
        this.ConfidenceSum = 0.0;
        this.MatchedConcepts = [];
        this.ProbableIntentHandlers = [];
        if (matchedConcept != null)
            this.MatchedConcepts.Add(matchedConcept);
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Makes a copy of the 'MatchedConcepts' list with 'matchedConcept' appended and returns it as a new 'ConceptHandlerContext' value.
     *  This is used to multiply contexts when processing concept combinations.
    */
    /// <returns>A new concept handler context to use with calling concept handlers.
    /// The clone is returned with a 0.0 Confidence value and the 'matchedConcept' reference added.</returns>
    Clone(index: number, matchedConcept: ConceptMatch): ConceptHandlerContext {
        matchedConceptsCopy: Iterable < ConceptMatch > = MatchedConcepts;

        if (matchedConcept != null)
            matchedConceptsCopy = MatchedConcepts.Concat(new ConceptMatch[] { matchedConcept });

        return new ConceptHandlerContext(Operation, index, matchedConceptsCopy, ProbableIntentHandlers)
        {
            Context = Context,
                ConfidenceSum = ConfidenceSum // (note: 'Confidence' is NEVER copied, as it must be 0 for each new concept handler call)
        };
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Provides a convenient way to return a context with a modified confidence value.
    */
    /// <param name="confidence">The new confidence value.</param>
    SetConfidence(confidence: number): ConceptHandlerContext {
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
    AddIntentHandler(handler: IntentHandler, confidence: number) {
        // ... Keep added handlers at the same position of this current context index ...

        for (var i = 0; i <= this.Index; ++i)
            this.ProbableIntentHandlers.push(null);

        var handlers: Array<Match<IntentHandler>>;

        // ... get the sorted intent handler set, or create a new entry ...

        if (this.ProbableIntentHandlers[this.Index] == null)
            this.ProbableIntentHandlers[this.Index] = handlers = [];
        else
            handlers = this.ProbableIntentHandlers[this.Index];

        handlers.push(new Match<IntentHandler>(handler, confidence));

        //? var confidence = ProbableIntentHandlers.Sum(h => h.Score ?? 0d) / ProbableIntentHandlers.Count; // (calculates average based on all added intents for this curren context)
        var topCurrentConfidence = handlers.max((a, b) => a.score > b.score ? 1 : 0)[0]?.score ?? 0;
        if (this.Confidence < topCurrentConfidence) this.Confidence = topCurrentConfidence; // (the handler context confidence should be the highest of all intent handlers)
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Returns true if the given text matches any following text.
     *  The match relies on a group key, which is the text processed to remove
    */
    /// <param name="text">The text to look for.</param>
    /// <param name="exactMatch">If false (default) then a group key is used to match similar text (such as removing letter casing and reducing spaces, etc.).</param>
    /// <returns></returns>
    IsNext(text: string, exactMatch = false): boolean {
        if (this.RightHandlerMatch == null)
            return DS.StringUtils.isEmptyOrWhitespace(text);
        if (exactMatch) {
            return (text ?? "") == (this.RightHandlerMatch?.item.DictionaryItem.TextPart.Text ?? "");
        }
        else {
            var grpkey = DS.StringUtils.isEmptyOrWhitespace(text) ? null : this.memory?.Brain.toGroupKey(text);
            return grpkey == this.RightHandlerMatch.item.DictionaryItem.TextPart.GroupKey;
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
    WasPrevious(text: string, exactMatch = false): boolean {
        if (this.LeftHandlerMatch == null)
            return DS.StringUtils.isEmptyOrWhitespace(text);
        if (exactMatch)
            return (text ?? "") == (this.LeftHandlerMatch?.Item.DictionaryItem.TextPart.Text ?? "");
        else {
            var grpkey = string.IsNullOrWhiteSpace(text) ? null : this.#_memory?.Brain.ToGroupKey(text);
            return grpkey == this.LeftHandlerMatch.Item.DictionaryItem.TextPart.GroupKey;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------
}

/**
 *  Created when concept handlers are found that match a text part that was parsed from user input.
*/
public class ConceptContext<TConcept extends Concept> {
    /**
     *  The dictionary item when the concept was found.
    */
    get DictionaryItem(): DictionaryItem { return this._dictionaryItem; }
    _dictionaryItem: DictionaryItem;

    /**
     *  The concept for this context, which is also used as the 'this' context when calling the handler.
    */
    get Concept(): Concept { return this._concept; }
    _concept: Concept;

    /**
     *  The handler of the underlying concept that matches the text part (that will be used to process it).
    */
    get Handler(): ConceptHandler { return this._handler; }
    _handler: ConceptHandler;

    constructor(dictionaryItem: DictionaryItem, concept: TConcept, handler: keyof Extract<TConcept, { [index: string]: ConceptHandler }>) {
        if (!dictionaryItem)
            throw DS.Exception.argumentRequired('new ConceptContext()', "dictionaryItem");
        if (!handler)
            throw DS.Exception.argumentRequired('new ConceptContext()', "handler");
        if (!handler)
            throw DS.Exception.argumentRequired('new ConceptContext()', "handler");
        this._dictionaryItem = dictionaryItem;
        this._handler = (<any>concept)[handler];
    }
}

/**
 *  Holds all concepts that match a particular text part during text processing.
*/
export class MatchedConcepts extends Array<ConceptMatch>
{
    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  The original text part from the input text that resulted in the underlying set of concepts (not from a dictionary item).
    */
    readonly OriginalTextPart: string;

    /**
     *  The position of where the underlying original text part is in relation to the other text parts in the array of original text parts.
    */
    readonly OriginalTextPartIndex: number;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(textPartIndex: number);
    constructor(textpart: string, textPartIndex: number);
    constructor(textpartOrIndex: string | Number, textPartIndex?: number) {
        super();
        if (arguments.length == 1)
            textPartIndex = +(<number>textpartOrIndex);
        if (isNaN(textPartIndex) || textPartIndex < 0)
            throw DS.Exception.error("new MatchedConcepts()", "The text part index must be greater or equal to 0.");
        this.OriginalTextPartIndex = textPartIndex;
        if (arguments.length = 2) {
            textpartOrIndex = '' + textpartOrIndex;
            if (DS.StringUtils.isEmptyOrWhitespace(textpartOrIndex))
                throw DS.Exception.error("new MatchedConcepts()", "A text part cannot be null, empty, or white text.");
            this.OriginalTextPart = textpartOrIndex;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Sorts all items in this list and returns the list.
    */
    Sort(): MatchedConcepts {
        this.Sort(ConceptMatch.DefaultComparer);
        return this;
    }

    // --------------------------------------------------------------------------------------------------------------------

    public void Add(ConceptContext c, double? score = null) {
        base.Add(new ConceptMatch(this, c, score));
    }

    public void Add(Match <ConceptContext > match)
{
    Add(match.Item, match.Score);
}

        // --------------------------------------------------------------------------------------------------------------------
    }

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
export default abstract class Concept extends TimeReferencedObject implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    readonly brain: Brain;

    get memory(): Memory { return this.brain.Memory; }

    /**
     * Used to determined whether or not to include a derived type concept when adding to a new brain instance.
     * This can be updated on a derived type when the '@concept()' decorator is applied to it.
     */
    static enabled = true;

    // --------------------------------------------------------------------------------------------------------------------

    ///**
    // * // The expected dictionary items used in the derived concept which is used to analyze the incoming dictionary items based on user input.
    // *  It is recommended to use '_AddWord()' to add these items, and not do so directly.
    //*/
    //protected Dictionary<string, List<TextPartHandler>> _TextPartHandlers = new Dictionary<string, List<TextPartHandler>>();

    constructor(brain: Brain) {
        super();
        if (!brain)
            throw DS.Exception.argumentRequired("new Concept()", "brain");

        this.brain = brain;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Executes once the after all core system concepts have been registered. */
    protected OnAfterAllRegistered() { }

    // --------------------------------------------------------------------------------------------------------------------

    ///**
    * // Registers text that should trigger this concept.  When the text is encountered, the concept's matching handler registered for that text will be triggered.
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
        protected _ConceptPatterns: Map<ConceptHandler, DictionaryItem[]> = new Map<ConceptHandler, DictionaryItem[]>();

    /**
     *  Called by the system when it is ready for this concept to register any handlers on it.
    */
    RegisterHandlers() {
        var methods = GetType().GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.FlattenHierarchy);
        foreach(var method in methods)
        {
            // ... since a handler can have many trigger words and/or patterns, look for and process multiple attributes ...
            var attributes = method.GetCustomAttributes<ConceptHandlerAttribute>();

            if (!(attributes?.Any() ?? false)) continue;

            foreach(var attr in attributes)
            {
                if (string.IsNullOrWhiteSpace(attr.TriggerWords)) continue;
                // ... else this method is a handler for this concept; register the method with the text ...

                //? if (_Concepts.ContainsKey(attr.Pattern))
                //?     System.Diagnostics.Debug.WriteLine("The concept type '" + concept.Name + "' contains pattern '" + attr.Pattern + "' which matches another pattern on concept '" + _Concepts[attr.Pattern].GetType().Name + "'. Try to avoid duplicate patterns and be more specific if possible.", "Warning");

                try {
                    AddConceptTriggerWords(attr.TriggerWords, (ConceptHandler)method.CreateDelegate(typeof (ConceptHandler), this));
                }
                catch (Exception ex)
                {
                    Brain.ConceptHandlerLoadErrors.Add(new Exception("Failed to register concept handler " + method.ToString() + ": \r\n" + ex.Message, ex));
                }

                //? if (_Concepts[attr.Pattern] == null)
                //?     _Concepts[attr.Pattern] = new List<Concept>();

                //? _Concepts[attr.Pattern].Add(conceptInstance);
            }
        }
    }

    /**
     *  Parses and adds a concept pattern and associates it with a callback handler.
    */
    /// <param name="words">One or more words (separated by commas or spaces) that will trigger the handler.</param>
    /// <param name="handler">A callback delegate to execute when the pattern matches.</param>
    /// <param name="dictionary">A dictionary to hold the pattern parts. If null, the dictionary associated with brain's main memory is used.</param>
    /// <returns>The patterns are mapped to the handler and stored within the concept instance, but pattern entries are also returned if needed.</returns>
    AddConceptTriggerWords(string words, ConceptHandler handler, Dictionary dictionary = null) {
        if (string.IsNullOrWhiteSpace(words)) return;

        if (dictionary == null)
            dictionary = Brain?.Memory?.Dictionary ?? throw new ArgumentNullException("dictionary", "No dictionary was given, and 'this.Brain.Memory.Dictionary' is null.");

        List < DictionaryItem[] > dictionaryItems = new List<DictionaryItem[]>();

        dictionary = dictionary ?? Brain?.Memory?.Dictionary;
        if (dictionary == null) throw new ArgumentNullException("dictionary");

        var expectedWords = words.Split(new char[] { ' ', ',' }, StringSplitOptions.RemoveEmptyEntries);

        for (var i = 0; i < expectedWords.Length; ++i) {
            var wordpart = expectedWords[i];
            var worddetails = wordpart.Split(new char[] { '^' }, StringSplitOptions.RemoveEmptyEntries);
            var word = worddetails[0]; // (there's always at least 1 item)

            // (Note: if 'word' is empty, it is a wild card place holder for text)

            var posStr = worddetails.Length > 1 ? worddetails[1] : null;
            PartOfSpeech pos = null;
            DictionaryItem dicItem;

            if (word == "*")
                word = ""; // (in case user uses * for a wildcard at this point, just accept and convert it)
            else if (word.StartsWith("**"))
                word.Replace("**", "*"); // (double will be the escape for a single)

            if (!string.IsNullOrWhiteSpace(posStr)) {
                switch (posStr.ToUpper()) {
                    case "D": pos = POS.Determiner; break;
                    case "DD": pos = POS.Determiner_Definite; break;
                    case "DI": pos = POS.Determiner_Indefinite; break;

                    case "N": pos = POS.Noun; break;
                    case "NA": pos = POS.Noun_Action; break;
                    case "NC": pos = POS.Noun_Creature; break;
                    case "NO": pos = POS.Noun_Object; break;
                    case "NP": pos = POS.Noun_Person; break;
                    case "NPL": pos = POS.Noun_Place; break;
                    case "NQF": pos = POS.Noun_Quality_Or_Feeling; break;
                    case "NS": pos = POS.Noun_Spatial; break;
                    case "NT": pos = POS.Noun_Temporal; break;
                    case "NTR": pos = POS.Noun_Trait; break;

                    case "V": pos = POS.Verb; break;
                    case "VAP": pos = POS.Verb_AbleToOrPermitted; break;
                    case "VA": pos = POS.Verb_Action; break;
                    case "VIS": pos = POS.Verb_Is; break;
                    case "VO": pos = POS.Verb_Occurrence; break;
                    case "VS": pos = POS.Verb_State; break;

                    case "AV": pos = POS.Adverb; break;

                    case "A": pos = POS.Adjective; break;
                    case "AT": pos = POS.Adjective_Trait; break;

                    case "PN": pos = POS.Pronoun; break;
                    case "PNP": pos = POS.Pronoun_Possessive; break;
                    case "PS": pos = POS.Pronoun_Subject; break;

                    case "PP": pos = POS.Preposition; break;
                    case "PPA": pos = POS.Preposition_Amount; break;
                    case "PPC": pos = POS.Preposition_Contact; break;
                    case "PPD": pos = POS.Preposition_Directional; break;
                    case "PPE": pos = POS.Preposition_End; break;
                    case "PPI": pos = POS.Preposition_Including; break;
                    case "PPIN": pos = POS.Preposition_Intention; break;
                    case "PPINV": pos = POS.Preposition_Involvement; break;
                    case "PPO": pos = POS.Preposition_Onbehalf; break;
                    case "PPS": pos = POS.Preposition_Spatial; break;
                    case "PPST": pos = POS.Preposition_State; break;
                    case "PPSU": pos = POS.Preposition_Supporting; break;
                    case "PPT": pos = POS.Preposition_Temporal; break;
                    case "PPTW": pos = POS.Preposition_Towards; break;
                    case "PPUS": pos = POS.Preposition_Using; break;

                    case "&": pos = POS.Conjunction; break;
                    case "I": pos = POS.Interjection; break;
                    case "!": pos = POS.Exclamation; break;
                    case "IN": pos = POS.InfinitiveMarker; break;
                    case "#": pos = POS.Numeric; break;
                    case "$": pos = POS.Numeric_currency; break;
                    case "DA": pos = POS.Date; break;
                    case "TM": pos = POS.Time; break;
                    case "DT": pos = POS.Datetime; break;

                    default: throw new InvalidOperationException("Unknown part of speech code '" + pos + "': " + words);
                }
            }

            dicItem = string.IsNullOrWhiteSpace(word) ? dictionary.GlobalEntry
                : dictionary.AddTextPart(word, pos); // (this adds the word into the dictionary, build a small word base from the concept patterns)

            dicItem.AddConceptHandler(handler); // (dictionary items should reference back to the concepts that created them)
        }
    }

    // --- This is removed now in favor of concrete word matches, but pattern could be an add on later, so keep this old method idea for reference ---
    ///**
    * // Parses and adds a concept pattern and associates it with a callback handler.
        //*/
        ///// <param name="pattern">A text pattern that will trigger the handler.</param>
        ///// <param name="handler">A callback method to execute when the pattern matches.</param>
        ///// <param name="dictionary">A dictionary to hold the pattern parts. If null, the dictionary associated with brain's main memory is used.</param>
        ///// <returns>The patterns are mapped to the handler and stored within the concept instance, but pattern entries are also returned if needed.</returns>
        //public DictionaryItem[][] AddConceptPattern(string pattern, ConceptHandler handler, Dictionary dictionary = null)
        //{
        //    if (string.IsNullOrWhiteSpace(pattern)) return new DictionaryItem[0][];

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

        //            if (!string.IsNullOrWhiteSpace(posstr))
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

        //            dicItem = string.IsNullOrWhiteSpace(word) ? new DictionaryItem(null, null, pos)
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

        IsMatch(DictionaryItem left, DictionaryItem item, DictionaryItem right): boolean {
        return false;
    }

    // --------------------------------------------------------------------------------------------------------------------

    ///**
    * // Called when ready to trigger the concept to analyze it's position with other concepts in the scene instance.
    //*/
    ///// <param name="scene">The scene to trigger this concept against.</param>
    ///// <param name="textPartIndex">The position of the concept list in the '{Scene}.MatchedConceptLists' list that contains this concept.</param>
    ///// <param name="textpart"></param>
    //public Context Trigger(HandlerContext context)
    //{
    //    var handlers = _TextPartHandlers.Value((conceptMatch.MatchedConcepts.TextPart ?? "").ToLower());

    //    if (handlers == null) return 0;

    //    double? finalResult = null; // (null means "not sure", or "cannot complete", so try again)

    //    foreach (var handler in handlers)
    //    {
    //        var result = handler(scene, conceptMatch);
    //        if (result > finalResult)
    //            finalResult = result;
    //    }

    //    return finalResult;
    //}

    // --------------------------------------------------------------------------------------------------------------------
}
