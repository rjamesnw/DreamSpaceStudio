import Concept, { concept, conceptHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import QuestionsConcept from "./QuestionsConcept";
import TimeConcept from "./TimeConcept";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";

@concept()
export default class SpeakingConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain)
        this.Say = this.memory.dictionary.addTextPart("say", POS.Noun_Person);
    }

    readonly Say: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
    @conceptHandler("say")
    _Names(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.addIntentHandler(new DS.Delegate(this, this._Say_Intent), context.operation.MinConfidence);
        return Promise.resolve(context);
    }

    async _Say_Intent(context: ConceptHandlerContext): Promise<boolean> // (must always provide an intent to fall-back to if a better one isn't found)
    {
        await this.brain.doResponse("Say what.");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
