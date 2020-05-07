import Concept, { conceptHandler, concept } from "../core/Concept";
import Brain from "../core/Brain";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";

@concept()
export default class TimeConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian)
        // (https://foxtype.com/sentence-tree)

        this.time = this.memory.dictionary.addTextPart("time", POS.Noun_Temporal);
    }

    // --------------------------------------------------------------------------------------------------------------------

    readonly time: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    //@conceptHandler("what^D time^N is^V it^PN")
    //@conceptHandler("what^D is^V the^D time^N")
    // _GetTime(context: ConceptHandlerContext ): Promise<ConceptHandlerContext>
    //{
    //    return Promise.resolve(context);
    //}

    //@conceptHandler("it^PN is^V time^N")
    // _IsTime(context: ConceptHandlerContext ): Promise<ConceptHandlerContext>
    //{
    //    return Promise.resolve(context);
    //}

    //@conceptHandler("it^PN is^V time^N to^")
    // {
        await this.brain.doResponse("I don't know what time."): Promise < ConceptHandlerContext > _IsTimeTo(context: ConceptHandlerContext)
//{
//    return Promise.resolve(context);
//}

@conceptHandler("time", "time")
_What_Unknown_Question(context: ConceptHandlerContext): Promise < ConceptHandlerContext > {
    if(context.WasPrevious("what")) {
    context.Context.Add(new SubjectContext(Memory, this, Time));
    context.AddIntentHandler(_Time_Intent, context.Operation.MinConfidence);
}
return Promise.resolve(context);
    }

async  _Time_Intent(context: ConceptHandlerContext): Promise<boolean>;
return true;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
