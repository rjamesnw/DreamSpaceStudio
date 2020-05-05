using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal.Concepts
{
    /// <summary>
    /// A concept to understand and handle pronouns.
    /// </summary>
    [Concept]
    export default class ConjunctionConcept extends Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public ConjunctionConcept(Dictionary dictionary)
            : base(dictionary)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        @conceptHandler("* and^C *")
        @conceptHandler("* that^C *") // (ex: "she said that she was satisfied" [statement or hypothesis] / "oh that he could be restored to health" [wish or regret])
        DictionaryItem[] _Conjunction(Scene scene, Context leftCtx, Context rightCtx)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
