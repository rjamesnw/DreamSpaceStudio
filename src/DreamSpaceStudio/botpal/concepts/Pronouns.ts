using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal.Concepts
{
    /**
     *  A concept to understand and handle pronouns.
    */
    [Concept]
    export default class PronounsConcept extends Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public PronounsConcept(Dictionary dictionary)
            : base(dictionary)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        @conceptHandler("I^PN *")
        @conceptHandler("Me^PN *") // (not proper, but put here anyhow)
        @conceptHandler("She^PN *")
        @conceptHandler("He^PN *")
        @conceptHandler("They^PN *")
        @conceptHandler("Them^PN *") // (not proper, but put here anyhow)
        @conceptHandler("That^PN *") // (not proper, but put here anyhow)
        DictionaryItem[] _Pronoun(Scene scene, Context leftCtx, Context rightCtx)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
