"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
class Memory {
}
exports.default = Memory;
{
    get;
    {
        return this;
    }
}
Dictionary;
Dictionary;
{
    get;
    {
        return _Dictionary;
    }
}
internal;
Dictionary;
_Dictionary;
Memory(Brain, brain);
{
    Brain = brain;
    _Dictionary = new Dictionary(this);
}
int;
GetCombinationCount(IList < Match < DictionaryItem > [] > matchesList); //?
{
    if (matchesList == null || matchesList.Count == 0)
        return 0;
    var count = 1;
    for (int; i = 0, n = matchesList.Count; i < n)
        ;
    ++i;
    count *= ((_b = (_a = matchesList[i]) === null || _a === void 0 ? void 0 : _a.Length) !== null && _b !== void 0 ? _b : 1);
    return count;
}
IEnumerable < Match < DictionaryItem > [] > GetCombinations(IList < Match < DictionaryItem > [] > matchesList); // TODO: There is error in this logic!!!
{
    // ... in "clock counter" fashion, count down through the combinations, from the top, so the best combinations are first ...
    var indexes = new int[matchesList.Count];
    var matches = new Match < DictionaryItem > [indexes.Length];
    var depthLevel = 2; // (once all possible combinations for a level are completed, this will increment, until all combinations are returned)
    int;
    carry;
    bool;
    finished;
    bool;
    at_eol; // (at end of list [or depth])
    do {
        carry = 1;
        finished = true;
        at_eol = true;
        for (int; i = 0, n = indexes.Length, index, matchesLen; i < n)
            ;
        ++i;
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
        yield;
        return matches.ToArray(); // (return a copy, as the array will be overwritten on next pass, if any)
    } while (!finished); // (note also: if carry is 1 at this point, then all combinations within all possible depths have been reached)
}
//# sourceMappingURL=Memory.js.map