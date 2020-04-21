using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal.Concepts
{
    /// <summary>
    /// 
    /// </summary>
    public class AdverbConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public AdverbConcept(Brain brian)
            : base(brian)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("that", " * that^AV *")] // (ex: "I would not go that far")
        Task<ConceptHandlerContext> _Adverb(ConceptHandlerContext context)
        {
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
