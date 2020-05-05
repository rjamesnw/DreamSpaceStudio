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
    export default class SpeakingConcept extends Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public SpeakingConcept(brian: Brain)
            : base(brian)
        {
            Say = Memory.Dictionary.AddTextPart("say", POS.Noun_Person);
        }

        public readonly DictionaryItem Say;

        // --------------------------------------------------------------------------------------------------------------------

        // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
        @conceptHandler("say")
         _Say_Intent(context: ConceptHandlerContext ): Promise<ConceptHandlerContext> _Names(context: ConceptHandlerContext )
        {
            if (context.WasPrevious(null))
                context.AddIntentHandler(_Say_Intent, context.Operation.MinConfidence);
            return Promise.resolve(context);
        }

        async Task<boolean> // (must always provide an intent to fall-back to if a better one isn't found)
        {
            await Brain.DoResponse("Say what.");
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
