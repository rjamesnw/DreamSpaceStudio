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
        var _a;
        /// <summary>
        /// Adds rules to help determine colors.
        /// </summary>
        class SalutationConcept {
        }
        Concept;
        {
            SalutationConcept(Brain, brian);
            base(brian);
            {
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("Hi")];
            Task < ConceptHandlerContext > _Hi(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null) && context.IsNext(null))
                    context.AddIntentHandler(_Hi_Intent, 1, d);
                else if (context.WasPrevious("say"))
                    context.AddIntentHandler(_SayHi_Intent, 1, d);
                return Task.FromResult(context.SetConfidence(1, d));
            }
            async;
            Task < bool > _Hi_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("Hello.");
                return true;
            }
            async;
            Task < bool > _SayHi_Intent(ConceptHandlerContext, context);
            {
                string;
                name = "";
                var c = Brain.GetConcept();
                if (((_a = c === null || c === void 0 ? void 0 : c.CurrentName) === null || _a === void 0 ? void 0 : _a.TextPart) != null)
                    name = " " + c.CurrentName.TextPart.Text;
                await Brain.DoResponse("Hi" + name + ".");
                return true;
            }
            [ConceptHandler("Hello")];
            Task < ConceptHandlerContext > _Hello(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null) && context.IsNext(null))
                    context.AddIntentHandler(_Hello_Intent, 1, d);
                return Task.FromResult(context.SetConfidence(1, d));
            }
            async;
            Task < bool > _Hello_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("Hi there.");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=SalutationConcept.js.map