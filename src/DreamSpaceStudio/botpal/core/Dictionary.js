// ========================================================================================================================
var _a, _b, _c;
/// <summary>
/// The dictionary holds both the RAW text, without context (no duplicates), and various 'DictionaryEntry' instances,
/// which both link to the raw text, along with some contextual parameters for the text.  'DictionaryEntry' items CAN
/// reference the same text among them, but there should only ever be one context entry based on contextual parameters,
/// such as Part Of Speech, Tense, Plurality, etc.
/// <para>The main purpose of the dictionary is as an index for quick text lookups when parsing user text inputs.   
/// It can be purged and refreshed from the default dictionary words, and the loaded and parsed memory of user inputs 
/// (though it may never be the same as before, since the system dynamically changes).</para>
/// </summary>
class Dictionary {
}
IMemoryObject;
{
    Memory;
    Memory;
    Memory;
    IMemoryObject.Memory;
    {
        get;
        {
            return Memory;
        }
    }
    /// <summary>
    /// The raw texts, as originally entered by users. The key IS case sensitive, which is '{TextPart}.Key'. That said, this only stores text
    /// exactly as entered by a user. Normally casing is always determined in context at output to user.
    /// </summary>
    Dictionary < string, TextPart > _Texts;
    new Dictionary();
    /// <summary>
    /// An index of all texts by their first letter (always lower casing). This can help to quickly speed up/shortcut word analysis.
    /// </summary>
    Dictionary < char, List < TextPart >> _TextIndexByFirstLetter;
    new Dictionary(); // TODO: Consider restricting on max word length as well.
    /// <summary>
    /// Each 'Text' has a 'GroupKey' property that can be used to bind together similar texts without case sensitivity. This list holds those references.
    /// This can help to quickly speed up/shortcut text input analysis.
    /// </summary>
    Dictionary < string, List < TextPart >> _SimilarTexts;
    new Dictionary();
    /// <summary>
    /// All words or phrases in this dictionary, based on group keys, and other specific word context parameters (POS, Tense, Plurality, etc.).
    /// This servers as a quick index, which can be rebuilt or updated as needed.
    /// By default, the lexicon will contain entries used to split text for grammar trees.
    /// </summary>
    Dictionary < string, DictionaryItem > _Entries;
    new Dictionary();
    DictionaryItem;
    GlobalEntry => _Entries[String.Empty];
    /// <summary>
    /// Each 'Text' has a 'GroupKey' property that can be used to bind together similar texts without case sensitivity. 
    /// This list holds those references, as it relates to dictionary entries.
    /// This can help to quickly speed up/shortcut text input analysis, taking away the need to know context parameters (POS, Tense, Plurality, etc.).
    /// </summary>
    Dictionary < string, List < DictionaryItem >> _SimilarEntries;
    new Dictionary();
    /// <summary>
    /// An index of all words by their first letter (always lower casing). This can help to quickly speed up/shortcut word analysis.
    /// </summary>
    Dictionary < char, List < DictionaryItem >> _IndexByFirstLetter;
    new Dictionary(); // TODO: Consider restricting on max word length as well.
    /// <summary>
    /// An index of all words by their string length. This can help to quickly speed up/shortcut word analysis.
    /// </summary>
    Dictionary < int, List < DictionaryItem >> _IndexByLength;
    new Dictionary(); // TODO: Consider restricting on max word length as well.
    Dictionary(Memory, memory);
    {
        Memory = memory;
        _Entries.Add(String.Empty, new DictionaryItem(this, null)); // (this is a global placeholder for "match unknown" concepts)
        // (NOTE: Synonyms, in this case, are more like word GROUPS, and less an actual list of strict synonyms; this helps the AI to know related words)
        // TODO: Consider keeping strict synonyms, and instead have a map to other "related" words.
    }
    DictionaryItem;
    AddTextPart(TextPart, textPart, PartOfSpeech, pos = null, TenseTypes, tense = TenseTypes.Unspecified, Plurality, plurality = Plurality.Unspecified);
    {
        var entry = new DictionaryItem(this, AddText(textPart), pos, tense, plurality); // (this wraps the details so we can generate a key that represents the entry, then see if one already exists)
        return AddEntry(entry);
    }
    DictionaryItem;
    AddTextPart(string, textPart, PartOfSpeech, pos = null, TenseTypes, tense = TenseTypes.Unspecified, Plurality, plurality = Plurality.Unspecified);
    {
        var entry = new DictionaryItem(this, AddText(textPart), pos, tense, plurality); // (this wraps the details so we can generate a key that represents the entry, then see if one already exists)
        return AddEntry(entry);
    }
    DictionaryItem;
    AddEntry(DictionaryItem, entry);
    {
        if (entry == (object))
            null;
        throw new ArgumentNullException("entry");
        var entryKey = entry.Key;
        var tp = entry.TextPart;
        DictionaryItem;
        existingEntry;
        lock(_Entries);
        existingEntry = _Entries.Value(entryKey);
        if (existingEntry != (object))
            null;
        return existingEntry;
        // ... first register the underlying text of the text part (if not already added) ...
        AddText(tp);
        lock(_Entries);
        {
            // ... register the dictionary entry by the lowercase first character of the phrase group key ...
            // (note: the entry key is NOT used, as it contains entry data with the key, and is less like the original text)
            var grpkey = tp.GroupKey; // (a key used for grouping text that looks similar - we need to process this all using the key in lower case, etc., to properly index the text as it may look to the user, and by ordinal comparisons)
            var charIndex = grpkey[0];
            var indexedWords = _IndexByFirstLetter.Value(charIndex);
            if (indexedWords == null)
                _IndexByFirstLetter[charIndex] = indexedWords = new List();
            indexedWords.Add(entry);
            // ... register the dictionary entry by the length of the phrase group key ...
            // (note: the key has the white spaces removed so they don't through this off)
            var lenIndex = grpkey.Length;
            var indexedWordsByLen = _IndexByLength.Value(lenIndex);
            if (indexedWordsByLen == null)
                _IndexByLength[lenIndex] = indexedWordsByLen = new List();
            indexedWordsByLen.Add(entry);
            // ... finally add the entry to the entry lists ...
            var similarEntries = _SimilarEntries.Value(grpkey);
            if (similarEntries == null)
                _SimilarEntries[grpkey] = similarEntries = new List();
            similarEntries.Add(entry);
            return _Entries[entryKey] = entry;
        }
    }
    TextPart;
    AddText(TextPart, text);
    {
        lock(_Texts);
        {
            if (text == null)
                throw new ArgumentNullException("text");
            var key = text.Key;
            var txt = _Texts.Value(key);
            if (txt == null) {
                // ... adding it for the first time ...
                _Texts[key] = txt = text;
                // ... also add to the group of similar texts ...
                var grpkey = text.GroupKey;
                var stexts = _SimilarTexts.Value(grpkey);
                if (stexts == null)
                    _SimilarTexts[grpkey] = stexts = new List();
                stexts.Add(text);
                // ... finally index the text by the first character ...
                var charIndex = grpkey[0];
                var indexedTexts = _TextIndexByFirstLetter.Value(charIndex);
                if (indexedTexts == null)
                    _TextIndexByFirstLetter[charIndex] = indexedTexts = new List();
                indexedTexts.Add(text);
            }
            return txt;
        }
    }
    TextPart;
    AddText(string, text);
    {
        return AddText(new TextPart(this, text));
    }
    void UpdateUsageFactor(bool, force = false);
    {
        if (!force) {
            // ... schedule a refresh; if already scheduled, this will cancel the existing one and start a new one ...
            Memory.Brain.CreateTask((bt) => {
                UpdateUsageFactor(true);
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
    DictionaryItem;
    GetEntry(string, key);
    {
        lock(_Entries);
        return _Entries.Value(key);
    }
    DictionaryItem;
    GetEntry(string, groupkey, PartOfSpeech, pos, TenseTypes, tense = TenseTypes.NA, Plurality, plurality = Plurality.NA);
    {
        var key = DictionaryItem.CreateKey(groupkey, pos, tense, plurality);
        lock(_Entries);
        return _Entries.Value(key);
    }
    DictionaryItem[];
    FindSimilarEntries(string, groupkey);
    {
        lock(_Entries);
        return (_a = _SimilarEntries.Value(groupkey)) === null || _a === void 0 ? void 0 : _a.ToArray();
    }
    DictionaryItem[];
    GetEntriesByFirstLetter(char, letter);
    {
        lock(_Entries);
        return (_b = _IndexByFirstLetter.Value(letter)) === null || _b === void 0 ? void 0 : _b.ToArray();
    }
    Match < DictionaryItem > [];
    FindMatchingEntries(string, textpart, double, threshold = 0.8, bool, quickSearch = true);
    {
        if (textpart == null)
            throw new ArgumentNullException(textpart);
        var matches = new List();
        if (!string.IsNullOrWhiteSpace(textpart)) {
            if (quickSearch) {
                var groupkey = Memory.Brain.ToGroupKey(textpart);
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
                        var score = CompareText(textpart, (_c = item.TextPart) === null || _c === void 0 ? void 0 : _c.Text);
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
    Exception;
    LoadDefaultWords(string, filename = "dictionary.json", string, body = null);
    {
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
    string;
    NormalizeText(string, text, Regex, optionalTextRemovalRegex = null);
    {
        if (text == null)
            text = "";
        if (optionalTextRemovalRegex != null)
            text = optionalTextRemovalRegex.Replace(text, "");
        return text.ToLower().Replace("n't", " not"); // TODO: Think more about "'s", which is complicated to deal with, and may be context based.
    }
    string;
    FixWord(string, word); // TODO: This can be optimized.
    {
        return new Regex();
        Replace(new Regex());
        Replace(word !== null && word !== void 0 ? word : "", " "), "";
        ToLower();
    }
    double;
    CompareWords(string, word1, string, word2);
    {
        word1 = FixWord(word1);
        word2 = FixWord(word2);
        return CompareText(word1, word2);
    }
    double;
    CompareText(string, txt1, string, txt2);
    {
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
//# sourceMappingURL=Dictionary.js.map