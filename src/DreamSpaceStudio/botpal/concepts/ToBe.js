using;
System;
using;
System.Collections.Generic;
using;
System.Linq;
using;
System.Text;
using;
System.Threading.Tasks;
var BotPal;
(function (BotPal) {
    var Concepts;
    (function (Concepts) {
        /// <summary>
        /// 
        /// </summary>
        [Concept];
        class ToBeConcept {
        }
        Concept;
        {
            ToBeConcept(Brain, brian);
            base(brian);
            {
            }
            // --------------------------------------------------------------------------------------------------------------------
            // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
            [ConceptHandler("is")];
            Task < ConceptHandlerContext > _Is(ConceptHandlerContext, context);
            {
                if (context.WasPrevious("how"))
                    context.AddIntentHandler(_How_Is_Intent, context.Operation.MinConfidence);
                else if (context.WasPrevious("time"))
                    context.AddIntentHandler(_How_Is_Intent, context.Operation.MinConfidence);
                else
                    context.AddIntentHandler(_Is_What_Intent, context.Operation.MinConfidence);
                //{
                //    var ctx = context.Context;
                //    if (ctx.AllSubjects().Any())
                //    {
                //        if (ctx.HasActions)
                //        {
                //            // ... assign actions (could be more than one) ...
                //        }
                //        else if (ctx.HasAttributes)
                //        {
                //            // ... assign attributes ...
                //        }
                //    }
                //    else
                //    {
                //        var subjects = ctx.AllSubjects(); // (try right side for 
                //    }
                //}
                return Task.FromResult(context);
            }
            async;
            Task < bool > _How_Is_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("How is what?");
                return true;
            }
            async;
            Task < bool > _Is_What_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("Is what?");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
            //[ConceptHandler("How are")]
            //ConceptHandlerContext _How_are(ConceptHandlerContext context)
            //{
            //    if (context.WasPrevious(null))
            //        context.AddIntentHandler(_How_Intent, context.Operation.MinConfidence);
            //    return context;
            //}
            //[IntentHandler("How are [subject]")]
            //bool _How_are_Intent(ConceptHandlerContext context)
            //{
            //    Brain.DoResponse("How are what?");
            //    return true;
            //}
            // --------------------------------------------------------------------------------------------------------------------
            // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, and assigned attributes from the right side. *** 
            [ConceptHandler("are")];
            Task < ConceptHandlerContext > _Are(ConceptHandlerContext, context);
            {
                if (context.WasPrevious("how"))
                    context.AddIntentHandler(_How_Are_Intent, 0.5, d);
                return Task.FromResult(context);
            }
            async;
            Task < bool > _How_Are_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("How are what?");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=ToBe.js.map