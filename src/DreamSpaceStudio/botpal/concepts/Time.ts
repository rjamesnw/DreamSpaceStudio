import Concept, { conceptHandler, concept } from "../core/Concept";
import Brain from "../core/Brain";
import DictionaryItem from "../core/DictionaryItem";

@concept()
export default class TimeConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian)
        // (https://foxtype.com/sentence-tree)

        this.time = this.Memory.Dictionary.AddTextPart("time", this.POS.Noun_Temporal);
    }

    // --------------------------------------------------------------------------------------------------------------------

    readonly time: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    //[ConceptHandler("what^D time^N is^V it^PN")]
    //[ConceptHandler("what^D is^V the^D time^N")]
    //Task<ConceptHandlerContext> _GetTime(ConceptHandlerContext context)
    //{
    //    return Task.FromResult(context);
    //}

    //[ConceptHandler("it^PN is^V time^N")]
    //Task<ConceptHandlerContext> _IsTime(ConceptHandlerContext context)
    //{
    //    return Task.FromResult(context);
    //}

    //[ConceptHandler("it^PN is^V time^N to^")]
    //Task<ConceptHandlerContext> _IsTimeTo(ConceptHandlerContext context)
    //{
    //    return Task.FromResult(context);
    //}

    @conceptHandler("Time", "time")
    _What_Unknown_Question(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious("what")) {
            context.Context.Add(new SubjectContext(Memory, this, Time));
            context.AddIntentHandler(_Time_Intent, context.Operation.MinConfidence);
        }
        return Promise.resolve(context);
    }

    async  _Time_Intent(context: ConceptHandlerContext): Promise<bool> {
        await Brain.DoResponse("I don't know what time.");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
