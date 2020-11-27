import Context from "../core/Context";
import DictionaryItem from "../core/DictionaryItem";
import Concept from "../core/Concept";
import SubjectContext from "./SubjectContext";
import TimeReference from "../core/TimeReference";

/**
 *  Holds accumulated contexts that hopefully grow towards an intent (and possible response).
*/
export default class IntentContext extends Context {
    // --------------------------------------------------------------------------------------------------------------------

    color: DictionaryItem;

    public constructor(concept: Concept, color: DictionaryItem, parent: Context = null) {
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
    allSubjects(includeGroups = true): Iterable<SubjectContext> {
        return this.flatten(SubjectContext, includeGroups);
    }

    /**
     *      Flattens all parent subjects into one subject list, sorted correctly by a descending timeline (time and sequence
     *      that subjects were added). This allows the first subject to be the most recent (helps with pronouns in proximity,
     *      etc.).
    */
    /// <returns> An enumeration of all subject contexts found, in timeline order. </returns>
    flattenMostRecentSubjects(): Iterable<SubjectContext> {
        // ... sort subjects newest to oldest ...
        var sortedSubjects = [...this.allSubjects()].sort((a, b) => TimeReference.ReverseComparer(a.Timestamp, b.Timestamp));
        // ... return the sorted set ...
        return sortedSubjects;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
