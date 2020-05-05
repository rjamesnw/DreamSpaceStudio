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
        class SpeakingConcept {
        }
        Concept;
        {
            SpeakingConcept(Brain, brian);
            base(brian);
            {
                Say = Memory.Dictionary.AddTextPart("say", POS.Noun_Person);
            }
            DictionaryItem;
            Say;
            // --------------------------------------------------------------------------------------------------------------------
            // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
            [ConceptHandler("say")];
            _Say_Intent(context, ConceptHandlerContext);
            Promise < ConceptHandlerContext > _Names(context, ConceptHandlerContext);
            {
                if (context.WasPrevious(null))
                    context.AddIntentHandler(_Say_Intent, context.Operation.MinConfidence);
                return Promise.resolve(context);
            }
            async;
            Task < bool > // (must always provide an intent to fall-back to if a better one isn't found)
                {
                    await, Brain, : .DoResponse("Say what."),
                    return: true
                };
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=SpeakingConcept.js.map