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
        /// Handles common known nouns.
        /// </summary>
        class PronounsConceptConcept {
        }
        Concept;
        {
            PronounsConceptConcept(Brain, brian);
            base(brian);
            {
            }
            internal;
            override;
            void OnAfterAllRegistered();
            {
                // ... get a reference to the concepts we will associated with ...
                _QuestionsConcept = Brain.GetConcept();
                _TimeConcept = Brain.GetConcept();
            }
            QuestionsConcept;
            _QuestionsConcept;
            TimeConcept;
            _TimeConcept;
            // --------------------------------------------------------------------------------------------------------------------
            // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, and assigned attributes from the right side. *** 
            [ConceptHandler("you")];
            Task < ConceptHandlerContext > _You(ConceptHandlerContext, context);
            {
                if (context.Context.HasQuestion(_QuestionsConcept.How))
                    if (context.WasPrevious("are"))
                        context.AddIntentHandler(_How_Are_You_Intent, 1, d);
                return Task.FromResult(context);
            }
            async;
            Task < bool > _How_Are_You_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("I'm doing great, thanks.");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("she,he", "* she^N|he^N *")]; // (ex: "He is", "She is",  "Is that a he or she?")
            Task < ConceptHandlerContext > _Noun_he_she(ConceptHandlerContext, context);
            {
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("it")];
            Task < ConceptHandlerContext > _It_Exclamation(ConceptHandlerContext, context);
            {
                if (context.Context.HasQuestion(_QuestionsConcept.What)) {
                    if (context.WasPrevious("is") && context.Context.AllSubjects().Any(s => s.NameOrTitle == _TimeConcept.Time))
                        context.AddIntentHandler(_What_Time_Is_It_Intent, 1, d);
                }
                return Task.FromResult(context);
            }
            async;
            Task < bool > _What_Time_Is_It_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("The time is " + DateTime.Now.ToShortTimeString());
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=PronounsConcept.js.map