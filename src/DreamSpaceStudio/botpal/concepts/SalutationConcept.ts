using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal.Concepts
{
    /**
     *  Adds rules to help determine colors.
    */
    export default class SalutationConcept extends Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public SalutationConcept(brian: Brain)
            : base(brian)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        @conceptHandler("Hi")
        (): Promise<ConceptHandlerContext> _Hi(context: ConceptHandlerContext )
        {
            if (context.WasPrevious(null) && context.IsNext(null))
                context.AddIntentHandler(_Hi_Intent, 1d);
            else if (context.WasPrevious("say"))
                context.AddIntentHandler(_SayHi_Intent, 1d);
            return Promise.resolve(context.SetConfidence(1d));
        }

        async Task<boolean> _Hi_Intent(context: ConceptHandlerContext )
        {
            await Brain.DoResponse("Hello.");
            return true;
        }

        async Task<boolean> _SayHi_Intent(context: ConceptHandlerContext )
        {
            string name = "";
            var c = Brain.GetConcept<NamesConcept>;
            if (c?.CurrentName?.TextPart != null)
                name = " " + c.CurrentName.TextPart.Text;
            await Brain.DoResponse("Hi" + name + ".");
            return true;
        }

        @conceptHandler("Hello")
         _Hello_Intent(context: ConceptHandlerContext ): Promise<ConceptHandlerContext> _Hello(context: ConceptHandlerContext )
        {
            if (context.WasPrevious(null) && context.IsNext(null))
                context.AddIntentHandler(_Hello_Intent, 1d);
            return Promise.resolve(context.SetConfidence(1d));
        }

        async Task<boolean>
        {
            await Brain.DoResponse("Hi there.");
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
