﻿import Concept, { concept, conceptHandlerAttribute } from "../core/Concept";
import DictionaryItem from "../core/DictionaryItem";
import Brain from "../core/Brain";

@concept(true)
export default class NamesConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian)
        this.Deb = this.Memory.Dictionary.AddTextPart("deb", POS.Noun_Person);
        this.Debra = this.Memory.Dictionary.AddTextPart("debra", POS.Noun_Person);
        this.Debohrra = this.Memory.Dictionary.AddTextPart("debohrra", POS.Noun_Person);
        this.James = this.Memory.Dictionary.AddTextPart("james", POS.Noun_Person);
    }

    readonly Deb: DictionaryItem;
    readonly Debra: DictionaryItem;
    readonly Debohrra: DictionaryItem;
    readonly James: DictionaryItem;

    CurrentName: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
    @conceptHandlerAttribute("deb,debra,debohrra,james")
    _Names(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            ((NamesConcept)context.CurrentMatch.Item.Concept).CurrentName = context.CurrentMatch.Item.DictionaryItem;
            context.AddIntentHandler(_Name_Intent, context.Operation.MinConfidence);
        }
        return Promise.resolve(context);
    }

    async  _Name_Intent(context: ConceptHandlerContext): Promise<bool> // (must always provide an intent to fall-back to if a better one isn't found)
    {
        await Brain.DoResponse("Yes, please continue.");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
