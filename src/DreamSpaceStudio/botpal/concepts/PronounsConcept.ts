import Concept, { conceptHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import QuestionsConcept from "./QuestionsConcept";
import TimeConcept from "./TimeConcept";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";

/**
 *  Handles common known nouns.
*/
export default class PronounsConceptConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    static readonly you_PN = new DictionaryItem("you", POS.Pronoun_Subject);
    readonly you_PN: DictionaryItem;

    constructor(brain: Brain) {
        super(brain)
    }

    onAfterAllRegistered() {
        // ... get a reference to the concepts we will associated with ...

        this._questionsConcept = this.brain.getConcept(QuestionsConcept);
        this._timeConcept = this.brain.getConcept(TimeConcept);
    }

    _questionsConcept: QuestionsConcept;
    _timeConcept: TimeConcept;

    // --------------------------------------------------------------------------------------------------------------------

    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, and assigned attributes from the right side. *** 
    @conceptHandler(PronounsConceptConcept.you_PN)
    _You(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.context.HasQuestion(this._questionsConcept.how_AV))
            if (context.WasPrevious("are"))
                context.addIntentHandler(new DS.Delegate(this, this._How_Are_You_Intent), context.operation.MaxConfidence);
        return Promise.resolve(context);
    }

    async _How_Are_You_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("I'm doing great, thanks.");
        return Promise.resolve(true);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("she,he", "* she^N|he^N *") // (ex: "He is", "She is",  "Is that a he or she?")
    _Noun_he_she(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("it")
    async _It_Exclamation(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.context.HasQuestion(_QuestionsConcept.What)) {
            if (context.WasPrevious("is") && context.context.AllSubjects().Any(s => s.NameOrTitle == _TimeConcept.Time))
                context.addIntentHandler(new DS.Delegate(this, this._What_Time_Is_It_Intent), context.operation.MaxConfidence);
        }
        return Promise.resolve(context);
    }

    async _What_Time_Is_It_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("The time is " + new Date().toUTCString());
        return Promise.resolve(true);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
