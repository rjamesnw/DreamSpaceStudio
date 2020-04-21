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
        class QuestionsConcept {
        }
        Concept;
        {
            QuestionsConcept(Brain, brian);
            base(brian);
            {
                Who = Memory.Dictionary.AddTextPart("who", POS.Pronoun_Subject);
                What = Memory.Dictionary.AddTextPart("what", POS.Pronoun_Subject);
                When = Memory.Dictionary.AddTextPart("when", POS.Adverb);
                Where = Memory.Dictionary.AddTextPart("where", POS.Adverb);
                Why = Memory.Dictionary.AddTextPart("why", POS.Adverb);
                How = Memory.Dictionary.AddTextPart("how", POS.Adverb);
                Are = Memory.Dictionary.AddTextPart("are", POS.Verb_Is);
                Is = Memory.Dictionary.AddTextPart("is", POS.Verb_Is);
                If = Memory.Dictionary.AddTextPart("if", POS.Conjunction);
                Can = Memory.Dictionary.AddTextPart("can", POS.Verb_AbleToOrPermitted);
            }
            DictionaryItem;
            Who;
            DictionaryItem;
            What;
            DictionaryItem;
            When;
            DictionaryItem;
            Where;
            DictionaryItem;
            Why;
            DictionaryItem;
            How;
            DictionaryItem;
            Are;
            DictionaryItem;
            Is;
            DictionaryItem;
            If;
            DictionaryItem;
            Can;
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("Who^PN")];
            Task < ConceptHandlerContext > _Who(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, Who));
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("name", "what^PN is^V ^PN name")];
            Task < ConceptHandlerContext > _GetName(ConceptHandlerContext, context);
            {
                return Task.FromResult(context);
            }
            [ConceptHandler("What!?")];
            Task < ConceptHandlerContext > _What_Exclamation(ConceptHandlerContext, context);
            {
                context.AddIntentHandler(_What_Excl_Intent, 1, d);
                return Task.FromResult(context);
            }
            async;
            Task < bool > _What_Excl_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("Why so surprised?");
                return true;
            }
            [ConceptHandler("What")];
            Task < ConceptHandlerContext > _What_Unknown_Question(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null)) {
                    context.Context.Add(new QuestionContext(this, What));
                    context.AddIntentHandler(_What_Intent, context.Operation.MinConfidence); // (this is like a fall-back plan if nothing else better is found)
                }
                return Task.FromResult(context);
            }
            async;
            Task < bool > _What_Intent(ConceptHandlerContext, context);
            {
                await Brain.DoResponse("What about what?");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("When")];
            Task < ConceptHandlerContext > _When(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, When));
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("Where")];
            Task < ConceptHandlerContext > _Where(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, Where));
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("Why", "Why *")];
            Task < ConceptHandlerContext > _Why(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, Why));
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("How")];
            Task < ConceptHandlerContext > _How(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null)) {
                    context.Context.Add(new QuestionContext(this, How));
                    context.AddIntentHandler(_How_Intent, context.Operation.MinConfidence);
                }
                return Task.FromResult(context);
            }
            [IntentHandler("How")];
            async;
            Task < bool > _How_Intent(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    await Brain.DoResponse("How what?");
                return true;
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("Can", "Can *")];
            Task < ConceptHandlerContext > _Can(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, Can));
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("Is", "Is *")];
            Task < ConceptHandlerContext > _Is(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, Is));
                return Task.FromResult(context);
            }
            [ConceptHandler("Are", "Are *")];
            Task < ConceptHandlerContext > _Are(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, Are));
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("If", "If *")];
            Task < ConceptHandlerContext > _If(ConceptHandlerContext, context);
            {
                if (context.WasPrevious(null))
                    context.Context.Add(new QuestionContext(this, If));
                return Task.FromResult(context);
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=QuestionsConcept.js.map