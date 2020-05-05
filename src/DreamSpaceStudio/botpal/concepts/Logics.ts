using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal.Concepts
{
    /**
     *  
    */
    [Concept]
    export default class LogicConcept extends Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public LogicConcept(brian: Brain)
            : base(brian)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        @conceptHandler("when", "when^AV ^N/^PN ^V ^V/^T/^N/^PP ^V")
         _FindWhen(context: ConceptHandlerContext ): Promise<ConceptHandlerContext>
        {
            return Promise.resolve(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
