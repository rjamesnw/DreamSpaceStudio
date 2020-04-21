export interface IMemoryObject {
    /** The memory instance this object belongs to. */
    memory: Memory;
}

export default class Memory implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    public readonly Brain Brain;

    memory IMemoryObject.memory { get { return this; } }

        /// <summary>
        /// The dictionary holds both the RAW text, without context (no duplicates), and various 'DictionaryEntry' instances,
        /// which both link to the raw text, along with some contextual parameters for the text ('DictionaryEntry' items CAN
        /// reference the same text among them).
        /// </summary>
        public Dictionary Dictionary { get { return _Dictionary; } }
internal Dictionary _Dictionary;

        ///// <summary>
        ///// A list of all neural nodes in the memory.
        ///// </summary>
        //? public readonly SortedSet<NeuralNode> NeuralNodes = new SortedSet<NeuralNode>(TimeReferencedObject.DefaultComparer);

        // --------------------------------------------------------------------------------------------------------------------

        public Memory(Brain brain)
{
    Brain = brain;
    _Dictionary = new Dictionary(this);
}

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a count of all possible combinations 
        /// </summary>
        /// <param name="matchesList"></param>
        /// <returns></returns>
        public int GetCombinationCount(IList < Match < DictionaryItem > [] > matchesList) //?
{
    if (matchesList == null || matchesList.Count == 0) return 0;
    var count = 1;
    for (int i = 0, n = matchesList.Count; i < n; ++i)
    count *= (matchesList[i]?.Length ?? 1);
    return count;
}

        /// <summary>
        /// Uses a yield-return method to return the best combinations first, allowing the caller to stop at any point when 
        /// enough is received, or enough time has elapsed.
        /// </summary>
        /// <param name="matchesList">A list of matches for each text part the user entered.  Each match array item in the list
        /// corresponds to the same text part (usually from user input), but different possible dictionary item (context) matches.</param>
        public IEnumerable < Match < DictionaryItem > [] > GetCombinations(IList < Match < DictionaryItem > [] > matchesList) // TODO: There is error in this logic!!!
{
    // ... in "clock counter" fashion, count down through the combinations, from the top, so the best combinations are first ...

    var indexes = new int[matchesList.Count];
    var matches = new Match < DictionaryItem > [indexes.Length];
    var depthLevel = 2; // (once all possible combinations for a level are completed, this will increment, until all combinations are returned)
    int carry;
    bool finished;
    bool at_eol; // (at end of list [or depth])

    do {
        carry = 1;
        finished = true;
        at_eol = true;

        for (int i = 0, n = indexes.Length, index, matchesLen; i < n; ++i)
        {
            index = indexes[i];

            matchesLen = matchesList[i].Length;

            matches[i] = matchesList[i][index];

            index += carry;

            if (index >= depthLevel || index >= matchesLen) {
                index = 0;
                // (carry is not reset in order to increment the next index entry)
            }
            else {
                carry = 0;

                if (index != depthLevel - 1 && index != matchesLen - 1)
                    at_eol = false; // (signals that the index is not at the last item for this depth level [so there is more combinations pending within this depth level])
            }

            indexes[i] = index;

            if (matchesLen - 1 > index)
                finished = false; // ('finished' will always reset to false while there are more pending combinations for a match array)

            if (at_eol && !finished && i == n - 1)
                ++depthLevel; // (this is reached only when all indexes for all match arrays are at their final ends for all possible combos within the current depth level, BUT more is possible [not 'finished'])
        }

        yield return matches.ToArray(); // (return a copy, as the array will be overwritten on next pass, if any)

    } while (!finished); // (note also: if carry is 1 at this point, then all combinations within all possible depths have been reached)
}

    // --------------------------------------------------------------------------------------------------------------------
}
