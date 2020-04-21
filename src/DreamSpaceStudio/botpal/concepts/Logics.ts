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
    [Concept]
    public class LogicConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public LogicConcept(Brain brian)
            : base(brian)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("when", "when^AV ^N/^PN ^V ^V/^T/^N/^PP ^V")]
        Task<ConceptHandlerContext> _FindWhen(ConceptHandlerContext context)
        {
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
