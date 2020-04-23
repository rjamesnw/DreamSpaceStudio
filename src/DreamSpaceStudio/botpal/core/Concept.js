"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConceptHandlerContext = exports.IntentHandlerAttribute = exports.ConceptHandlerAttribute = exports.ConceptAttribute = void 0;
const Match_1 = require("./Match");
function ConceptAttribute(classFn, enabled = true) {
    var o = classFn;
    o.enabled = enabled;
}
exports.ConceptAttribute = ConceptAttribute;
/// <summary>
/// Associates a method on a derived 'Concept' class with words that will trigger it.
/// </summary>
function ConceptHandlerAttribute(classFn, triggerWords, pattern = null) {
    var o = classFn;
    // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
    /// <param name="triggerWords">Words that will trigger this concept.  You can append a caret (^) to a word to set a part of speech (i.e. "w1^N,w2^V" makes w1 a noun and w2 a verb).</param>
    /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
    /// To create a different pattern for different words, use multiple attributes on the same method.</param>
    o.triggerWords = triggerWords;
    o.pattern = pattern;
}
exports.ConceptHandlerAttribute = ConceptHandlerAttribute;
/// <summary>
/// Associates a method on a derived 'Concept' class with words that will trigger it.
/// </summary>
function IntentHandlerAttribute(classFn, triggerWords, pattern = null) {
    var o = classFn;
    // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
    /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
    /// To create a different pattern for different words, use multiple attributes on the same method.</param>
    o.triggerWords = triggerWords;
    o.pattern = pattern;
}
exports.IntentHandlerAttribute = IntentHandlerAttribute;
/// <summary>
/// Holds the score and other parameters for concepts while trying to find best concept matches.
/// </summary>
class ConceptMatch extends Match_1.default {
    constructor(owner, conceptContext, score = null) {
        super(conceptContext, score);
        this._owner = owner;
    }
}
exports.default = ConceptMatch;
/// <summary>
/// The context for the concept handler call. 
/// This object maintains an array of concepts, starting from the left side, and growing towards the right.
/// As the ProcessConceptsOperation instance processes combinations, it clones contexts and expands the
/// matched concepts array to match a new combination of concepts.
/// <para>Note that the context is shared by each handler called in the call chain, and only the 'Index' value (and resulting 'LeftHandlerContext,MatchedConcept,RightHandlerContext' references) is specific to the called handler itself.</para>
/// </summary>
class ConceptHandlerContext {
}
exports.ConceptHandlerContext = ConceptHandlerContext;
{
    get;
    {
        return Operation.Memory;
    }
}
ProcessConceptsOperation;
Operation;
IntentContext;
Context;
double;
Confidence;
double;
ConfidenceSum;
double;
AvergeConfidence;
{
    get;
    {
        return ConfidenceSum / (Index + 1);
    }
}
List < List < Match_1.default < IntentHandler >>> ProbableIntentHandlers;
bool;
HasProbableIntentHandlers;
{
    get;
    {
        return (_a = ProbableIntentHandlers === null || ProbableIntentHandlers === void 0 ? void 0 : ProbableIntentHandlers.Any(i => i.Count > 0)) !== null && _a !== void 0 ? _a : false;
    }
}
List < ConceptMatch > MatchedConcepts;
int;
Index;
ConceptMatch;
LeftHandlerMatch;
{
    get;
    {
        return Index > 0 && Index <= (MatchedConcepts === null || MatchedConcepts === void 0 ? void 0 : MatchedConcepts.Count) ? MatchedConcepts[Index - 1] : null;
    }
}
ConceptMatch;
CurrentMatch;
{
    get;
    {
        return Index >= 0 && Index < (MatchedConcepts === null || MatchedConcepts === void 0 ? void 0 : MatchedConcepts.Count) ? MatchedConcepts[Index] : null;
    }
}
DictionaryItem;
CurrentDictionaryItem => CurrentMatch === null || CurrentMatch === void 0 ? void 0 : CurrentMatch.Item.DictionaryItem;
ConceptMatch;
RightHandlerMatch;
{
    get;
    {
        return Index >= -1 && Index + 1 < (MatchedConcepts === null || MatchedConcepts === void 0 ? void 0 : MatchedConcepts.Count) ? MatchedConcepts[Index + 1] : null;
    }
}
ConceptHandlerContext(ProcessConceptsOperation, operation, int, index, int ? initialMatchedConceptsCapacity = null : );
{
    Operation = operation !== null && operation !== void 0 ? operation : ;
    throw new ArgumentNullException(nameof(operation));
    Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
    Index = index;
    Confidence = 0.0;
    d;
    ConfidenceSum = 0.0;
    d;
    MatchedConcepts = initialMatchedConceptsCapacity != null
        ? new List(initialMatchedConceptsCapacity.Value) : new List();
    ProbableIntentHandlers = new List();
}
ConceptHandlerContext(ProcessConceptsOperation, operation, int, index, IEnumerable < ConceptMatch > initialMatchedConcepts, IEnumerable < IEnumerable < Match_1.default < IntentHandler >>> probableIntentHandlers, null);
{
    Operation = operation !== null && operation !== void 0 ? operation : ;
    throw new ArgumentNullException(nameof(operation));
    Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
    Index = index;
    Confidence = 0.0;
    d;
    ConfidenceSum = 0.0;
    d;
    MatchedConcepts = initialMatchedConcepts != null ? new List(initialMatchedConcepts) : new List();
    ProbableIntentHandlers = probableIntentHandlers != null
        ? new List(probableIntentHandlers.Select(h => h != null ? new List(h).SortMatches() : null))
        : new List();
}
ConceptHandlerContext(ProcessConceptsOperation, operation, int, index, ConceptMatch, matchedConcept);
{
    Operation = operation !== null && operation !== void 0 ? operation : ;
    throw new ArgumentNullException(nameof(operation));
    Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
    Index = index;
    Confidence = 0.0;
    d;
    ConfidenceSum = 0.0;
    d;
    MatchedConcepts = new List();
    ProbableIntentHandlers = new List();
    if (matchedConcept != null)
        MatchedConcepts.Add(matchedConcept);
}
ConceptHandlerContext;
Clone(int, index, ConceptMatch, matchedConcept);
{
    IEnumerable < ConceptMatch > matchedConceptsCopy;
    MatchedConcepts;
    if (matchedConcept != null)
        matchedConceptsCopy = MatchedConcepts.Concat(new ConceptMatch[], { matchedConcept });
    return new ConceptHandlerContext(Operation, index, matchedConceptsCopy, ProbableIntentHandlers);
    {
        Context = Context,
            ConfidenceSum = ConfidenceSum; // (note: 'Confidence' is NEVER copied, as it must be 0 for each new concept handler call)
    }
    ;
}
ConceptHandlerContext;
SetConfidence(double, confidence);
{
    Confidence = confidence;
    return this;
}
void AddIntentHandler(IntentHandler, handler, double, confidence);
{
    // ... Keep added handlers at the same position of this current context index ...
    for (var i = 0; i <= Index; ++i)
        ProbableIntentHandlers.Add(null);
    List < Match_1.default < IntentHandler >> handlers;
    // ... get the sorted intent handler set, or create a new entry ...
    if (ProbableIntentHandlers[Index] == null)
        ProbableIntentHandlers[Index] = handlers = new List();
    else
        handlers = ProbableIntentHandlers[Index];
    handlers.Add(new Match_1.default(handler, confidence));
    //? var confidence = ProbableIntentHandlers.Sum(h => h.Score ?? 0d) / ProbableIntentHandlers.Count; // (calculates average based on all added intents for this curren context)
    double;
    topCurrentConfidence = (_b = handlers.Max(i => i.Score)) !== null && _b !== void 0 ? _b : 0;
    d;
    if (Confidence < topCurrentConfidence)
        Confidence = topCurrentConfidence; // (the handler context confidence should be the highest of all intent handlers)
}
bool;
IsNext(string, text, bool, exactMatch = false);
{
    if (RightHandlerMatch == null)
        return string.IsNullOrWhiteSpace(text);
    if (exactMatch) {
        return (text !== null && text !== void 0 ? text : "") == ((_c = RightHandlerMatch === null || RightHandlerMatch === void 0 ? void 0 : RightHandlerMatch.Item.DictionaryItem.TextPart.Text) !== null && _c !== void 0 ? _c : "");
    }
    else {
        var grpkey = string.IsNullOrWhiteSpace(text) ? null : Memory === null || Memory === void 0 ? void 0 : Memory.Brain.ToGroupKey(text);
        return grpkey == RightHandlerMatch.Item.DictionaryItem.TextPart.GroupKey;
    }
}
bool;
WasPrevious(string, text, bool, exactMatch = false);
{
    if (LeftHandlerMatch == null)
        return string.IsNullOrWhiteSpace(text);
    if (exactMatch) {
        return (text !== null && text !== void 0 ? text : "") == ((_d = LeftHandlerMatch === null || LeftHandlerMatch === void 0 ? void 0 : LeftHandlerMatch.Item.DictionaryItem.TextPart.Text) !== null && _d !== void 0 ? _d : "");
    }
    else {
        var grpkey = string.IsNullOrWhiteSpace(text) ? null : Memory === null || Memory === void 0 ? void 0 : Memory.Brain.ToGroupKey(text);
        return grpkey == LeftHandlerMatch.Item.DictionaryItem.TextPart.GroupKey;
    }
}
/// <summary>
/// Created when concept handlers are found that match a text part that was parsed from user input.
/// </summary>
class ConceptContext {
}
{
    get;
    set;
}
Concept;
Concept;
{
    get;
    {
        return (Concept);
        Handler.Target;
    }
}
ConceptHandler;
Handler;
{
    get;
    set;
}
ConceptContext(DictionaryItem, dictionaryItem, ConceptHandler, handler);
{
    DictionaryItem = dictionaryItem !== null && dictionaryItem !== void 0 ? dictionaryItem : ;
    throw new ArgumentNullException(nameof(dictionaryItem));
    Handler = handler !== null && handler !== void 0 ? handler : ;
    throw new ArgumentNullException(nameof(handler));
}
/// <summary>
/// Holds all concepts that match a particular text part during text processing.
/// </summary>
class MatchedConcepts {
}
List < ConceptMatch >
    {
        // --------------------------------------------------------------------------------------------------------------------
        /// <summary>
        /// The original text part from the input text that resulted in the underlying set of concepts (not from a dictionary item).
        /// </summary>
        string, OriginalTextPart,
        /// <summary>
        /// The position of where the underlying original text part is in relation to the other text parts in the array of original text parts.
        /// </summary>
        int, OriginalTextPartIndex
    }(textPartIndex);
{
    if (string.IsNullOrEmpty(textpart))
        throw new ArgumentNullException("A text part cannot be null, empty, or white text.");
    OriginalTextPart = textpart;
}
internal;
MatchedConcepts(int, textPartIndex);
{
    if (textPartIndex < 0)
        throw new ArgumentNullException("The text part index must be greater or equal to 0.");
    OriginalTextPartIndex = textPartIndex;
}
// --------------------------------------------------------------------------------------------------------------------
/// <summary>
/// Sorts all items in this list and returns the list.
/// </summary>
new public;
MatchedConcepts;
Sort();
{
    Sort(ConceptMatch.DefaultComparer);
    return this;
}
void Add(ConceptContext, c, double ? score = null : );
{
    base.Add(new ConceptMatch(this, c, score));
}
void Add(Match_1.default < ConceptContext > match);
{
    Add(match.Item, match.Score);
}
/// <summary>
/// A concept is a mapping to some sort of understanding or intention. For instance, if the user wants to find a file on their computer,
/// a general "Files", or perhaps more specific "FileSearch" concept might be triggered if that concept is determined to be the best match
/// to the user's intention. Concepts are loaded and activated as singleton instances.  Only one instance of each type is created per bot
/// instance, and each concept is passed a ConceptContext for it to use when processing inputs it is designed to handle.
/// Being a singleton, concepts can also be plugins for global states, such as tracking a bots simulated "feeling" level, or states that
/// are updated by external hooks (for instance, polling for emails or IM streams, detecting light brightness, sound activity, etc.).
/// <para>
/// If the bot has no concept of anything, it will not be able to understand any requests or thought processes. In such a case, 
/// all inputs are simply parsed and recorded with no responses possible (brain-dead like state).</para>
/// <para>Internally, concepts build a tree of context objects (such as subjects and attributes) to handle various situations by analyzing
/// surrounding concepts that were found based on user inputs in order to detect possible meanings. 
/// Each concept handler result is test from 0.0 to 1.0 to determine the most likely course that makes more sense.</para>
/// <para>For concept creators, a single instance of each derived concept found or registered is created and cached as singletons for text processing.</para>
/// </summary>
class Concept {
}
TimeReferencedObject, IMemoryObject;
{
    Brain;
    Brain;
    {
        get;
        set;
    }
    Memory;
    Memory;
    {
        get;
        {
            return Brain.Memory;
        }
    }
    Concept(Brain, brain);
    {
        if (brain == null)
            throw new ArgumentNullException("brain");
        Brain = brain;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary> Executes once the after all core system concepts have been registered. </summary>
    internal;
    virtual;
    void OnAfterAllRegistered();
    { }
    Dictionary < ConceptHandler, DictionaryItem[] > _ConceptPatterns;
    new Dictionary();
    void RegisterHandlers();
    {
        var methods = GetType().GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.FlattenHierarchy);
        foreach();
        var method;
         in methods;
        {
            // ... since a handler can have many trigger words and/or patterns, look for and process multiple attributes ...
            var attributes = method.GetCustomAttributes();
            if (!((_e = attributes === null || attributes === void 0 ? void 0 : attributes.Any()) !== null && _e !== void 0 ? _e : false))
                continue;
            foreach();
            var attr;
             in attributes;
            {
                if (string.IsNullOrWhiteSpace(attr.TriggerWords))
                    continue;
                // ... else this method is a handler for this concept; register the method with the text ...
                //? if (_Concepts.ContainsKey(attr.Pattern))
                //?     System.Diagnostics.Debug.WriteLine("The concept type '" + concept.Name + "' contains pattern '" + attr.Pattern + "' which matches another pattern on concept '" + _Concepts[attr.Pattern].GetType().Name + "'. Try to avoid duplicate patterns and be more specific if possible.", "Warning");
                try {
                    AddConceptTriggerWords(attr.TriggerWords, (ConceptHandler), method.CreateDelegate(typeof (ConceptHandler), this));
                }
                catch (Exception) { }
                ex;
                {
                    Brain.ConceptHandlerLoadErrors.Add(new Exception("Failed to register concept handler " + method.ToString() + ": \r\n" + ex.Message, ex));
                }
                //? if (_Concepts[attr.Pattern] == null)
                //?     _Concepts[attr.Pattern] = new List<Concept>();
                //? _Concepts[attr.Pattern].Add(conceptInstance);
            }
        }
    }
    void AddConceptTriggerWords(string, words, ConceptHandler, handler, Dictionary, dictionary = null);
    {
        if (string.IsNullOrWhiteSpace(words))
            return;
        if (dictionary == null)
            dictionary = (_g = (_f = Brain === null || Brain === void 0 ? void 0 : Brain.Memory) === null || _f === void 0 ? void 0 : _f.Dictionary) !== null && _g !== void 0 ? _g : ;
        throw new ArgumentNullException("dictionary", "No dictionary was given, and 'this.Brain.Memory.Dictionary' is null.");
        List < DictionaryItem[] > dictionaryItems;
        new List();
        dictionary = dictionary !== null && dictionary !== void 0 ? dictionary : (_h = Brain === null || Brain === void 0 ? void 0 : Brain.Memory) === null || _h === void 0 ? void 0 : _h.Dictionary;
        if (dictionary == null)
            throw new ArgumentNullException("dictionary");
        var expectedWords = words.Split(new char[], { ' ': , ',':  }, StringSplitOptions.RemoveEmptyEntries);
        for (var i = 0; i < expectedWords.Length; ++i) {
            var wordpart = expectedWords[i];
            var worddetails = wordpart.Split(new char[], { '^':  }, StringSplitOptions.RemoveEmptyEntries);
            var word = worddetails[0]; // (there's always at least 1 item)
            // (Note: if 'word' is empty, it is a wild card place holder for text)
            var posStr = worddetails.Length > 1 ? worddetails[1] : null;
            PartOfSpeech;
            pos = null;
            DictionaryItem;
            dicItem;
            if (word == "*")
                word = ""; // (in case user uses * for a wildcard at this point, just accept and convert it)
            else if (word.StartsWith("**"))
                word.Replace("**", "*"); // (double will be the escape for a single)
            if (!string.IsNullOrWhiteSpace(posStr)) {
                switch (posStr.ToUpper()) {
                    case "D":
                        pos = POS.Determiner;
                        break;
                    case "DD":
                        pos = POS.Determiner_Definite;
                        break;
                    case "DI":
                        pos = POS.Determiner_Indefinite;
                        break;
                    case "N":
                        pos = POS.Noun;
                        break;
                    case "NA":
                        pos = POS.Noun_Action;
                        break;
                    case "NC":
                        pos = POS.Noun_Creature;
                        break;
                    case "NO":
                        pos = POS.Noun_Object;
                        break;
                    case "NP":
                        pos = POS.Noun_Person;
                        break;
                    case "NPL":
                        pos = POS.Noun_Place;
                        break;
                    case "NQF":
                        pos = POS.Noun_Quality_Or_Feeling;
                        break;
                    case "NS":
                        pos = POS.Noun_Spatial;
                        break;
                    case "NT":
                        pos = POS.Noun_Temporal;
                        break;
                    case "NTR":
                        pos = POS.Noun_Trait;
                        break;
                    case "V":
                        pos = POS.Verb;
                        break;
                    case "VAP":
                        pos = POS.Verb_AbleToOrPermitted;
                        break;
                    case "VA":
                        pos = POS.Verb_Action;
                        break;
                    case "VIS":
                        pos = POS.Verb_Is;
                        break;
                    case "VO":
                        pos = POS.Verb_Occurrence;
                        break;
                    case "VS":
                        pos = POS.Verb_State;
                        break;
                    case "AV":
                        pos = POS.Adverb;
                        break;
                    case "A":
                        pos = POS.Adjective;
                        break;
                    case "AT":
                        pos = POS.Adjective_Trait;
                        break;
                    case "PN":
                        pos = POS.Pronoun;
                        break;
                    case "PNP":
                        pos = POS.Pronoun_Possessive;
                        break;
                    case "PS":
                        pos = POS.Pronoun_Subject;
                        break;
                    case "PP":
                        pos = POS.Preposition;
                        break;
                    case "PPA":
                        pos = POS.Preposition_Amount;
                        break;
                    case "PPC":
                        pos = POS.Preposition_Contact;
                        break;
                    case "PPD":
                        pos = POS.Preposition_Directional;
                        break;
                    case "PPE":
                        pos = POS.Preposition_End;
                        break;
                    case "PPI":
                        pos = POS.Preposition_Including;
                        break;
                    case "PPIN":
                        pos = POS.Preposition_Intention;
                        break;
                    case "PPINV":
                        pos = POS.Preposition_Involvement;
                        break;
                    case "PPO":
                        pos = POS.Preposition_Onbehalf;
                        break;
                    case "PPS":
                        pos = POS.Preposition_Spatial;
                        break;
                    case "PPST":
                        pos = POS.Preposition_State;
                        break;
                    case "PPSU":
                        pos = POS.Preposition_Supporting;
                        break;
                    case "PPT":
                        pos = POS.Preposition_Temporal;
                        break;
                    case "PPTW":
                        pos = POS.Preposition_Towards;
                        break;
                    case "PPUS":
                        pos = POS.Preposition_Using;
                        break;
                    case "&":
                        pos = POS.Conjunction;
                        break;
                    case "I":
                        pos = POS.Interjection;
                        break;
                    case "!":
                        pos = POS.Exclamation;
                        break;
                    case "IN":
                        pos = POS.InfinitiveMarker;
                        break;
                    case "#":
                        pos = POS.Numeric;
                        break;
                    case "$":
                        pos = POS.Numeric_currency;
                        break;
                    case "DA":
                        pos = POS.Date;
                        break;
                    case "TM":
                        pos = POS.Time;
                        break;
                    case "DT":
                        pos = POS.Datetime;
                        break;
                    default: throw new InvalidOperationException("Unknown part of speech code '" + pos + "': " + words);
                }
            }
            dicItem = string.IsNullOrWhiteSpace(word) ? dictionary.GlobalEntry
                : dictionary.AddTextPart(word, pos); // (this adds the word into the dictionary, build a small word base from the concept patterns)
            dicItem.AddConceptHandler(handler); // (dictionary items should reference back to the concepts that created them)
        }
    }
    bool;
    IsMatch(DictionaryItem, left, DictionaryItem, item, DictionaryItem, right);
    {
        return false;
    }
    // --------------------------------------------------------------------------------------------------------------------
    ///// <summary>
    ///// Called when ready to trigger the concept to analyze it's position with other concepts in the scene instance.
    ///// </summary>
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
//# sourceMappingURL=Concept.js.map