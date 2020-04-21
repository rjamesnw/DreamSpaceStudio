using BotPal.Utilities;
using Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace BotPal
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
    public class ConceptAttribute : System.Attribute
    {
        public readonly bool Enabled;
        public ConceptAttribute(bool enabled = true)
        {
            Enabled = enabled;
        }
    }

    /// <summary>
    /// Associates a method on a derived 'Concept' class with words that will trigger it.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class ConceptHandlerAttribute : System.Attribute
    {
        public readonly string TriggerWords;
        public readonly string Pattern;
        // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
        /// <param name="triggerWords">Words that will trigger this concept.  You can append a caret (^) to a word to set a part of speech (i.e. "w1^N,w2^V" makes w1 a noun and w2 a verb).</param>
        /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
        /// To create a different pattern for different words, use multiple attributes on the same method.</param>
        public ConceptHandlerAttribute(string triggerWords, string pattern = null)
        {
            TriggerWords = triggerWords;
            Pattern = pattern;
        }
    }

    /// <summary>
    /// Associates a method on a derived 'Concept' class with words that will trigger it.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class IntentHandlerAttribute : System.Attribute
    {
        public readonly string TriggerWords;
        public readonly string Pattern;
        // (note: good tool to use to check for POS: https://foxtype.com/sentence-tree)
        /// <param name="pattern">(not yet supported) A pattern to use for ALL trigger words, which is just a more complex criteria that must be settled for running the handler.
        /// To create a different pattern for different words, use multiple attributes on the same method.</param>
        public IntentHandlerAttribute(string pattern)
        {
            Pattern = pattern;
        }
    }

    /// <summary>
    /// Holds the score and other parameters for concepts while trying to find best concept matches.
    /// </summary>
    public class ConceptMatch : Match<ConceptContext>
    {
        public readonly MatchedConcepts Owner; // (the concepts set that owns this concept match)
        public ConceptMatch(MatchedConcepts owner, ConceptContext conceptContext, double? score = null) : base(conceptContext, score)
        {
            Owner = owner;
        }
    }

    //? public delegate Context TextPartHandler(HandlerContext context);
    /// <summary>
    /// A method on a concept that will handle given key words.
    /// </summary>
    /// <param name="context">A context struct to hold the context for a handler call.</param>
    /// <returns>The return should be the same or updated copy of the given context.</returns>
    public delegate Task<ConceptHandlerContext> ConceptHandler(ConceptHandlerContext context);

    /// <summary>
    /// A handler to execute on a concept to process the most likely intent that was detected.
    /// If the intent handler encounters issues with understanding the data, it can either spawn questions and return true, or give up and return false.
    /// Returning false causes the next best handler, if any, to execute.
    /// </summary>
    /// <param name="context">After all input is processed and concept handlers are run, the intent with the best score is executed.</param>
    /// <returns>True if the intent was handled. If for some reason the intent cannot be handled, false can be returned to cause the next handler (if any) to execute instead.</returns>
    public delegate Task<bool> IntentHandler(ConceptHandlerContext context);

    /// <summary>
    /// The context for the concept handler call. 
    /// This object maintains an array of concepts, starting from the left side, and growing towards the right.
    /// As the ProcessConceptsOperation instance processes combinations, it clones contexts and expands the
    /// matched concepts array to match a new combination of concepts.
    /// <para>Note that the context is shared by each handler called in the call chain, and only the 'Index' value (and resulting 'LeftHandlerContext,MatchedConcept,RightHandlerContext' references) is specific to the called handler itself.</para>
    /// </summary>
    public struct ConceptHandlerContext : IMemoryObject
    {
        // --------------------------------------------------------------------------------------------------------------------

        public Memory Memory { get { return Operation.Memory; } }

        /// <summary>
        /// The current brain task operation that is processing the concepts.
        /// </summary>
        public readonly ProcessConceptsOperation Operation;

        /// <summary>
        /// The new or existing context that is the result of various concept handlers. It is used to build the content of the user's intent.
        /// New contexts should be added or associated as required, or data loss will occur; causing much confusion.
        /// An intent context is shared globally within a single text-part-combination path and helps to build the over all intent of the user.
        /// </summary>
        public IntentContext Context;

        /// <summary>
        /// When a concept returns a context, it also sets a confidence level from 0.0 to 1.0 on how sure it is that it is the direction of intent by the user.
        /// </summary>
        public double Confidence;

        /// <summary>
        /// Upon return from a concept handler, the system keeps track of the confidence total to calculate an average later.
        /// </summary>
        public double ConfidenceSum;

        /// <summary> Gets the average confidence at the current <see cref="Index"/>. </summary>
        /// <value> The average confidence. </value>
        public double AvergeConfidence { get { return ConfidenceSum / (Index + 1); } }

        /// <summary>
        /// A match to a handler that might be able to process the most likely intent of the user.
        /// </summary>
        public List<List<Match<IntentHandler>>> ProbableIntentHandlers;

        /// <summary>
        /// Returns true if this context has any callbacks to handler intents (user input meanings).
        /// </summary>
        public bool HasProbableIntentHandlers { get { return ProbableIntentHandlers?.Any(i => i.Count > 0) ?? false; } }

        /// <summary>
        /// A growing list of executing concepts that were matched against user input.
        /// The list is growing because the final list is not known until initial handlers execute early to catch any invalid combinations.
        /// </summary>
        public List<ConceptMatch> MatchedConcepts;

        /// <summary>
        /// The current index of the current matched concept in relation to other handlers being executed.
        /// </summary>
        public int Index;

        /// <summary>
        /// For concept handlers, this is the concept matched to the immediate left.
        /// </summary>
        public ConceptMatch LeftHandlerMatch { get { return Index > 0 && Index <= MatchedConcepts?.Count ? MatchedConcepts[Index - 1] : null; } }

        /// <summary>
        /// For concept handlers, this is the current concept match details (the one the handler belongs to).
        /// </summary>
        public ConceptMatch CurrentMatch { get { return Index >= 0 && Index < MatchedConcepts?.Count ? MatchedConcepts[Index] : null; } }

        /// <summary> Gets the dictionary item that resulted in the current concept match. </summary>
        /// <value> The dictionary item of the current concept match. </value>
        public DictionaryItem CurrentDictionaryItem => CurrentMatch?.Item.DictionaryItem;

        /// <summary>
        /// For concept handlers, this is the concept matched to the immediate right.
        /// </summary>
        public ConceptMatch RightHandlerMatch { get { return Index >= -1 && Index + 1 < MatchedConcepts?.Count ? MatchedConcepts[Index + 1] : null; } }

        // --------------------------------------------------------------------------------------------------------------------

        public ConceptHandlerContext(ProcessConceptsOperation operation, int index, int? initialMatchedConceptsCapacity = null)
        {
            Operation = operation ?? throw new ArgumentNullException(nameof(operation));
            Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
            Index = index;
            Confidence = 0.0d;
            ConfidenceSum = 0.0d;
            MatchedConcepts = initialMatchedConceptsCapacity != null
                ? new List<ConceptMatch>(initialMatchedConceptsCapacity.Value) : new List<ConceptMatch>();
            ProbableIntentHandlers = new List<List<Match<IntentHandler>>>();
        }

        public ConceptHandlerContext(ProcessConceptsOperation operation, int index, IEnumerable<ConceptMatch> initialMatchedConcepts, IEnumerable<IEnumerable<Match<IntentHandler>>> probableIntentHandlers = null)
        {
            Operation = operation ?? throw new ArgumentNullException(nameof(operation));
            Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
            Index = index;
            Confidence = 0.0d;
            ConfidenceSum = 0.0d;
            MatchedConcepts = initialMatchedConcepts != null ? new List<ConceptMatch>(initialMatchedConcepts) : new List<ConceptMatch>();
            ProbableIntentHandlers = probableIntentHandlers != null
                ? new List<List<Match<IntentHandler>>>(probableIntentHandlers.Select(h => h != null ? new List<Match<IntentHandler>>(h).SortMatches() : null))
                : new List<List<Match<IntentHandler>>>();
        }

        public ConceptHandlerContext(ProcessConceptsOperation operation, int index, ConceptMatch matchedConcept)
        {
            Operation = operation ?? throw new ArgumentNullException(nameof(operation));
            Context = new IntentContext(operation.Memory); // (try to always start with a default root context when possible; the Concept reference is null since this root context was not created by a concept)
            Index = index;
            Confidence = 0.0d;
            ConfidenceSum = 0.0d;
            MatchedConcepts = new List<ConceptMatch>();
            ProbableIntentHandlers = new List<List<Match<IntentHandler>>>();
            if (matchedConcept != null)
                MatchedConcepts.Add(matchedConcept);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Makes a copy of the 'MatchedConcepts' list with 'matchedConcept' appended and returns it as a new 'ConceptHandlerContext' value.
        /// This is used to multiply contexts when processing concept combinations.
        /// </summary>
        /// <returns>A new concept handler context to use with calling concept handlers.
        /// The clone is returned with a 0.0 Confidence value and the 'matchedConcept' reference added.</returns>
        public ConceptHandlerContext Clone(int index, ConceptMatch matchedConcept)
        {
            IEnumerable<ConceptMatch> matchedConceptsCopy = MatchedConcepts;

            if (matchedConcept != null)
                matchedConceptsCopy = MatchedConcepts.Concat(new ConceptMatch[] { matchedConcept });

            return new ConceptHandlerContext(Operation, index, matchedConceptsCopy, ProbableIntentHandlers)
            {
                Context = Context,
                ConfidenceSum = ConfidenceSum // (note: 'Confidence' is NEVER copied, as it must be 0 for each new concept handler call)
            };
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Provides a convenient way to return a context with a modified confidence value.
        /// </summary>
        /// <param name="confidence">The new confidence value.</param>
        public ConceptHandlerContext SetConfidence(double confidence)
        {
            Confidence = confidence;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Registers a possible handler to process the intent based on the most likely meaning of the context tree generated from the concept handlers.
        /// <para>If the handler context confidence value is less than the given confidence value for the intent handler, the handler context confidence will be updated to match.</para>
        /// </summary>
        /// <param name="handler">The intent callback to execute to handle the meaning of the input given by the user.</param>
        /// <param name="confidence">How much confidence that this registered handler can handle the user's meaning.</param>
        public void AddIntentHandler(IntentHandler handler, double confidence)
        {
            // ... Keep added handlers at the same position of this current context index ...

            for (var i = 0; i <= Index; ++i)
                ProbableIntentHandlers.Add(null);

            List<Match<IntentHandler>> handlers;

            // ... get the sorted intent handler set, or create a new entry ...

            if (ProbableIntentHandlers[Index] == null)
                ProbableIntentHandlers[Index] = handlers = new List<Match<IntentHandler>>();
            else
                handlers = ProbableIntentHandlers[Index];

            handlers.Add(new Match<IntentHandler>(handler, confidence));

            //? var confidence = ProbableIntentHandlers.Sum(h => h.Score ?? 0d) / ProbableIntentHandlers.Count; // (calculates average based on all added intents for this curren context)
            double topCurrentConfidence = handlers.Max(i => i.Score) ?? 0d;
            if (Confidence < topCurrentConfidence) Confidence = topCurrentConfidence; // (the handler context confidence should be the highest of all intent handlers)
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the given text matches any following text.
        /// The match relies on a group key, which is the text processed to remove
        /// </summary>
        /// <param name="text">The text to look for.</param>
        /// <param name="exactMatch">If false (default) then a group key is used to match similar text (such as removing letter casing and reducing spaces, etc.).</param>
        /// <returns></returns>
        public bool IsNext(string text, bool exactMatch = false)
        {
            if (RightHandlerMatch == null) return string.IsNullOrWhiteSpace(text);
            if (exactMatch)
            {
                return (text ?? "") == (RightHandlerMatch?.Item.DictionaryItem.TextPart.Text ?? "");
            }
            else
            {
                var grpkey = string.IsNullOrWhiteSpace(text) ? null : Memory?.Brain.ToGroupKey(text);
                return grpkey == RightHandlerMatch.Item.DictionaryItem.TextPart.GroupKey;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the given text matches any preceding text.
        /// The match relies on a group key, which is the text processed to remove
        /// </summary>
        /// <param name="text">The text to look for.</param>
        /// <param name="exactMatch">If false (default) then a group key is used to match similar text (such as removing letter casing and reducing spaces, etc.).</param>
        /// <returns></returns>
        public bool WasPrevious(string text, bool exactMatch = false)
        {
            if (LeftHandlerMatch == null) return string.IsNullOrWhiteSpace(text);
            if (exactMatch)
            {
                return (text ?? "") == (LeftHandlerMatch?.Item.DictionaryItem.TextPart.Text ?? "");
            }
            else
            {
                var grpkey = string.IsNullOrWhiteSpace(text) ? null : Memory?.Brain.ToGroupKey(text);
                return grpkey == LeftHandlerMatch.Item.DictionaryItem.TextPart.GroupKey;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    /// <summary>
    /// Created when concept handlers are found that match a text part that was parsed from user input.
    /// </summary>
    public class ConceptContext
    {
        /// <summary>
        /// The dictionary item when the concept was found.
        /// </summary>
        public DictionaryItem DictionaryItem { get; private set; }
        /// <summary>
        /// The concept for this context.
        /// </summary>
        public Concept Concept { get { return (Concept)Handler.Target; } }
        /// <summary>
        /// The handler of the underlying concept that matches the text part (that will be used to process it).
        /// </summary>
        public ConceptHandler Handler { get; private set; }

        public ConceptContext(DictionaryItem dictionaryItem, ConceptHandler handler)
        {
            DictionaryItem = dictionaryItem ?? throw new ArgumentNullException(nameof(dictionaryItem));
            Handler = handler ?? throw new ArgumentNullException(nameof(handler));
        }
    }

    /// <summary>
    /// Holds all concepts that match a particular text part during text processing.
    /// </summary>
    public class MatchedConcepts : List<ConceptMatch>
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The original text part from the input text that resulted in the underlying set of concepts (not from a dictionary item).
        /// </summary>
        public readonly string OriginalTextPart;

        /// <summary>
        /// The position of where the underlying original text part is in relation to the other text parts in the array of original text parts.
        /// </summary>
        public readonly int OriginalTextPartIndex;

        // --------------------------------------------------------------------------------------------------------------------

        public MatchedConcepts(string textpart, int textPartIndex) : this(textPartIndex)
        {
            if (string.IsNullOrEmpty(textpart))
                throw new ArgumentNullException("A text part cannot be null, empty, or white text.");

            OriginalTextPart = textpart;
        }

        internal MatchedConcepts(int textPartIndex)
        {
            if (textPartIndex < 0)
                throw new ArgumentNullException("The text part index must be greater or equal to 0.");

            OriginalTextPartIndex = textPartIndex;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Sorts all items in this list and returns the list.
        /// </summary>
        new public MatchedConcepts Sort()
        {
            Sort(ConceptMatch.DefaultComparer);
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public void Add(ConceptContext c, double? score = null)
        {
            base.Add(new ConceptMatch(this, c, score));
        }

        public void Add(Match<ConceptContext> match)
        {
            Add(match.Item, match.Score);
        }

        // --------------------------------------------------------------------------------------------------------------------
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
    public abstract class Concept : TimeReferencedObject, IMemoryObject
    {
        // --------------------------------------------------------------------------------------------------------------------

        public Brain Brain { get; private set; }

        public Memory Memory { get { return Brain.Memory; } }

        // --------------------------------------------------------------------------------------------------------------------

        ///// <summary>
        ///// The expected dictionary items used in the derived concept which is used to analyze the incoming dictionary items based on user input.
        ///// It is recommended to use '_AddWord()' to add these items, and not do so directly.
        ///// </summary>
        //protected Dictionary<string, List<TextPartHandler>> _TextPartHandlers = new Dictionary<string, List<TextPartHandler>>();

        public Concept(Brain brain)
        {
            if (brain == null)
                throw new ArgumentNullException("brain");

            Brain = brain;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Executes once the after all core system concepts have been registered. </summary>
        internal virtual void OnAfterAllRegistered() { }

        // --------------------------------------------------------------------------------------------------------------------

        ///// <summary>
        ///// Registers text that should trigger this concept.  When the text is encountered, the concept's matching handler registered for that text will be triggered.
        ///// <para>Note: POS, tense, and plurality MUST all match the same context as an existing word in the database, or a new entry will be created.</para>
        ///// </summary>
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

        /// <summary>
        /// A dictionary of concept handlers and the dictionary items they support.
        /// This is populated when the brain loads the concept and calls 'RegisterHandlers()'.
        /// </summary>
        protected Dictionary<ConceptHandler, DictionaryItem[]> _ConceptPatterns = new Dictionary<ConceptHandler, DictionaryItem[]>();

        /// <summary>
        /// Called by the system when it is ready for this concept to register any handlers on it.
        /// </summary>
        public void RegisterHandlers()
        {
            var methods = GetType().GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.FlattenHierarchy);
            foreach (var method in methods)
            {
                // ... since a handler can have many trigger words and/or patterns, look for and process multiple attributes ...
                var attributes = method.GetCustomAttributes<ConceptHandlerAttribute>();

                if (!(attributes?.Any() ?? false)) continue;

                foreach (var attr in attributes)
                {
                    if (string.IsNullOrWhiteSpace(attr.TriggerWords)) continue;
                    // ... else this method is a handler for this concept; register the method with the text ...

                    //? if (_Concepts.ContainsKey(attr.Pattern))
                    //?     System.Diagnostics.Debug.WriteLine("The concept type '" + concept.Name + "' contains pattern '" + attr.Pattern + "' which matches another pattern on concept '" + _Concepts[attr.Pattern].GetType().Name + "'. Try to avoid duplicate patterns and be more specific if possible.", "Warning");

                    try
                    {
                        AddConceptTriggerWords(attr.TriggerWords, (ConceptHandler)method.CreateDelegate(typeof(ConceptHandler), this));
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

        /// <summary>
        /// Parses and adds a concept pattern and associates it with a callback handler.
        /// </summary>
        /// <param name="words">One or more words (separated by commas or spaces) that will trigger the handler.</param>
        /// <param name="handler">A callback delegate to execute when the pattern matches.</param>
        /// <param name="dictionary">A dictionary to hold the pattern parts. If null, the dictionary associated with brain's main memory is used.</param>
        /// <returns>The patterns are mapped to the handler and stored within the concept instance, but pattern entries are also returned if needed.</returns>
        public void AddConceptTriggerWords(string words, ConceptHandler handler, Dictionary dictionary = null)
        {
            if (string.IsNullOrWhiteSpace(words)) return;

            if (dictionary == null)
                dictionary = Brain?.Memory?.Dictionary ?? throw new ArgumentNullException("dictionary", "No dictionary was given, and 'this.Brain.Memory.Dictionary' is null.");

            List<DictionaryItem[]> dictionaryItems = new List<DictionaryItem[]>();

            dictionary = dictionary ?? Brain?.Memory?.Dictionary;
            if (dictionary == null) throw new ArgumentNullException("dictionary");

            var expectedWords = words.Split(new char[] { ' ', ',' }, StringSplitOptions.RemoveEmptyEntries);

            for (var i = 0; i < expectedWords.Length; ++i)
            {
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

                if (!string.IsNullOrWhiteSpace(posStr))
                {
                    switch (posStr.ToUpper())
                    {
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
        ///// <summary>
        ///// Parses and adds a concept pattern and associates it with a callback handler.
        ///// </summary>
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

        public bool IsMatch(DictionaryItem left, DictionaryItem item, DictionaryItem right)
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
}
