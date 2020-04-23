/**
 * Adds rules to help determine colors.
 * @param Brain brian
 * @returns
 */
export default class ColorConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian);
    }

    // --------------------------------------------------------------------------------------------------------------------

    [ConceptHandler("red,green,blue,purple,yellow,black,white,brown,cyan,sky blue,magenta,gold")]
    Task<ConceptHandlerContext> _AssignColor(ConceptHandlerContext context) {
        var currentContext = context.Context; // (get the current context)
        var subject = currentContext.Get<IUnderlyingContext<SubjectContext>>();
        //x var subjectRootContext = currentContext.SubjectRootContext; // (get the root context with subjects)
        var color = context.CurrentDictionaryItem; // (get the color dictionary entry that resulted in this handler call)
        var colorContext = new ColorContext(this, color); // (add it to a new color context)
        context.Context.Add(colorContext); // (connect it to the root subject context)
        return Task.FromResult(context.SetConfidence(1d));
    }

    // --------------------------------------------------------------------------------------------------------------------
}
