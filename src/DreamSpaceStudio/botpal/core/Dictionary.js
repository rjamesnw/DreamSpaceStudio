"use strict";
// ========================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const Memory_1 = require("./Memory");
const TextPart_1 = require("./TextPart");
const DictionaryItem_1 = require("./DictionaryItem");
const Enums_1 = require("./Enums");
/**
 *  The dictionary holds both the RAW text, without context (no duplicates), and various 'DictionaryEntry' instances,
 *  which both link to the raw text, along with some contextual parameters for the text.  'DictionaryEntry' items CAN
 *  reference the same text among them, but there should only ever be one context entry based on contextual parameters,
 *  such as Part Of Speech, Tense, Plurality, etc.
 *  <para>The main purpose of the dictionary is as an index for quick text lookups when parsing user text inputs.
 *  It can be purged and refreshed from the default dictionary words, and the loaded and parsed memory of user inputs
 *  (though it may never be the same as before, since the system dynamically changes).</para>
*/
class Dictionary {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(memory) {
        /**
         *  The raw texts, as originally entered by users. The key IS case sensitive, which is '{TextPart}.Key'. That said, this only stores text
         *  exactly as entered by a user. Normally casing is always determined in context at output to user.
        */
        this._Texts = new Map();
        /**
         *  An index of all texts by their first letter (always lower casing). This can help to quickly speed up/shortcut word analysis.
        */
        this._TextIndexByFirstLetter = new Map(); // TODO: Consider restricting on max word length as well.
        /**
         *  Each 'Text' has a 'GroupKey' property that can be used to bind together similar texts without case sensitivity. This list holds those references.
         *  This can help to quickly speed up/shortcut text input analysis.
        */
        this._SimilarTexts = new Map();
        /**
         *  All words or phrases in this dictionary, based on group keys, and other specific word context parameters (POS, Tense, Plurality, etc.).
         *  This servers as a quick index, which can be rebuilt or updated as needed.
         *  By default, the lexicon will contain entries used to split text for grammar trees.
        */
        this._Entries = new Map();
        /**
         *  Each 'Text' has a 'GroupKey' property that can be used to bind together similar texts without case sensitivity.
         *  This list holds those references, as it relates to dictionary entries.
         *  This can help to quickly speed up/shortcut text input analysis, taking away the need to know context parameters (POS, Tense, Plurality, etc.).
        */
        this._SimilarEntries = new Map();
        /**
         *  An index of all words by their first letter (always lower casing). This can help to quickly speed up/shortcut word analysis.
        */
        this._IndexByFirstLetter = new Map(); // TODO: Consider restricting on max word length as well.
        /**
         *  An index of all words by their string length. This can help to quickly speed up/shortcut word analysis.
        */
        this._IndexByLength = new Map(); // TODO: Consider restricting on max word length as well.
        this.memory = memory;
        this._Entries.set('', new DictionaryItem_1.default(this, null)); // (this is a global placeholder for "match unknown" concepts)
        // (NOTE: Synonyms, in this case, are more like word GROUPS, and less an actual list of strict synonyms; this helps the AI to know related words)
        // TODO: Consider keeping strict synonyms, and instead have a map to other "related" words.
    }
    /**
     *  This references the dictionary entry that has a blank key, and is used to store global data, such as concepts that should run if no other concepts are found.
    */
    get GlobalEntry() { return this._Entries.get(''); }
    AddTextPart(textPart, pos = null, tense = Enums_1.TenseTypes.Unspecified, plurality = Enums_1.Plurality.Unspecified) {
        if (textPart instanceof TextPart_1.default) {
            var entry = new DictionaryItem_1.default(this, this.AddText(textPart), pos, tense, plurality); // (this wraps the details so we can generate a key that represents the entry, then see if one already exists)
            return this.AddEntry(entry);
        }
        else {
            var entry = new DictionaryItem_1.default(this, this.AddText(textPart), pos, tense, plurality); // (this wraps the details so we can generate a key that represents the entry, then see if one already exists)
            return this.AddEntry(entry);
        }
    }
    /**
     *  Attempts to add the given entry, returning any existing entry instead if one already exists.
    */
    AddEntry(entry) {
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
    AddText(text) {
        if (typeof text == 'string')
            return this.AddText(new TextPart_1.default(this, text));
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
            this.memory.Brain.createTask((bt) => {
                this.UpdateUsageFactor(true);
                return Task.CompletedTask;
            }).Start(TimeSpan.FromSeconds(1), "Dictionary", "UpdateUsageFactor");
        }
        else
            lock(_Entries);
        {
            double;
            totalCount = 0;
            // ... pass 1: get overall totals to calculate all contexts relative to each other ...
            foreach();
            var entry;
             in _Entries.Values;
            totalCount += entry._Usages.Count;
            // ... pass 2: calculate all contexts relative usage factors ...
            if (totalCount > 0)
                foreach();
            var entry;
             in _Entries.Values;
            entry.UsageFactor = (double);
            entry._Usages.Count / totalCount;
        }
    }
    GetEntry(string, key) {
        lock(_Entries);
        return _Entries.Value(key);
    }
    GetEntry(string, groupkey, PartOfSpeech, pos, TenseTypes, tense = TenseTypes.NA, Plurality, plurality = Plurality.NA) {
        var key = DictionaryItem_1.default.CreateKey(groupkey, pos, tense, plurality);
        lock(_Entries);
        return _Entries.Value(key);
    }
    FindSimilarEntries(string, groupkey) {
        var _a;
        lock(_Entries);
        return (_a = _SimilarEntries.Value(groupkey)) === null || _a === void 0 ? void 0 : _a.ToArray();
    }
    GetEntriesByFirstLetter(char, letter) {
        var _a;
        lock(_Entries);
        return (_a = _IndexByFirstLetter.Value(letter)) === null || _a === void 0 ? void 0 : _a.ToArray();
    }
    FindMatchingEntries(string, textpart, double, threshold = 0.8, bool, quickSearch = true) {
        var _a;
        if (textpart == null)
            throw new ArgumentNullException(textpart);
        var matches = new List();
        if (!string.IsNullOrWhiteSpace(textpart)) {
            if (quickSearch) {
                var groupkey = Memory_1.default.Brain.ToGroupKey(textpart);
                var entries = FindSimilarEntries(groupkey);
                if (entries != null)
                    foreach();
                var e;
                 in entries;
                matches.Add(new Match(e, 1)); // (perfect matches)
            }
            if (matches.Count == 0) {
                // (no perfect matches were found, or quick search was skipped, so check all text - note, this search text first, not entries)
                // ... first, get words with the same character to help speed this up a bit ...
                var firstChar = textpart[0];
                var indexedItems = _IndexByFirstLetter.Value(firstChar);
                if ((indexedItems === null || indexedItems === void 0 ? void 0 : indexedItems.Count) > 0) {
                    // ... store all matched texts into an array that will be used to break down into group keys, then dictionary entries ...
                    for (var i = 0; i < indexedItems.Count; ++i) { // (check each word of the same first letter for a % match)
                        var item = indexedItems[i];
                        var score = CompareText(textpart, (_a = item.TextPart) === null || _a === void 0 ? void 0 : _a.Text);
                        if (score >= threshold)
                            matches.Add(new Match(item, score));
                    }
                }
            }
        }
        // ... return a sorted list such that the best match is at the front ...
        matches.Sort(Match(DefaultComparer));
        return matches.ToArray();
    }
    LoadDefaultWords(string, filename = "dictionary.json", string, body = null) {
        if (string.IsNullOrWhiteSpace(body)) {
            var libPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().CodeBase), filename);
            if (File.Exists(libPath))
                body = File.ReadAllText(libPath);
            else
                return new FileNotFoundException(libPath);
        }
        if (!string.IsNullOrWhiteSpace(body))
            try {
                var jarray = JArray.Parse(body);
                foreach();
                var item;
                 in jarray;
                AddText((string), item);
                return null;
            }
            catch (Exception) { }
        ex;
        {
            return ex;
        }
        return new InvalidDataException("No data is available to be parsed - the body content may be empty.");
    }
    NormalizeText(string, text, Regex, optionalTextRemovalRegex = null) {
        if (text == null)
            text = "";
        if (optionalTextRemovalRegex != null)
            text = optionalTextRemovalRegex.Replace(text, "");
        return text.ToLower().Replace("n't", " not"); // TODO: Think more about "'s", which is complicated to deal with, and may be context based.
    }
    FixWord(string, word) {
        return new Regex();
        Replace(new Regex());
        Replace(word !== null && word !== void 0 ? word : "", " "), "";
        ToLower();
    }
    CompareWords(string, word1, string, word2) {
        word1 = FixWord(word1);
        word2 = FixWord(word2);
        return CompareText(word1, word2);
    }
    CompareText(string, txt1, string, txt2) {
        if ((txt1 !== null && txt1 !== void 0 ? txt1 : "") == "" || (txt2 !== null && txt2 !== void 0 ? txt2 : "") == "")
            return 1;
        d; // exact match
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
        string;
        txt;
        int;
        i1 = 0, scanLen1 = 0, i2, scanLen2, i3, depthCount = 0, charsLeft1 = txt1CharsLen, charsLeft2 = txt2CharsLen;
        var totalPossibleCombinations = txt1CharsLen * ((double)), txt1CharsLen;
        +1;
        / 2; / / !int;
        totalLevels = txt1CharsLen - 1, level = 0; //? ('level' helps to add weight to matches at various levels [lower values are better matches])
        int;
        distance, matchCount = 0; // each match at a particular % depth is added.
        double;
        totalMatch = 0;
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
                        totalMatch += ((double));
                        txt.Length / txt1CharsLen + (double);
                        txt.Length / txt2CharsLen;
                        / 2 /;
                        Math.Pow(2, distance); //? * (1 - distance / txt1CharsLen)
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
}
exports.default = Dictionary;
//# sourceMappingURL=Dictionary.js.map