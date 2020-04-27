using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// Holds accumulated contexts that hopefully grow towards an intent (and possible response).
    /// </summary>
    public class IntentContext : Context
    {
        // --------------------------------------------------------------------------------------------------------------------

        public IntentContext(Memory memory, Concept concept = null, Context parent = null) : base(memory, concept, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Flattens all nested subjects into one enumeration. The returned list may not be in the correct time line sorted
        ///     order.
        /// </summary>
        /// <param name="includeGroups"> (Optional) True to include grouped contexts in the search. </param>
        /// <returns> An enumeration of all subject contexts found. </returns>
        public IEnumerable<SubjectContext> AllSubjects(bool includeGroups = true)
        {
            return Flatten<SubjectContext>(includeGroups);
        }

        /// <summary>
        ///     Flattens all parent subjects into one subject list, sorted correctly by a descending timeline (time and sequence
        ///     that subjects were added). This allows the first subject to be the most recent (helps with pronouns in proximity,
        ///     etc.).
        /// </summary>
        /// <returns> An enumeration of all subject contexts found, in timeline order. </returns>
        public IEnumerable<SubjectContext> FlattenMostRecentSubjects()
        {
            return new SortedSet<SubjectContext>(AllSubjects(), DefaultReverseComparer);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
