import Concept, { concept, conceptHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import DictionaryItem from "../core/DictionaryItem";
import QuestionsConcept from "./QuestionsConcept";

/**
 *  This concept coverts the idea of "when {some criteria} do {some action}" style statements.
 */
@concept()
export default class LogicConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------


    public constructor(brain: Brain) {
        super(brain)
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.when_AV) //x "when^AV ^N/^PN ^V ^V/^T/^N/^PP ^V"
    _FindWhen(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
