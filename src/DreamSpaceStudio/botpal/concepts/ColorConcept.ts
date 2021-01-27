import Concept, { conceptHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import ColorContext from "../contexts/ColorContext";
import { IUnderlyingContext } from "../contexts/GroupContext";
import SubjectContext from "../contexts/SubjectContext";

/**
 * Adds rules to help determine colors.
 * @param Brain brain
 * @returns
 */
export default class ColorConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain);
    }

    // --------------------------------------------------------------------------------------------------------------------

    //@conceptHandler("red,green,blue,purple,yellow,black,white,brown,cyan,sky blue,magenta,gold")
    //_AssignColor(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    var currentContext = context.context; // (get the current context)
    //    var subject = currentContext.Get<IUnderlyingContext<SubjectContext>>();
    //    //x var subjectRootContext = currentContext.SubjectRootContext; // (get the root context with subjects)
    //    var color = context.currentDictionaryItem; // (get the color dictionary entry that resulted in this handler call)
    //    var colorContext = new ColorContext(this, color); // (add it to a new color context)
    //    context.context.Add(colorContext); // (connect it to the root subject context)
    //    return Promise.resolve(context.SetConfidence(1));
    //}

    // --------------------------------------------------------------------------------------------------------------------
}
