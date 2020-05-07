// ========================================================================================================================

import Memory, { IMemoryObject } from "./Memory";
import TextPart from "./TextPart";
import DictionaryItem from "./DictionaryItem";
import { PartOfSpeech } from "./POS";
import { TenseTypes, Plurality } from "./Enums";

/**
 *  The dictionary holds both the RAW text, without context (no duplicates), and various 'DictionaryEntry' instances,
 *  which both link to the raw text, along with some contextual parameters for the text.  'DictionaryEntry' items CAN
 *  reference the same text among them, but there should only ever be one context entry based on contextual parameters,
 *  such as Part Of Speech, Tense, Plurality, etc.
 *  <para>The main purpose of the dictionary is as an index for quick text lookups when parsing user text inputs.   
 *  It can be purged and refreshed from the default dictionary words, and the loaded and parsed memory of user inputs 
 *  (though it may never be the same as before, since the system dynamically changes).</para>
*/
export default class Dictionary implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    readonly memory: Memory;

    /**
     *  The raw texts, as originally entered by users. The key IS case sensitive, which is '{TextPart}.Key'. That said, this only stores text
     *  exactly as entered by a user. Normally casing is always determined in context at output to user.
    */
    _Texts: Map<string, TextPart> = new Map<string, TextPart>();

    /**
     *  An index of all texts by their first letter (always lower casing). This can help to quickly speed up/shortcut word analysis.
    */
    _TextIndexByFirstLetter: Map<string, TextPart[]> = new Map<string, TextPart[]>(); // TODO: Consider restricting on max word length as well.

    /**
     *  Each 'Text' has a 'GroupKey' property that can be used to bind together similar texts without case sensitivity. This list holds those references.
     *  This can help to quickly speed up/shortcut text input analysis.
    */
    _SimilarTexts: Map<string, TextPart[]> = new Map<string, TextPart[]>();

    /**
     *  All words or phrases in this dictionary, based on group keys, and other specific word context parameters (POS, Tense, Plurality, etc.).
     *  This servers as a quick index, which can be rebuilt or updated as needed.
     *  By default, the lexicon will contain entries used to split text for grammar trees.
    */
    _Entries: Map<string, DictionaryItem> = new Map<string, DictionaryItem>();

    /**
     *  This references the dictionary entry that has a blank key, and is used to store global data, such as concepts that should run if no other concepts are found.
    */
    get GlobalEntry(): DictionaryItem { return this._Entries.get(''); }

    /**
     *  Each 'Text' has a 'GroupKey' property that can be used to bind together similar texts without case sensitivity. 
     *  This list holds those references, as it relates to dictionary entries.
     *  This can help to quickly speed up/shortcut text input analysis, taking away the need to know context parameters (POS, Tense, Plurality, etc.).
    */
    readonly _SimilarEntries = new Map<string, DictionaryItem[]>();

    /**
     *  An index of all words by their first letter (always lower casing). This can help to quickly speed up/shortcut word analysis.
    */
    _IndexByFirstLetter = new Map<string, DictionaryItem[]>(); // TODO: Consider restricting on max word length as well.

    /**
     *  An index of all words by their string length. This can help to quickly speed up/shortcut word analysis.
    */
    _IndexByLength = new Map<number, DictionaryItem[]>(); // TODO: Consider restricting on max word length as well.

    // --------------------------------------------------------------------------------------------------------------------

    constructor(memory: Memory) {
        this.memory = memory;
        this._Entries.set('', new DictionaryItem(this, null)); // (this is a global placeholder for "match unknown" concepts)
        // (NOTE: Synonyms, in this case, are more like word GROUPS, and less an actual list of strict synonyms; this helps the AI to know related words)
        // TODO: Consider keeping strict synonyms, and instead have a map to other "related" words.
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Adds one or more text parts (text usually without whitespace) to the dictionary.  If any entry already exists, it will be returned instead.
     * @param {TextPart} textPart The text part wrapper object to add.
     * @param {PartOfSpeech} pos
     * @param {TenseTypes} tense?
     * @param {Plurality} plurality?
     * @returns
     */
    addTextPart(textPart: TextPart, pos: PartOfSpeech, tense?: TenseTypes, plurality?: Plurality): DictionaryItem;

    /**
     * Adds one or more text parts (text usually without whitespace) to the dictionary.  If any entry already exists, it will be returned instead.
     * @param {string} textPart A part of previously parsed text to add, or a phrase of text (such as "hot dog").  Note that this text will be trimmed if any whitespace exists on either end.
     * @param {PartOfSpeech} pos
     * @param {TenseTypes} tense?
     * @param {Plurality} plurality?
     * @returns
     */
    addTextPart(textPart: string, pos: PartOfSpeech, tense?: TenseTypes, plurality?: Plurality): DictionaryItem;

    addTextPart(textPart: TextPart | string, pos: PartOfSpeech = null, tense = TenseTypes.Unspecified, plurality = Plurality.Unspecified): DictionaryItem {
        if (textPart instanceof TextPart) {
            var entry = new DictionaryItem(this, this.AddText(textPart), pos, tense, plurality); // (this wraps the details so we can generate a key that represents the entry, then see if one already exists)
            return this.AddEntry(entry);
        } else {
            var entry = new DictionaryItem(this, this.AddText(textPart), pos, tense, plurality); // (this wraps the details so we can generate a key that represents the entry, then see if one already exists)
            return this.AddEntry(entry);

        }
    }

    /**
     *  Attempts to add the given entry, returning any existing entry instead if one already exists.
    */
    AddEntry(entry: DictionaryItem): DictionaryItem {
        if (!entry)
            throw DS.Exception.argumentRequired("Dictionary.AddEntry()", "entry");

        var entryKey = entry.key;
        var tp = entry.textPart;
        var existingEntry = this._Entries.get(entryKey);

        if (existingEntry) // (if the entry already exists, it was already processed, so ignore)
            return existingEntry;

        // ... first register the underlying text of the text part (if not already added) ...

        this.AddText(tp);

        // ... register the dictionary entry by the lowercase first character of the phrase group key ...
        // (note: the entry key is NOT used, as it contains entry data with the key, and is less like the original text)

        var grpkey = tp.groupKey; // (a key used for grouping text that looks similar - we need to process this all using the key in lower case, etc., to properly index the text as it may look to the user, and by ordinal comparisons)
        var charIndex = grpkey[0];
        var indexedWords = this._IndexByFirstLetter.get(charIndex);

        if (!indexedWords)
            this._IndexByFirstLetter.set(charIndex, indexedWords = []);

        indexedWords.push(entry);

        // ... register the dictionary entry by the length of the phrase group key ...
        // (note: the key has the white spaces removed so they don't through this off)

        var lenIndex = grpkey.length;
        var indexedWordsByLen = this._IndexByLength.get(lenIndex);

        if (!indexedWordsByLen)
            this._IndexByLength.set(lenIndex, indexedWordsByLen = []);

        indexedWordsByLen.push(entry);

        // ... finally add the entry to the entry lists ...

        var similarEntries = this._SimilarEntries.get(grpkey);
        if (!similarEntries)
            this._SimilarEntries.set(grpkey, similarEntries = []);

        similarEntries.push(entry);

        this._Entries.set(entryKey, entry);

        return entry;
    }

    /**
     * Adds text only.  No lexical dictionary entries or related references are added.
     * @param {TextPart | string} text
     * @returns
     */
    AddText(text: TextPart | string): TextPart;

    /**
     * Adds text only.  No lexical dictionary entries or related references are added.
     * @param {string} text The text to add.  Note that this text will be trimmed if any whitespace exists on either end.
     * @returns
     */
    AddText(text: string): TextPart;

    AddText(text: TextPart | string): TextPart {
        if (typeof text == 'string') return this.AddText(new TextPart(this, text));

        if (text === undefined || text === null)
            throw DS.Exception.argumentUndefinedOrNull("Dictionary.AddEntry()", "entry");

        var key = text.key;
        var txt = this._Texts.get(key);
        if (txt == null) {
            // ... adding it for the first time ...

            this._Texts.set(key, txt = text);

            // ... also add to the group of similar texts ...

            var grpkey = text.groupKey;
            var stexts = this._SimilarTexts.get(grpkey);
            if (!stexts)
                this._SimilarTexts.set(grpkey, stexts = []);
            stexts.push(text);

            // ... finally index the text by the first character ...

            var charIndex = grpkey[0];
            var indexedTexts = this._TextIndexByFirstLetter.get(charIndex);
            if (!indexedTexts)
                this._TextIndexByFirstLetter.set(charIndex, indexedTexts = []);
            indexedTexts.push(text);
        }
        return txt;
    }

    /** Queues an event to update word usage factor on all dictionary entries based on usage counts. 
      * Warning: This requires two passes (one for totals, and another for factor calculations);  If forcing the call, do it sparingly.
      * @param {boolean} force If false (default), the request is scheduled to run asynchronously (which allows for multiple calls without stacking). If true, the call is synchronous.
      */
    UpdateUsageFactor(force = false) {
        if (!force) {
            // ... schedule a refresh; if already scheduled, this will cancel the existing one and start a new one ...
            this.memory.brain.createTask((bt) => {
                this.UpdateUsageFactor(true);
                return Task.CompletedTask;
            }).Start(TimeSpan.FromSeconds(1), "Dictionary", "UpdateUsageFactor");
        }
        else lock(_Entries)
        {
            double totalCount = 0;
            // ... pass 1: get overall totals to calculate all contexts relative to each other ...
            foreach(var entry in _Entries.Values)
            totalCount += entry._Usages.Count;
            // ... pass 2: calculate all contexts relative usage factors ...
            if (totalCount > 0)
                foreach(var entry in _Entries.Values)
            entry.UsageFactor = (double)entry._Usages.Count / totalCount;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Returns the dictionary entry for the given text part key (i.e. 'TextPart.Key').
     *  The key should be a specific dictionary entry key.  Typically it is taken from 'Brain.GetKeyFromTextParts()'.
    */
    public DictionaryItem GetEntry(string key) {
        lock(_Entries) return _Entries.Value(key);
    }

    /**
     *  Returns the dictionary entry for the given group key, parts of speech (POS), and other parameters.
     *  The group key should be a specific group key typically returned via 'TextPart.ToGroupKey()'.
     *  The match is precise, which means all parameters much 
    */
    public DictionaryItem GetEntry(string groupkey, PartOfSpeech pos, TenseTypes tense = TenseTypes.NA, Plurality plurality = Plurality.NA) {
        var key = DictionaryItem.CreateKey(groupkey, pos, tense, plurality);
        lock(_Entries) return _Entries.Value(key);
    }

    /**
     *  Returns the dictionary entries that are similar using a group key.
     *  A group key is a special lowercase and translated version of a normal key that is made more generic based on "looks".
     *  It is best to wrap the text in an instance of 'Text' and call the 'GroupKey' property, or use the static method 'TextPart.ToGroupKey()'.
    */
    public DictionaryItem[] FindSimilarEntries(string groupkey) {
        lock(_Entries) return _SimilarEntries.Value(groupkey)?.ToArray();
    }

    /**
     *  Returns the dictionary word information list for the given letter, or first letter of any given word.
     *  This serves as a shortcut to help locating words a bit more quickly.
    */
    public DictionaryItem[] GetEntriesByFirstLetter(char letter) {
        lock(_Entries) return _IndexByFirstLetter.Value(letter)?.ToArray();
    }

    /**
     *  Returns a list of words that have similar characters in similar positions to the given part of text.
     *  The first letter is used as a shortcut to speed up the search.
     *  The returns list is sorted so the higher score is first.
    */
    /// <param name="textpart">The text to look for.</param>
    /// <param name="threshold">Only include matches equal or greater to this threshold.</param>
    /// <param name="quickSearch">If true (default) then exact matches by key indexes are done first before scanning all texts. If matches are found, no other text is considered.
    /// If false, each text entry is checked one by one, which can be extremely slow.</param>
    /// <returns></returns>
    public Match<DictionaryItem> [] FindMatchingEntries(string textpart, double threshold = 0.8, bool quickSearch = true) {
        if (textpart == null)
            throw new ArgumentNullException(textpart);

        var matches = new List<Match<DictionaryItem>>();

        if (!DS.StringUtils.isEmptyOrWhitespace(textpart)) {
            if (quickSearch) {
                var groupkey = Memory.Brain.ToGroupKey(textpart);
                var entries = FindSimilarEntries(groupkey);
                if (entries != null)
                    foreach(var e in entries)
                matches.Add(new Match<DictionaryItem>(e, 1)); // (perfect matches)
            }

            if (matches.Count == 0) {
                // (no perfect matches were found, or quick search was skipped, so check all text - note, this search text first, not entries)

                // ... first, get words with the same character to help speed this up a bit ...

                var firstChar = textpart[0];

                var indexedItems = _IndexByFirstLetter.Value(firstChar);

                if (indexedItems?.Count > 0) {
                    // ... store all matched texts into an array that will be used to break down into group keys, then dictionary entries ...

                    for (var i = 0; i < indexedItems.Count; ++i) { // (check each word of the same first letter for a % match)
                        var item = indexedItems[i];
                        var score = CompareText(textpart, item.TextPart?.Text);
                        if (score >= threshold)
                            matches.Add(new Match<DictionaryItem>(item, score));
                    }
                }
            }
        }

        // ... return a sorted list such that the best match is at the front ...

        matches.Sort(Match<DictionaryItem>.DefaultComparer);

        return matches.ToArray();
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Loads the default "dictionary.json" file, so the text is populated with known English texts, which can help with user input errors starting out.
    */
    /// <param name="filename">The name of the dictionary file. By default this is "dictionary.json".</param>
    /// <param name="body">The dictionary JSON contents if the file is already loaded, otherwise leave this null to load the contents.</param>
    /// <returns>'null' if the dictionary file was loaded successfully, or an error otherwise.</returns>
    public Exception LoadDefaultWords(string filename = "dictionary.json", string body = null) {
        if (DS.StringUtils.isEmptyOrWhitespace(body)) {
            var libPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().CodeBase), filename);
            if (File.Exists(libPath))
                body = File.ReadAllText(libPath);
            else
                return new FileNotFoundException(libPath);
        }

        if (!DS.StringUtils.isEmptyOrWhitespace(body))
            try {
                var jarray = JArray.Parse(body);
                foreach(var item in jarray)
                AddText((string)item);
                return null;
            }
            catch (Exception ex) { return ex; }

        return new InvalidDataException("No data is available to be parsed - the body content may be empty.");
    }

    //// --------------------------------------------------------------------------------------------------------------------

    ///** Ads a context entry based on a given root word, phrase, symbol, number, etc. 
    //  * Note: Any non-'ContextAssociation' instances will be treated as "is" (synonym) associations.
    //  */
    //public Context addContext(word: string|DictionaryWord, partOfSpeech: POS, definition?: string, isPlural = false, tense = TenseTypes.NotApplicable)
    //{

    //    if (!word) throw "'word' is required.";

    //    var dicWord: DictionaryWord = typeof word == "string" ? this.addWord(< string > word) : < DictionaryWord > word;

    //    var ctx = new Context(this, (typeof word == "string" ? this.addWord(< string > word) : < DictionaryWord > word), partOfSpeech, void 0, definition, isPlural, tense);

    //    if (!ctx.wordInfo.contexts)
    //        ctx.wordInfo.contexts = [];

    //    ctx.wordInfo.contexts.push(ctx);

    //    var _: string | Context;

    //    if (synonyms)
    //    {
    //        ctx.associations = [];
    //        for (var i = 0; i < synonyms.length; ++i)
    //        {
    //            var association = synonyms[i];

    //            // ... this is a word, and a context will need to be pulled or created for it ...

    //            var assocCtx = isType(association, Context) ? < Context > association : this.getContext(< string | DictionaryWord > association, partOfSpeech);

    //            if (assocCtx === void 0)
    //                        assocCtx = this.addContext(< string | DictionaryWord > association, partOfSpeech);

    //        // ... created association on original context ...

    //        ctx.addAssociation(assocCtx, AssociationTypes.IsLike);
    //    }
    //}

    //            return ctx;
    //        }

    //        /** Returns a context for a given word.  The word must have exactly one (and only one) defined context, otherwise null
    //          * will be returned (or an exception, if 'throwIfNotFound' is true).
    //          * @param {string|DictionaryWord} word The word to get a context for.
    //          * @param {PartsOfSpeech} partOfSpeech The part of speech expected for this context (required only if there are more than one context).
    //          * @param {boolean} throwOnEmpty If true, and contexts are empty, then an exception will be thrown (default is false - return 'undefined').
    //          * @param {boolean} throwOnTooMany If true, finding too many matching contexts will throw an error (default is true; false will cause 'null' to be returned instead).
    //          */
    //        public Context getContext(word: string | DictionaryWord, partOfSpeech?: POS, throwOnEmpty = false, throwOnTooMany = true)
    //{
    //    var wordInfo = this.words[DS.StringUtils.toString(word)];
    //    if (wordInfo)
    //        if (wordInfo.contexts && wordInfo.contexts.length > 0)
    //            if (wordInfo.contexts.length == 1 && partOfSpeech == void 0)
    //                        return wordInfo.contexts[0];
    //                    else {
    //        var result: Context[] = [];
    //        for (var i = 0; i < wordInfo.contexts.length; ++i)
    //            if (wordInfo.contexts[i].partOfSpeech == partOfSpeech)
    //                result.push(wordInfo.contexts[i]);
    //        if (result.length == 1) return result[0];
    //        if (throwOnTooMany)
    //            log("The word '" + word + "' has more than one context definition.  There is no way to determine which one simply based on a string and POS (part of speech) type.", LogMessageTypes.Error);
    //        else
    //            return null; // (null flags that there were too many contexts to choose from, so 'null' is the result [no object could be returned])
    //    }
    //    if (throwOnEmpty)
    //        log("The word '" + word + "' does not have any context definitions.", LogMessageTypes.Error);
    //    return undefined; // (undefined flags that no contexts exist at all)
    //}

    //public boolean hasContexts(word: string)
    //{
    //    var wordInfo = this.words[word];
    //    return wordInfo && wordInfo.contexts && wordInfo.contexts.length > 0;
    //}

    // --------------------------------------------------------------------------------------------------------------------

    //        getSynonymMatch(txt1: string, txt2: string)
    //{
    //    // (note 1: get the best score of the two: if at least one word has a single root word count, the score should be 1 if there's a match)
    //    // (note 2: synonyms are preferred over partial string matching [and faster]; if there's any match at all, go with it).
    //    var match1 = 0, match2 = 0;

    //    var txt1DicInfo = this.words[txt1]; // TODO: consider a score based on synonyms as well
    //    var txt2DicInfo = this.words[txt2]; // TODO: consider a score based on synonyms as well

    //    if (txt1DicInfo)
    //        if (this.isSynonym(txt1, txt2))
    //            match1 = 1 / this.words[txt1].synonymLists.length;

    //    if (txt2DicInfo)
    //        if (this.isSynonym(txt2, txt1))
    //            match2 = 1 / this.words[txt2].synonymLists.length;

    //    return match1 > match2 ? match1 : match2;
    //}

    // --------------------------------------------------------------------------------------------------------------------

    //void _splitWordsIntoTree(DictionaryItem items, DictionaryItem[] keywords, int keywordIndex)
    //{
    //    PartOfSpeech[] delimiters = new PartOfSpeech[] { POS.Conjunction, POS.Verb, POS.Noun, POS.Determiner, POS.Adjective, POS.Adverb  };

    //    if (items && items.length && keywords && keywords.Length)
    //        while (keywordIndex < keywords.length)
    //        {
    //            var keyword = keywords[keywordIndex];
    //            for (var i = 0; i < items.length; ++i)
    //            {
    //                var word = items[i];
    //                if (word == keyword || this.getSynonymMatch(word, keyword) > 0.5)
    //                {
    //                    var node = new GrammarTreeNode(this);
    //                    node.searchwordInfo = this.addWord(word);
    //                    node.keywordInfo = this.addWord(keyword);
    //                    node.isKeyword = true;
    //                    node.push(this._splitWordsIntoTree(items.slice(0, i), keywords, keywordIndex + 1), this._splitWordsIntoTree(items.slice(i + 1), keywords, keywordIndex));
    //                    return node;
    //                }
    //            }
    //            // ... the keyword was not found, try the next one, if any ...
    //            ++keywordIndex;
    //        }
    //    // ... cannot split these words, so just return a word info array (all of these will be on the same level on one node) ...
    //    var siblingWords = new GrammarTreeNode(this);
    //    siblingWords.keywordInfo = null; // (nothing for word groups - these are at the ends of the tree)
    //    siblingWords.searchwordInfo = null; // (nothing for word groups - these are at the ends of the tree)
    //    siblingWords.isKeyword = false; // (not keyword node)
    //    for (var i = 0; i < items.length; ++i)
    //        siblingWords.push(this.addWord(items[i]));
    //    return siblingWords;
    //}

    //public GrammarTree getWordTree(string[]  words)
    //{ // takes an array of words and attempts to split them up into a searchable tree based on some kind of meaning.
    //  // TODO: Consider the word types as well (nouns, verbs, etc.).
    //    return new GrammarTree(this, this._splitWordsIntoTree(words, [".", "!", "?", ",", ";", // john said the ball was red; your name is jane
    //        "said", "thought", "doing", "going", "running", "flying", "fighting", "growing", // (keyword verbs first)
    //        "is", "of", "and", "the", "to", "of", "not", "all",
    //        "me", "you", "we", "them",
    //        "before", "after", "during", "in", "time"
    //    ], 0)
    //        );
    //}

    // --------------------------------------------------------------------------------------------------------------------

    public string NormalizeText(string text, Regex optionalTextRemovalRegex = null) {
        if (text == null) text = "";
        if (optionalTextRemovalRegex != null)
            text = optionalTextRemovalRegex.Replace(text, "");
        return text.ToLower().Replace("n't", " not"); // TODO: Think more about "'s", which is complicated to deal with, and may be context based.
    }

    public string FixWord(string word) // TODO: This can be optimized.
    {
        return new Regex(@"[^\w]").Replace(new Regex(@"\s+").Replace(word ?? "", " "), "").ToLower();
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Calculates and returns a % match between two given words. It is assume the given strings are words, and not text with any white space.
    */
    public double CompareWords(string word1, string word2) {
        word1 = FixWord(word1);
        word2 = FixWord(word2);
        return CompareText(word1, word2);
    }

    /**
     *  Calculates and returns a % match between two given texts.
    */
    public double CompareText(string txt1, string txt2) {
        if ((txt1 ?? "") == "" || (txt2 ?? "") == "")
            return 1d; // exact match

        //? var synonymMatch = this.getSynonymMatch(txt1, txt2);
        //? if (synonymMatch > 0)
        //?    return synonymMatch * 0.99; // (like-kind words are never 100%, but should match better than a partial match analysis)

        // ... make lower case first ...

        txt1 = txt1.ToLower();
        txt2 = txt2.ToLower();

        // ... move characters into arrays to faster analysis ...

        var txt1Chars = txt1.ToCharArray();
        var txt2Chars = txt2.ToCharArray();

        // ... try partial match ...

        if (txt2Chars.Length < txt1Chars.Length) {
            // ... swap the char arrays so the smallest one is first (this is important, as the smaller may scan across and match part of the larger) ...
            var tmp = txt1Chars;
            txt1Chars = txt2Chars;
            txt2Chars = tmp;
        }

        var txt1CharsLen = txt1Chars.Length;
        var txt2CharsLen = txt2Chars.Length;

        // Note: Scanning for all possible matches using this method has the total matches at n(n+1)/2 (same as adding all numbers up to the word length).

        string txt;
        int i1 = 0, scanLen1 = 0, i2, scanLen2, i3, depthCount = 0, charsLeft1 = txt1CharsLen, charsLeft2 = txt2CharsLen;
        var totalPossibleCombinations = txt1CharsLen * ((double)txt1CharsLen + 1) / 2; / / !
            int totalLevels = txt1CharsLen - 1, level = 0; //? ('level' helps to add weight to matches at various levels [lower values are better matches])
        int distance, matchCount = 0; // each match at a particular % depth is added.
        double totalMatch = 0;

        while (scanLen1 < txt1CharsLen) {
            i1 = 0;
            i2 = txt1CharsLen - scanLen1; // (scanLen1 is how far to scan sub text across to find a match in the target)
            scanLen2 = txt2CharsLen - i2;

            while (i2 > i1 && i2 <= txt1CharsLen) {
                txt = new string(txt1Chars, i1, i2 - i1); // (get a segment of text [between indexes i1 and i2] from text 1 to scan against text 2)

                for (i3 = 0; i3 <= scanLen2; ++i3) {
                    if (new string(txt2Chars, i3, txt.Length) == txt) // TODO: Consider using a compare loop instead of this (and txt) in case the GC becomes an issue.
                    {
                        // ... replace matched text segments with a special char so they are not matched again ...

                        for (var ri = i1; ri < i2; ++ri)
                            txt1Chars[ri] = '\x01';
                        for (var ri = i3; ri < i3 + txt.Length; ++ri)
                            txt2Chars[ri] = '\x02'; // (a different char here to prevent any matches)

                        // ... get the distance between the source and target indexes between these matches; this determines a score based on 
                        //     how far apart the matches are when the two texts are placed side by side ...

                        distance = Math.Abs(i3 - i1);

                        // ... formula is:
                        // 1. avg = ({% of matching text length to total txt1 length} + {% of matching text length to total txt2 length}) / 2
                        //    (If 2/4 characters match, and both txt1 and txt2 are the same length, the result is a 50% match [0.5]; however,
                        //     if the second txt2 length is more, the second score will be less because of the different, making the average less)
                        // 2. score displacement = avg / distance^2
                        //    (the farther away matching text offsets are when put side by side, the more exponentially worse the score becomes)
                        // ...

                        totalMatch += ((double)txt.Length / txt1CharsLen + (double)txt.Length / txt2CharsLen) / 2 / Math.Pow(2, distance);  //? * (1 - distance / txt1CharsLen)
                        ++matchCount;
                        charsLeft1 -= txt.Length; //? (keeping track of how many characters are left unmatched helps to fine tune the score)
                        charsLeft2 -= txt.Length;
                        i1 = i2; // check next part of the word text
                        i2 = i1 + txt.Length;
                        break;
                    }
                }

                if (i3 > scanLen2) {
                    // (then no match was found)
                    ++i1;
                    ++i2;
                }

                ++depthCount; //?
            }

            ++scanLen1;
            ++level; //?
        }

        return totalMatch * txt1CharsLen / txt2CharsLen; // (make the word size difference modify the final match % by weight based on difference in length of words)
    }

    //public WordArrayMatch compareWordArrays(words1: string[], words2: string[])
    //{ //? compares words and positions
    //    if (words1 === words2) return new WordArrayMatch(1, [], [words1, words2]);
    //    if (words1 == void 0 || !("length" in words1)) return new WordArrayMatch(0, [], [words1, words2]);
    //    if (words2 == void 0 || !("length" in words2)) return new WordArrayMatch(0, [], [words1, words2]);

    //    // ... make the first array the largest array ...
    //    var words1IsOpenStarted = words1[0] == "*";
    //    var words1IsOpenEnded = words1[words1.length - 1] == "*";
    //    var words2IsOpenStarted = words2[0] == "*";
    //    var words2IsOpenEnded = words2[words2.length - 1] == "*";

    //    if (words1IsOpenStarted || words1IsOpenEnded)
    //    {
    //        var i1 = words1IsOpenStarted ? 1 : 0, i2 = words1.length - (words1IsOpenEnded ? 1 : 0);
    //        words1 = words1.slice(i1, i2); // (removed any wildcard symbols)
    //    }
    //    if (words2IsOpenStarted || words2IsOpenEnded)
    //    {
    //        var i1 = words2IsOpenStarted ? 1 : 0, i2 = words2.length - (words2IsOpenEnded ? 1 : 0);
    //        words2 = words2.slice(i1, i2); // (removed any wildcard symbols)
    //    }

    //    var wordLists = [words1, words2]; // (this should never be reversed)

    //    if (words1.length == 0) return new WordArrayMatch(+(words2.length == 0), [], wordLists);

    //    var scoreIndex1 = 0, scoreIndex2 = 1; // (need to return the scores in the order of the words given in the parameters)

    //    if ((words2IsOpenStarted || words2IsOpenEnded) && words2.length < words1.length // (keep smaller on bottom in this case)
    //        || (!words1IsOpenStarted && !words1IsOpenEnded) && words1.length < words2.length)
    //    { // (keep smaller on top in this case)
    //        var tmp: any = words1;
    //        words1 = words2;
    //        words2 = tmp;

    //        tmp = words1IsOpenStarted;
    //        words1IsOpenStarted = words2IsOpenStarted;
    //        words2IsOpenStarted = tmp;

    //        tmp = words1IsOpenEnded;
    //        words1IsOpenEnded = words2IsOpenEnded;
    //        words1IsOpenEnded = tmp;

    //        scoreIndex1 = 1;
    //        scoreIndex2 = 0;
    //    }

    //    var scores: any[][] = [[], []]; // (attach a score list to each word list to be analyzed later if needed)

    //    var match = 0, wordCount = 0, compareOffset = 0, findStartIndex = words1IsOpenStarted;

    //    for (var w1i = 0; w1i < words1.length; ++w1i)
    //    {
    //        var bestW2MatchIndex = -1, bestMatch = 0, distance: number;
    //        ++wordCount;

    //        for (var w2i = 0; w2i < words2.length; ++w2i)
    //        {
    //            var distance = findStartIndex ? 0 : Math.abs(w1i - (w2i + compareOffset)),
    //                wordMatch = this.compareWords(words1[w1i], words2[w2i]);

    //            wordMatch = wordMatch / Math.pow(2, distance);

    //            if (wordMatch > bestMatch)
    //            {
    //                bestMatch = wordMatch;
    //                bestW2MatchIndex = w2i;
    //                if (bestMatch == 1)
    //                    break; // (perfect match, add now and skip to next word)
    //            }
    //        }

    //        scores[scoreIndex1][w1i] = bestMatch;
    //        if (bestW2MatchIndex >= 0)
    //            scores[scoreIndex2][bestW2MatchIndex] = bestMatch;

    //        if (findStartIndex && bestMatch > 0)
    //        {
    //            compareOffset = -bestW2MatchIndex;
    //            findStartIndex = false;
    //        }

    //        match += bestMatch;
    //    }

    //    return new WordArrayMatch((match / wordCount), scores, wordLists); //? + words2.length / words1.length) / 2; // (make the word count difference modify the final match %)
    //}

    // --------------------------------------------------------------------------------------------------------------------
}
}
