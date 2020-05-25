import Concept, { concept, conceptHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import NamesConcept from "./NamesConcept";

/**
 *  Adds rules to help determine colors.
*/
@concept()
export default class SalutationConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Hi")
    _Hi(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null) && context.IsNext(null))
            context.addIntentHandler(new DS.Delegate(this, this._Hi_Intent), 1);
        else if (context.WasPrevious("say"))
            context.addIntentHandler(new DS.Delegate(this, this._SayHi_Intent), 1);
        return Promise.resolve(context.SetConfidence(1));
    }

    async _Hi_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("Hello.");
        return true;
    }

    async _SayHi_Intent(context: ConceptHandlerContext): Promise<boolean> {
        var name = "";
        var c = this.brain.getConcept(NamesConcept);
        if (c?.CurrentName?.textPart != null)
            name = " " + c.CurrentName.textPart.text;
        await this.brain.doResponse("Hi" + name + ".");
        return true;
    }

    @conceptHandler("Hello")
    _Hello(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null) && context.IsNext(null))
            context.addIntentHandler(new DS.Delegate(this, this._Hello_Intent), 1);
        return Promise.resolve(context.SetConfidence(1));
    }

    async  _Hello_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("Hi there.");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------
}

