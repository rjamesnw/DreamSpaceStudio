import Concept, { conceptHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";

export default class AdverbConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("that", " * that^AV *") // (ex: "I would not go that far")
    _Adverb(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
