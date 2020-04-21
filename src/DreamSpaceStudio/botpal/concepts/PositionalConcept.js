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
        class PositionalConcept {
        }
        Concept;
        {
            PositionalConcept(Brain, brian);
            base(brian);
            {
                Here = Memory.Dictionary.AddTextPart("here", POS.Preposition_Spatial);
            }
            DictionaryItem;
            Here;
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("here")];
            Task < ConceptHandlerContext > _NameIsHere(ConceptHandlerContext, context);
            {
                if (context.WasPrevious("is"))
                    context.AddIntentHandler(_NameIsHere_Intent, 0.9, d);
                return Task.FromResult(context);
            }
            async;
            Task < bool > _NameIsHere_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("Ok.");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=PositionalConcept.js.map