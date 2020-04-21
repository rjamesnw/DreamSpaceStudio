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
    public class PositionalConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public PositionalConcept(Brain brian)
            : base(brian)
        {
            Here = Memory.Dictionary.AddTextPart("here", POS.Preposition_Spatial);
        }

        public readonly DictionaryItem Here;

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("here")]
        Task<ConceptHandlerContext> _NameIsHere(ConceptHandlerContext context)
        {
            if (context.WasPrevious("is"))
                context.AddIntentHandler(_NameIsHere_Intent, 0.9d);
            return Task.FromResult(context);
        }

        async Task<bool> _NameIsHere_Intent(ConceptHandlerContext context)
        {
            await Brain.DoResponse("Ok.");
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
