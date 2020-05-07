"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dictionary_1 = require("./Dictionary");
class Memory {
    ///**
    //* A list of all neural nodes in the memory.
    //*/
    //? public readonly SortedSet<NeuralNode> NeuralNodes = new SortedSet<NeuralNode>(TimeReferencedObject.DefaultComparer);
    // --------------------------------------------------------------------------------------------------------------------
    constructor(brain) {
        this.brain = brain;
        this.dictionary = new Dictionary_1.default(this);
    }
    get memory() { return this; }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Returns a count of all possible combinations
    */
    /// <param name="matchesList"></param>
    /// <returns></returns>
    GetCombinationCount(matchesList) {
        var _a, _b;
        if (matchesList == null || matchesList.length == 0)
            return 0;
        var count = 1;
        for (var i = 0, n = matchesList.length; i < n; ++i)
            count *= ((_b = (_a = matchesList[i]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1);
        return count;
    }
    /**
     *  Uses a yield-return method to return the best combinations first, allowing the caller to stop at any point when
     *  enough is received, or enough time has elapsed.
     *  @param matchesList A list of matches for each text part the user entered.  Each match array item in the list
     *  corresponds to the same text part (usually from user input), but different possible dictionary item (context) matches.
     */
    *getCombinations(matchesList) {
        // ... in "clock counter" fashion, count down through the combinations, from the top, so the best combinations are first ...
        var indexes = new Array(matchesList.length);
        var matches = new Array(indexes.length);
        var depthLevel = 2; // (once all possible combinations for a level are completed, this will increment, until all combinations are returned)
        var carry;
        var finished;
        var at_eol; // (at end of list [or depth])
        do {
            carry = 1;
            finished = true;
            at_eol = true;
            for (var i = 0, n = indexes.length, index, matchesLen; i < n; ++i) {
                index = indexes[i];
                matchesLen = matchesList[i].length;
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
            yield matches; // (return a copy, as the array will be overwritten on next pass, if any)
        } while (!finished); // (note also: if carry is 1 at this point, then all combinations within all possible depths have been reached)
    }
}
exports.default = Memory;
//# sourceMappingURL=Memory.js.map