"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
const SubjectContext_1 = require("./SubjectContext");
const TimeReference_1 = require("../core/TimeReference");
/**
 *  Holds accumulated contexts that hopefully grow towards an intent (and possible response).
*/
class IntentContext extends Context_1.default {
    constructor(concept, color, parent = null) {
        super(concept, parent);
        this.color = color;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *      Flattens all nested subjects into one enumeration. The returned list may not be in the correct time line sorted
     *      order.
    */
    /// <param name="includeGroups"> (Optional) True to include grouped contexts in the search. </param>
    /// <returns> An enumeration of all subject contexts found. </returns>
    allSubjects(includeGroups = true) {
        return this.flatten(SubjectContext_1.default, includeGroups);
    }
    /**
     *      Flattens all parent subjects into one subject list, sorted correctly by a descending timeline (time and sequence
     *      that subjects were added). This allows the first subject to be the most recent (helps with pronouns in proximity,
     *      etc.).
    */
    /// <returns> An enumeration of all subject contexts found, in timeline order. </returns>
    flattenMostRecentSubjects() {
        // ... sort subjects newest to oldest ...
        var sortedSubjects = [...this.allSubjects()].sort((a, b) => TimeReference_1.default.ReverseComparer(a.Timestamp, b.Timestamp));
        // ... return the sorted set ...
        return sortedSubjects;
    }
}
exports.default = IntentContext;
//# sourceMappingURL=IntentContext.js.map