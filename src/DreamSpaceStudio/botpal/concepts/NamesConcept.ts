import Concept, { concept, conceptHandler, ConceptHandlerContext } from "../core/Concept";
import DictionaryItem from "../core/DictionaryItem";
import Brain from "../core/Brain";
import POS from "../core/POS";

@concept(true)
export default class NamesConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain)
        this.Deb = this.memory.dictionary.addTextPart("deb", POS.Noun_Person);
        this.Debra = this.memory.dictionary.addTextPart("debra", POS.Noun_Person);
        this.Debohrra = this.memory.dictionary.addTextPart("debohrra", POS.Noun_Person);
        this.James = this.memory.dictionary.addTextPart("james", POS.Noun_Person);
    }

    readonly Deb: DictionaryItem;
    readonly Debra: DictionaryItem;
    readonly Debohrra: DictionaryItem;
    readonly James: DictionaryItem;

    CurrentName: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
    @conceptHandler("deb,debra,debohrra,james")
    _Names(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            (<NamesConcept>context.currentMatch.item.Concept).CurrentName = context.currentMatch.item.DictionaryItem;
            context.addIntentHandler(new DS.Delegate(this, this._Name_Intent), context.operation.MinConfidence);
        }
        return Promise.resolve(context);
    }

    async  _Name_Intent(context: ConceptHandlerContext): Promise<boolean> // (must always provide an intent to fall-back to if a better one isn't found)
    {
        await this.brain.doResponse("Yes, please continue.");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
