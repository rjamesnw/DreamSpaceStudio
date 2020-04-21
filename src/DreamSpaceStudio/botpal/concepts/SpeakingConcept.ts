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
    public class SpeakingConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public SpeakingConcept(Brain brian)
            : base(brian)
        {
            Say = Memory.Dictionary.AddTextPart("say", POS.Noun_Person);
        }

        public readonly DictionaryItem Say;

        // --------------------------------------------------------------------------------------------------------------------

        // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
        [ConceptHandler("say")]
        Task<ConceptHandlerContext> _Names(ConceptHandlerContext context)
        {
            if (context.WasPrevious(null))
                context.AddIntentHandler(_Say_Intent, context.Operation.MinConfidence);
            return Task.FromResult(context);
        }

        async Task<bool> _Say_Intent(ConceptHandlerContext context) // (must always provide an intent to fall-back to if a better one isn't found)
        {
            await Brain.DoResponse("Say what.");
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
