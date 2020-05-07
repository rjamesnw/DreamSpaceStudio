"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const QuestionContext_1 = require("../contexts/QuestionContext");
const DictionaryItem_1 = require("../core/DictionaryItem");
const POS_1 = require("../core/POS");
const SubjectContext_1 = require("../contexts/SubjectContext");
let QuestionsConcept = /** @class */ (() => {
    var QuestionsConcept_1;
    let QuestionsConcept = QuestionsConcept_1 = class QuestionsConcept extends Concept_1.default {
        constructor(brian) {
            super(brian);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Who(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.Who));
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _GetName(context) {
            return Promise.resolve(context);
        }
        _What_Exclamation(context) {
            context.AddIntentHandler(new DS.Delegate(this, this._What_Excl_Intent), 1);
            return Promise.resolve(context);
        }
        async _What_Excl_Intent(context) {
            await this.brain.doResponse("Why so surprised?");
            return true;
        }
        _What_Unknown_Question(context) {
            if (context.WasPrevious(null)) {
                context.Context.Add(new QuestionContext_1.default(this, this.What_PN));
                context.AddIntentHandler(new DS.Delegate(this, this._What_Intent), context.Operation.MinConfidence); // (this is like a fall-back plan if nothing else better is found)
            }
            return Promise.resolve(context);
        }
        async _What_Intent(context) {
            await this.brain.doResponse("What about what?");
            return true;
        }
        // --------------------------------------------------------------------------------------------------------------------
        _When(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.When));
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Where(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.Where));
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Why(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.Why));
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _How(context) {
            if (context.WasPrevious(null)) {
                context.Context.Add(new QuestionContext_1.default(this, this.How));
                context.AddIntentHandler(new DS.Delegate(this, this._How_Intent), context.Operation.MinConfidence);
            }
            return Promise.resolve(context);
        }
        async _How_Intent(context) {
            if (context.WasPrevious(null))
                await this.brain.doResponse("How what?");
            return true;
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Can(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.Can));
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Is(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.Is));
            return Promise.resolve(context);
        }
        _Are(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.Are));
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _If(context) {
            if (context.WasPrevious(null))
                context.Context.Add(new QuestionContext_1.default(this, this.If));
            return Promise.resolve(context);
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    QuestionsConcept.Who = new DictionaryItem_1.default("Who", POS_1.default.Pronoun_Subject);
    QuestionsConcept.What = new DictionaryItem_1.default("What");
    QuestionsConcept.What_PN = new DictionaryItem_1.default("What", POS_1.default.Pronoun_Subject);
    QuestionsConcept.What_D = new DictionaryItem_1.default("What", POS_1.default.Determiner);
    QuestionsConcept.What_AV = new DictionaryItem_1.default("What", POS_1.default.Adverb);
    QuestionsConcept.When = new DictionaryItem_1.default("When", POS_1.default.Adverb);
    QuestionsConcept.Where = new DictionaryItem_1.default("Where", POS_1.default.Adverb);
    QuestionsConcept.Why = new DictionaryItem_1.default("Why", POS_1.default.Adverb);
    QuestionsConcept.How = new DictionaryItem_1.default("How", POS_1.default.Adverb);
    QuestionsConcept.Are = new DictionaryItem_1.default("Are", POS_1.default.Verb_Is);
    QuestionsConcept.Is = new DictionaryItem_1.default("Is", POS_1.default.Verb_Is);
    QuestionsConcept.If = new DictionaryItem_1.default("If", POS_1.default.Conjunction);
    QuestionsConcept.Can = new DictionaryItem_1.default("Can", POS_1.default.Verb_AbleToOrPermitted);
    QuestionsConcept.Name_Noun = new DictionaryItem_1.default("name", POS_1.default.Noun);
    QuestionsConcept.Name_Verb = new DictionaryItem_1.default("name", POS_1.default.Verb);
    QuestionsConcept.Name_Adjective = new DictionaryItem_1.default("name", POS_1.default.Adjective);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.Who)
    ], QuestionsConcept.prototype, "_Who", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.Name_Noun, QuestionsConcept_1.Name_Verb, QuestionsConcept_1.Name_Adjective, QuestionContext_1.default, SubjectContext_1.default, 'tobe|is') //"what^PN is^V ^PN name"
    ], QuestionsConcept.prototype, "_GetName", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.What_PN, QuestionsConcept_1.What_D, QuestionsConcept_1.What_AV, "!")
    ], QuestionsConcept.prototype, "_What_Exclamation", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.What)
    ], QuestionsConcept.prototype, "_What_Unknown_Question", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.When)
    ], QuestionsConcept.prototype, "_When", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.Where)
    ], QuestionsConcept.prototype, "_Where", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.Why)
    ], QuestionsConcept.prototype, "_Why", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.How)
    ], QuestionsConcept.prototype, "_How", null);
    __decorate([
        Concept_1.intentHandler(QuestionsConcept_1.How)
    ], QuestionsConcept.prototype, "_How_Intent", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.Can)
    ], QuestionsConcept.prototype, "_Can", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.Is)
    ], QuestionsConcept.prototype, "_Is", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.Are)
    ], QuestionsConcept.prototype, "_Are", null);
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.If)
    ], QuestionsConcept.prototype, "_If", null);
    QuestionsConcept = QuestionsConcept_1 = __decorate([
        Concept_1.concept()
    ], QuestionsConcept);
    return QuestionsConcept;
})();
exports.default = QuestionsConcept;
//# sourceMappingURL=QuestionsConcept.js.map