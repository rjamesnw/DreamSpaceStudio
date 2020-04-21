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
    public class PronounsConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public PronounsConcept(Dictionary dictionary)
            : base(dictionary)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("I^PN *")]
        [ConceptHandler("Me^PN *")] // (not proper, but put here anyhow)
        [ConceptHandler("She^PN *")]
        [ConceptHandler("He^PN *")]
        [ConceptHandler("They^PN *")]
        [ConceptHandler("Them^PN *")] // (not proper, but put here anyhow)
        [ConceptHandler("That^PN *")] // (not proper, but put here anyhow)
        DictionaryItem[] _Pronoun(Scene scene, Context leftCtx, Context rightCtx)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
