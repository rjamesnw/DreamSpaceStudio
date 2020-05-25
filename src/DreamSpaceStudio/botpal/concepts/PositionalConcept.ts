import Concept, { ConceptHandlerContext, concept, conceptHandler } from "../core/Concept";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";
import Brain from "../core/Brain";

@concept()
export default class PositionalConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    static readonly here = new DictionaryItem("here", POS.Pronoun_Subject);
    readonly here: DictionaryItem;

    constructor(brain: Brain) {
        super(brain);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(PositionalConcept.here)
    _NameIsHere(context: ConceptHandlerContext) {
        if (context.WasPrevious("is"))
            context.addIntentHandler(new DS.Delegate(this, this._NameIsHere_Intent), 0.9);
        return Promise.resolve(context);
    }

    async _NameIsHere_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("Ok.");
        return Promise.resolve(true);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
