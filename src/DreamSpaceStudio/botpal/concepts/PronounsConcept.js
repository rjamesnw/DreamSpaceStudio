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
            _How_Are_You_Intent(context, ConceptHandlerContext);
            Promise < ConceptHandlerContext > _You(context, ConceptHandlerContext);
            {
                if (context.Context.HasQuestion(_QuestionsConcept.How))
                    if (context.WasPrevious("are"))
                        context.AddIntentHandler(_How_Are_You_Intent, 1, d);
                return Promise.resolve(context);
            }
            async;
            Task < bool >
                {
                    await, Brain, : .DoResponse("I'm doing great, thanks."),
                    return: true
                }
                // --------------------------------------------------------------------------------------------------------------------
                [ConceptHandler("she,he", "* she^N|he^N *")]; // (ex: "He is", "She is",  "Is that a he or she?")
            _Noun_he_she(context, ConceptHandlerContext);
            Promise < ConceptHandlerContext >
                {
                    return: Promise.resolve(context)
                }
                // --------------------------------------------------------------------------------------------------------------------
                [ConceptHandler("it")];
            _What_Time_Is_It_Intent(context, ConceptHandlerContext);
            Promise < ConceptHandlerContext > _It_Exclamation(context, ConceptHandlerContext);
            {
                if (context.Context.HasQuestion(_QuestionsConcept.What)) {
                    if (context.WasPrevious("is") && context.Context.AllSubjects().Any(s => s.NameOrTitle == _TimeConcept.Time))
                        context.AddIntentHandler(_What_Time_Is_It_Intent, 1, d);
                }
                return Promise.resolve(context);
            }
            async;
            Task < bool >
                {
                    await, Brain, : .DoResponse("The time is " + DateTime.Now.ToShortTimeString()),
                    return: true
                };
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=PronounsConcept.js.map