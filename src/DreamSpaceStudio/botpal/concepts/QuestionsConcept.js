"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QuestionsConcept_1;
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const QuestionContext_1 = require("../contexts/QuestionContext");
const DictionaryItem_1 = require("../core/DictionaryItem");
const POS_1 = require("../core/POS");
const SubjectContext_1 = require("../contexts/SubjectContext");
let QuestionsConcept = QuestionsConcept_1 = class QuestionsConcept extends Concept_1.default {
    constructor(brain) {
        super(brain);
    }
    // --------------------------------------------------------------------------------------------------------------------
    //@conceptHandler(QuestionsConcept.who_PN)
    //_Who(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    if (context.WasPrevious(null))
    //        context.context.Add(new QuestionContext(this, this.who_PN));
    //    return Promise.resolve(context);
    //}
    // --------------------------------------------------------------------------------------------------------------------
    _GetName(context) {
        return Promise.resolve(context);
    }
    _What_Exclamation(context) {
        context.addIntentHandler(new DS.Delegate(this, this._What_Excl_Intent), 1);
        return Promise.resolve(context);
    }
    async _What_Excl_Intent(context) {
        await this.brain.doResponse("Why so surprised?");
        return true;
    }
    //@conceptHandler(QuestionsConcept.what)
    //_What_Unknown_Question(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    if (context.WasPrevious(null)) {
    //        context.context.Add(new QuestionContext(this, this.what_PN));
    //        context.addIntentHandler(new DS.Delegate(this, this._What_Intent), context.operation.MinConfidence); // (this is like a fall-back plan if nothing else better is found)
    //    }
    //    return Promise.resolve(context);
    //}
    async _What_Intent(context) {
        await this.brain.doResponse("What about what?");
        return true;
    }
    // --------------------------------------------------------------------------------------------------------------------
    //@conceptHandler(QuestionsConcept.when_AV)
    //_When(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    if (context.WasPrevious(null))
    //        context.context.Add(new QuestionContext(this, this.when_AV));
    //    return Promise.resolve(context);
    //}
    // --------------------------------------------------------------------------------------------------------------------
    //@conceptHandler(QuestionsConcept.where_AV)
    //_Where(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    if (context.WasPrevious(null))
    //        context.context.Add(new QuestionContext(this, this.where_AV));
    //    return Promise.resolve(context);
    //}
    // --------------------------------------------------------------------------------------------------------------------
    //@conceptHandler(QuestionsConcept.why_AV)
    //_Why(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    if (context.WasPrevious(null))
    //        context.context.Add(new QuestionContext(this, this.why_AV));
    //    return Promise.resolve(context);
    //}
    // --------------------------------------------------------------------------------------------------------------------
    //@conceptHandler(QuestionsConcept.how_AV)
    //_How(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
    //    if (context.WasPrevious(null)) {
    //        context.context.Add(new QuestionContext(this, this.how_AV));
    //        context.addIntentHandler(new DS.Delegate(this, this._How_Intent), context.operation.MinConfidence);
    //    }
    //    return Promise.resolve(context);
    //}
    async _How_Intent(context) {
        if (context.WasPrevious(null))
            await this.brain.doResponse("How what?");
        return true;
    }
};
// --------------------------------------------------------------------------------------------------------------------
QuestionsConcept.who_PN = new DictionaryItem_1.default("Who", POS_1.default.Pronoun_Subject);
QuestionsConcept.what = new DictionaryItem_1.default("What");
QuestionsConcept.what_PN = new DictionaryItem_1.default("What", POS_1.default.Pronoun_Subject);
QuestionsConcept.what_D = new DictionaryItem_1.default("What", POS_1.default.Determiner);
QuestionsConcept.what_AV = new DictionaryItem_1.default("What", POS_1.default.Adverb);
/** When: Adverb */
QuestionsConcept.when_AV = new DictionaryItem_1.default("When", POS_1.default.Adverb);
QuestionsConcept.where_AV = new DictionaryItem_1.default("Where", POS_1.default.Adverb);
QuestionsConcept.why_AV = new DictionaryItem_1.default("Why", POS_1.default.Adverb);
QuestionsConcept.how_AV = new DictionaryItem_1.default("How", POS_1.default.Adverb);
QuestionsConcept.are_V = new DictionaryItem_1.default("Are", POS_1.default.Verb_Is);
QuestionsConcept.is_V = new DictionaryItem_1.default("Is", POS_1.default.Verb_Is);
QuestionsConcept.if_C = new DictionaryItem_1.default("If", POS_1.default.Conjunction);
QuestionsConcept.can_V = new DictionaryItem_1.default("Can", POS_1.default.Verb_AbleToOrPermitted);
QuestionsConcept.Name_N = new DictionaryItem_1.default("name", POS_1.default.Noun); // (the name)
QuestionsConcept.Name_V = new DictionaryItem_1.default("name", POS_1.default.Verb); // (naming)
QuestionsConcept.Name_A = new DictionaryItem_1.default("name", POS_1.default.Adjective); // (named)
__decorate([
    Concept_1.conceptHandler(QuestionsConcept_1.Name_N, QuestionsConcept_1.Name_V, QuestionsConcept_1.Name_A) //"what^PN is^V ^PN name"
    ,
    Concept_1.contexts(QuestionContext_1.default, SubjectContext_1.default, 'tobe|is') //"what^PN is^V ^PN name"
], QuestionsConcept.prototype, "_GetName", null);
__decorate([
    Concept_1.conceptHandler(QuestionsConcept_1.what_PN, QuestionsConcept_1.what_D, QuestionsConcept_1.what_AV, "!")
], QuestionsConcept.prototype, "_What_Exclamation", null);
__decorate([
    Concept_1.intentHandler(QuestionsConcept_1.how_AV)
], QuestionsConcept.prototype, "_How_Intent", null);
QuestionsConcept = QuestionsConcept_1 = __decorate([
    Concept_1.concept()
], QuestionsConcept);
exports.default = QuestionsConcept;
//# sourceMappingURL=QuestionsConcept.js.map