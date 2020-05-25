import Concept, { concept, conceptHandler, ConceptHandlerContext } from "../core/Concept"
import Brain from "../core/Brain";

/** Covers "is"/"are" concepts for when applying attributes and relationships between subjects. */
@concept()
export default class ToBeConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain)
    }

    // --------------------------------------------------------------------------------------------------------------------

    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
    @conceptHandler("is")
    _Is(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious("how"))
            context.addIntentHandler(this._How_Is_Intent, context.Operation.MinConfidence);
        else if (context.WasPrevious("time"))
            context.addIntentHandler(this._How_Is_Intent, context.Operation.MinConfidence);
        else
            context.addIntentHandler(this._Is_What_Intent, context.Operation.MinConfidence);
        //{
        //    var ctx = context.Context;
        //    if (ctx.AllSubjects().Any())
        //    {
        //        if (ctx.HasActions)
        //        {
        //            // ... assign actions (could be more than one) ...
        //        }
        //        else if (ctx.HasAttributes)
        //        {
        //            // ... assign attributes ...
        //        }
        //    }
        //    else
        //    {
        //        var subjects = ctx.AllSubjects(); // (try right side for 
        //    }
        //}
        return Promise.resolve(context);
    }

    async  _How_Is_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("How is what?");
        return true;
    }

    async  _Is_What_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("Is what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    //@conceptHandler("How are")
    //ConceptHandlerContext _How_are(context: ConceptHandlerContext )
    //{
    //    if (context.WasPrevious(null))
    //        context.AddIntentHandler(_How_Intent, context.Operation.MinConfidence);
    //    return context;
    //}

    //[IntentHandler("How are [subject]")]
    //bool _How_are_Intent(context: ConceptHandlerContext )
    //{
    //    Brain.DoResponse("How are what?");
    //    return true;
    //}

    // --------------------------------------------------------------------------------------------------------------------

    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, and assigned attributes from the right side. *** 
    @conceptHandler("are")
    async _Are(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious("how"))
            context.addIntentHandler(this._How_Are_Intent, 0.5);
        return Promise.resolve(context);
    }

    async _How_Are_Intent(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        await this.brain.doResponse("How are what?");
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
