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
    public class AdjectiveConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public AdjectiveConcept(Brain brian)
            : base(brian)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler(null, "* ^AD ^N *")] // (ex: "I would not go that far")
        Task<ConceptHandlerContext> _Adjective(ConceptHandlerContext context)
        {
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
