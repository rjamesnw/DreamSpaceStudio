"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const QuestionsConcept_1 = require("./QuestionsConcept");
const TimeConcept_1 = require("./TimeConcept");
const DictionaryItem_1 = require("../core/DictionaryItem");
const POS_1 = require("../core/POS");
/**
 *  Handles common known nouns.
*/
class PronounsConceptConcept extends Concept_1.default {
    constructor(brain) {
        super(brain);
    }
    onAfterAllRegistered() {
        // ... get a reference to the concepts we will associated with ...
        this._questionsConcept = this.brain.getConcept(QuestionsConcept_1.default);
        this._timeConcept = this.brain.getConcept(TimeConcept_1.default);
    }
    // --------------------------------------------------------------------------------------------------------------------
    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, and assigned attributes from the right side. *** 
    _You(context) {
        if (context.context.HasQuestion(this._questionsConcept.how_AV))
            if (context.WasPrevious("are"))
                context.addIntentHandler(new DS.Delegate(this, this._How_Are_You_Intent), context.operation.MaxConfidence);
        return Promise.resolve(context);
    }
    async _How_Are_You_Intent(context) {
        await this.brain.doResponse("I'm doing great, thanks.");
        return Promise.resolve(true);
    }
    // --------------------------------------------------------------------------------------------------------------------
    _Noun_he_she(context) {
        return Promise.resolve(context);
    }
    // --------------------------------------------------------------------------------------------------------------------
    //@conceptHandler("it")
    //async _It_Exclamation(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    if (context.context.HasQuestion(_QuestionsConcept.What)) {
    //        if (context.WasPrevious("is") && context.context.AllSubjects().Any(s => s.NameOrTitle == _TimeConcept.Time))
    //            context.addIntentHandler(new DS.Delegate(this, this._What_Time_Is_It_Intent), context.operation.MaxConfidence);
    //    }
    //    return Promise.resolve(context);
    //}
    async _What_Time_Is_It_Intent(context) {
        await this.brain.doResponse("The time is " + new Date().toUTCString());
        return Promise.resolve(true);
    }
}
// --------------------------------------------------------------------------------------------------------------------
PronounsConceptConcept.you_PN = new DictionaryItem_1.default("you", POS_1.default.Pronoun_Subject);
__decorate([
    Concept_1.conceptHandler(PronounsConceptConcept.you_PN)
], PronounsConceptConcept.prototype, "_You", null);
__decorate([
    Concept_1.conceptHandler("she,he", "* she^N|he^N *") // (ex: "He is", "She is",  "Is that a he or she?")
], PronounsConceptConcept.prototype, "_Noun_he_she", null);
exports.default = PronounsConceptConcept;
//# sourceMappingURL=PronounsConcept.js.map