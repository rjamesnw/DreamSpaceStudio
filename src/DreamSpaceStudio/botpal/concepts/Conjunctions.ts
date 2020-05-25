import Concept, { concept, conceptHandler, ConceptHandlerContext } from "../core/Concept"
import Brain from "../core/Brain"
import POS from "../core/POS";
import DictionaryItem from "../core/DictionaryItem";

/**
 *  A concept to understand and handle pronouns.
*/
@concept()
export default class ConjunctionConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    static readonly and = new DictionaryItem("and", POS.Conjunction);
    readonly and: DictionaryItem;

    static readonly that = new DictionaryItem("that", POS.Conjunction);
    readonly that: DictionaryItem;

    constructor(brain: Brain) {
        super(brain)
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(
        ConjunctionConcept.and,
        ConjunctionConcept.that) // (ex: "she said that she was satisfied" [statement or hypothesis] / "oh that he could be restored to health" [wish or regret])
    _conjunction(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
