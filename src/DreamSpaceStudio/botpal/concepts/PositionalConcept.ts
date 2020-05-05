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
    export default class PositionalConcept extends Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public PositionalConcept(brian: Brain)
            : base(brian)
        {
            Here = Memory.Dictionary.AddTextPart("here", POS.Preposition_Spatial);
        }

        public readonly DictionaryItem Here;

        // --------------------------------------------------------------------------------------------------------------------

        @conceptHandler("here")
         _NameIsHere_Intent(context: ConceptHandlerContext ): Promise<ConceptHandlerContext> _NameIsHere(context: ConceptHandlerContext )
        {
            if (context.WasPrevious("is"))
                context.AddIntentHandler(_NameIsHere_Intent, 0.9d);
            return Promise.resolve(context);
        }

        async Task<boolean>
        {
            await Brain.DoResponse("Ok.");
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
