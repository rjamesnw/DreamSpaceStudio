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
        /// Adds rules to help determine colors.
        /// </summary>
        class ColorConcept {
        }
        Concept;
        {
            ColorConcept(Brain, brian);
            base(brian);
            {
            }
            // --------------------------------------------------------------------------------------------------------------------
            [ConceptHandler("red,green,blue,purple,yellow,black,white,brown,cyan,sky blue,magenta,gold")];
            Task < ConceptHandlerContext > _AssignColor(ConceptHandlerContext, context);
            {
                var currentContext = context.Context; // (get the current context)
                var subject = currentContext.Get();
                //x var subjectRootContext = currentContext.SubjectRootContext; // (get the root context with subjects)
                var color = context.CurrentDictionaryItem; // (get the color dictionary entry that resulted in this handler call)
                var colorContext = new ColorContext(this, color); // (add it to a new color context)
                context.Context.Add(colorContext); // (connect it to the root subject context)
                return Task.FromResult(context.SetConfidence(1, d));
            }
            // --------------------------------------------------------------------------------------------------------------------
        }
    })(Concepts = BotPal.Concepts || (BotPal.Concepts = {}));
})(BotPal || (BotPal = {}));
//# sourceMappingURL=ColorConcept.js.map