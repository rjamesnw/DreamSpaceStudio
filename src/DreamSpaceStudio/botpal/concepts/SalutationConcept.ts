using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal.Concepts
{
    /// <summary>
    /// Adds rules to help determine colors.
    /// </summary>
    public class SalutationConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public SalutationConcept(Brain brian)
            : base(brian)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("Hi")]
        Task<ConceptHandlerContext> _Hi(ConceptHandlerContext context)
        {
            if (context.WasPrevious(null) && context.IsNext(null))
                context.AddIntentHandler(_Hi_Intent, 1d);
            else if (context.WasPrevious("say"))
                context.AddIntentHandler(_SayHi_Intent, 1d);
            return Task.FromResult(context.SetConfidence(1d));
        }

        async Task<bool> _Hi_Intent(ConceptHandlerContext context)
        {
            await Brain.DoResponse("Hello.");
            return true;
        }

        async Task<bool> _SayHi_Intent(ConceptHandlerContext context)
        {
            string name = "";
            var c = Brain.GetConcept<NamesConcept>();
            if (c?.CurrentName?.TextPart != null)
                name = " " + c.CurrentName.TextPart.Text;
            await Brain.DoResponse("Hi" + name + ".");
            return true;
        }

        [ConceptHandler("Hello")]
        Task<ConceptHandlerContext> _Hello(ConceptHandlerContext context)
        {
            if (context.WasPrevious(null) && context.IsNext(null))
                context.AddIntentHandler(_Hello_Intent, 1d);
            return Task.FromResult(context.SetConfidence(1d));
        }

        async Task<bool> _Hello_Intent(ConceptHandlerContext context)
        {
            await Brain.DoResponse("Hi there.");
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
