import Concept, { conceptHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";

export default class AdjectiveConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(null, "* ^AD ^N *") // (ex: "I would not go that far")
    _Adjective(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
