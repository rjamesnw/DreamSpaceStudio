// ========================================================================================================================

import { IMemoryObject } from "./Memory";

/// <summary>
/// A dictionary item is a map of text to its use in some context.
/// </summary>
export default class DictionaryItem extends TimeReferencedObject implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    readonly Dictionary: Dictionary;

    get Memory(): Memory { return this.Dictionary?.Memory; }

    /// <summary>
    /// A text part instance that relates to this dictionary item.
    /// </summary>
    get TextPart(): TextPart { return this.#_TextPart; }
    #_TextPart: TextPart;

    /// <summary>
    /// The grammar type for the underlying word for this map.  It is used to complete the expected grammar types needed by
    /// other concepts waiting for resolution.
    /// </summary>
    POS: PartOfSpeech;

    /// <summary>
    /// The tense type for the underlying word for this map.
    /// </summary>
    TenseType: TenseTypes;

    /// <summary>
    /// The plurality for the underlying word for this map.
    /// </summary>
    public Plurality Plurality;

    public string Key { get { return CreateKey(TextPart?.GroupKey, POS, TenseType, Plurality); } }
        public static string CreateKey(string groupkey, PartOfSpeech pos, TenseTypes tense, Plurality plurality)
{
    var key = groupkey ?? "";
    if (pos != null) key += pos;
    if (tense != TenseTypes.Unspecified) key += tense;
    if (plurality != Plurality.Unspecified) key += plurality;
    return key;
}

        /// <summary>
        /// Enumerates over all concepts associated with this dictionary item.
        /// </summary>
        public IEnumerable < ConceptContext > ConceptContexts { get { return _ConceptContexts; } }
internal List < ConceptContext > _ConceptContexts = new List<ConceptContext>();

/// <summary>
/// Holds a reference to all contexts where this entry is associated with.
/// This is only relevant for contexts committed to memory and not during processing.
/// </summary>
internal List < Context > _Usages = new List<Context>();

        /// <summary>
        /// A list of entries that mean the same or similar thing as this entry.
        /// </summary>
        public DictionaryItem[] Synonyms { get { return _Synonyms?.Values.ToArray() ?? new DictionaryItem[0]; } }
Dictionary < string, DictionaryItem > _Synonyms;

        public double UsageFactor { get; internal set; }

        // --------------------------------------------------------------------------------------------------------------------

        public DictionaryItem(Dictionary dictionary, TextPart textPart, PartOfSpeech pos = null, TenseTypes tense = TenseTypes.Unspecified, Plurality plurality = Plurality.Unspecified)
{
    Dictionary = dictionary; // (note: this can be null for temp items not yet added)
    TextPart = textPart; // (note: this can be null due to wildcards in concept patterns)
    POS = pos;
    TenseType = tense;
    Plurality = plurality;
}

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if this part of speech (POS) is a sub-class of the given POS.
        /// </summary>
        public bool ClassOf(PartOfSpeech pos) => POS?.ClassOf(pos) ?? (pos == (object)null);

        // --------------------------------------------------------------------------------------------------------------------

        public string[] Definitions { get; set; }

        /// <summary>
        /// Triggers loading definitions for this dictionary entry.
        /// </summary>
        public BrainTask GetDefinitions()
{
    if (Definitions == null) {
        var url = "http://inossis.com/words/definition/" + TextPart.Text;

        // ... quick check if a task already exists; if so, return it so we don't do this many times for the same request ...

        var existingBT = Memory.Brain.GetTask(nameof(GetDefinitions), url);
        if (existingBT != null) return existingBT;

        // ... there are no other requests, so continue; first get exclusive rights to add this task ...

        using(GetLocker(nameof(Definitions)).SetMaxReadThreads(3).WriteLock())
        {
            // ... check again to see if another thread beat us to it ...

            existingBT = Memory.Brain.GetTask(nameof(GetDefinitions), url);
            if (existingBT != null) return existingBT;

            // ... still nothing, so lets create a new request ...

            async Task action(BrainTask bt)
            {
                var wc = new WebClient();
                var json = await wc.DownloadStringTaskAsync(url);
                var jarray = JArray.Parse(json);

                List < string > defs = new List<string>();

                foreach(JObject obj in jarray)
                defs.Add((string)obj["text"]);

                Definitions = defs.ToArray();
            }

            return Memory.Brain.CreateTask(action).Start();
        }
    }
    else return Memory.Brain.CreateEmptyTask();
}

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds a synonym entry.
        /// </summary>
        /// <returns>The entry added, or the existing entry in the list if one already exists.</returns>
        public DictionaryItem AddSynonymReference(DictionaryItem entry)
{
    if (entry == (object)null)
    throw new ArgumentNullException("entry");
    if (_Synonyms == null) {
        _Synonyms = new Dictionary<string, DictionaryItem>();
        _Synonyms[entry.Key] = entry;
    }
    else {
        var _entry = _Synonyms.Value(entry.Key);
        if (_entry == (object)null)
        _Synonyms[entry.Key] = entry;
                else
        _entry = entry;
    }
    return entry;
}

        /// <summary>
        /// Removes a synonym entry. Returns false if the item was not found.
        /// </summary>
        public bool RemoveSynonymReference(DictionaryItem entry)
{
    if (entry == (object)null)
    throw new ArgumentNullException("entry");
    if (_Synonyms != null)
        return _Synonyms.Remove(entry.Key);
    else
        return false;
}

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the given entry is a synonym of this entry.
        /// </summary>
        /// <param name="entry"></param>
        public bool IsSynonym(DictionaryItem entry)
{
    return _Synonyms?.Contains(entry?.Key) ?? false;
}

        /// <summary>
        /// Returns true if this part of text matches a synonym with the same text in the associated synonym list (without case sensitivity).
        /// </summary>
        /// <param name="textpart">A part of parsed text, usually without whitespace, but may be a phrase of text as well.</param>
        public bool IsSynonym(string textpart)
{
    if (_Synonyms != null)
        foreach(var s in _Synonyms.Values)
    if (string.Compare(s.TextPart?.Text, textpart, true) == 0)
        return true;
    return false;
}

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Add a concept handler that should be associated with this dictionary item. When user input is parsed, any text parts
        /// matching this dictionary item will cause the associated handlers to be trigger to handle it.
        /// </summary>
        /// <param name="handler">A concept handler delegate to store for this dictionary item.  The delegate reference also
        /// holds a target reference to the concept singleton, which is why it is not required for this method.</param>
        /// <returns></returns>
        public ConceptContext AddConceptHandler(ConceptHandler handler)
{
    var i = IndexOfConceptContext(handler);
    ConceptContext cctx;

    if (i == -1) {
        cctx = new ConceptContext(this, handler);
        _ConceptContexts.Add(cctx);
    }
    else cctx = _ConceptContexts[i];

    return cctx;
}

        /// <summary>
        /// Find the index of a concept context given the concept and a handler delegate on that context.
        /// </summary>
        public int IndexOfConceptContext(ConceptHandler handler)
{
    for (int i = 0, n = _ConceptContexts.Count; i < n; ++i)
    if (_ConceptContexts[i].Handler == handler)
        return i;
    return -1;
}

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if this entry matches an entry reference with the same context properties.
        /// </summary>
        public override bool Equals(object obj)
{
    var de = obj as DictionaryItem;
    if ((object)de == null) return false;
    return Key == de.Key && (POS?.Equals(de.POS) ?? false) && TenseType == de.TenseType && Plurality == de.Plurality;
}

        public static bool operator == (DictionaryItem di1, DictionaryItem di2) => (object)di1 == (object)di2 || !(di1 is null) && di1.Equals(di2);
        public static bool operator != (DictionaryItem di1, DictionaryItem di2) => !(di1 == di2);

        /// <summary> Equality operator for text-only. WARNING: This does not take parts of speech into account (nouns vs verbs vs etc.). </summary>
        /// <param name="di"> A <see cref="DictionaryItem"/>. </param>
        /// <param name="text"> The text to compare against. </param>
        /// <returns> True if the text is the same or mostly similar. </returns>
        public static bool operator == (DictionaryItem di, string text) => di?.TextPart == text;
        /// <summary> Equality operator for text-only. WARNING: This does not take parts of speech into account (nouns vs verbs vs etc.). </summary>
        /// <param name="di"> A <see cref="DictionaryItem"/>. </param>
        /// <param name="text"> The text to compare against. </param>
        /// <returns> True if the text is the same or mostly similar. </returns>
        public static bool operator != (DictionaryItem di, string text) => !(di == text);

        public override string ToString() => TextPart?.Text + ": " + POS + ", " + TenseType + ", " + Plurality;
        public override int GetHashCode() => ToString().GetHashCode();

        // --------------------------------------------------------------------------------------------------------------------
    }

// ========================================================================================================================
