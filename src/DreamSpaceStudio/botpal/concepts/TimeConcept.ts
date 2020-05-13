import Concept, { conceptHandler, concept, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";
import SubjectContext from "../contexts/SubjectContext";

@concept()
export default class TimeConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------
    // (https://foxtype.com/sentence-tree)

    static readonly time = new DictionaryItem("time", POS.Noun_Temporal);
    readonly time: DictionaryItem;

    constructor(brian: Brain) {
        super(brian)
    }

    // --------------------------------------------------------------------------------------------------------------------

    //@conceptHandler("what^D time^N is^V it^PN")
    //@conceptHandler("what^D is^V the^D time^N")
    //_GetTime(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    return Promise.resolve(context);
    //}

    //@conceptHandler("it^PN is^V time^N")
    //_IsTime(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    return Promise.resolve(context);
    //}

    //@conceptHandler("it^PN is^V time^N to^")
    //_IsTimeTo(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    await this.brain.doResponse("I don't know what time.")
    //    {
    //        return Promise.resolve(context);
    //    }

    @conceptHandler("time", "time")
    _What_Unknown_Question(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious("what")) {
            context.Context.Add(new SubjectContext(this.memory, this, this.time));
            context.AddIntentHandler(this._Time_Intent, context.Operation.MinConfidence);
        }
        return Promise.resolve(context);
    }

    async  _Time_Intent(context: ConceptHandlerContext): Promise<boolean> {
        return Promise.resolve(true);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
