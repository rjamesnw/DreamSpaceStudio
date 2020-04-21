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
        [Concept];
        class TimeConcept {
        }
        Concept;
        {
            TimeConcept(Brain, brian);
            base(brian);
            {
                // (https://foxtype.com/sentence-tree)
                Time = Memory.Dictionary.AddTextPart("time", POS.Noun_Temporal);
            }
            DictionaryItem;
            Time;
            // --------------------------------------------------------------------------------------------------------------------
            //[ConceptHandler("what^D time^N is^V it^PN")]
            //[ConceptHandler("what^D is^V the^D time^N")]
            //Task<ConceptHandlerContext> _GetTime(ConceptHandlerContext context)
            //{
            //    return Task.FromResult(context);
            //}
            //[ConceptHandler("it^PN is^V time^N")]
            //Task<ConceptHandlerContext> _IsTime(ConceptHandlerContext context)
            //{
            //    return Task.FromResult(context);
            //}
            //[ConceptHandler("it^PN is^V time^N to^")]
            //Task<ConceptHandlerContext> _IsTimeTo(ConceptHandlerContext context)
            //{
            //    return Task.FromResult(context);
            //}
            [ConceptHandler("Time", "time")];
            Task < ConceptHandlerContext > _What_Unknown_Question(ConceptHandlerContext, context);
            {
                if (context.WasPrevious("what")) {
                    context.Context.Add(new SubjectContext(Memory, this, Time));
                    context.AddIntentHandler(_Time_Intent, context.Operation.MinConfidence);
                }
                return Task.FromResult(context);
            }
            async;
            Task < bool > _Time_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("I don't know what time.");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=Time.js.map