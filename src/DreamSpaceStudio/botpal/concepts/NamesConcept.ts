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
    public class NamesConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public NamesConcept(Brain brian)
            : base(brian)
        {
            Deb = Memory.Dictionary.AddTextPart("deb", POS.Noun_Person);
            Debra = Memory.Dictionary.AddTextPart("debra", POS.Noun_Person);
            Debohrra = Memory.Dictionary.AddTextPart("debohrra", POS.Noun_Person);
            James = Memory.Dictionary.AddTextPart("james", POS.Noun_Person);
        }

        public readonly DictionaryItem Deb;
        public readonly DictionaryItem Debra;
        public readonly DictionaryItem Debohrra;
        public readonly DictionaryItem James;

        public DictionaryItem CurrentName;

        // --------------------------------------------------------------------------------------------------------------------

        // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
        [ConceptHandler("deb,debra,debohrra,james")]
        Task<ConceptHandlerContext> _Names(ConceptHandlerContext context)
        {
            if (context.WasPrevious(null))
            {
                ((NamesConcept)context.CurrentMatch.Item.Concept).CurrentName = context.CurrentMatch.Item.DictionaryItem;
                context.AddIntentHandler(_Name_Intent, context.Operation.MinConfidence);
            }
            return Task.FromResult(context);
        }

        async Task<bool> _Name_Intent(ConceptHandlerContext context) // (must always provide an intent to fall-back to if a better one isn't found)
        {
            await Brain.DoResponse("Yes, please continue.");
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
