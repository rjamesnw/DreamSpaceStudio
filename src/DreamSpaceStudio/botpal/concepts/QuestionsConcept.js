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
const POS_1 = require("../core/POS");
const SubjectContext_1 = require("../contexts/SubjectContext");
let QuestionsConcept = /** @class */ (() => {
    let QuestionsConcept = class QuestionsConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brian) {
            super(brian);
            this.Who = this.memory.dictionary.addTextPart("who", POS_1.default.Pronoun_Subject);
            this.What = this.memory.dictionary.addTextPart("what", POS_1.default.Pronoun_Subject);
            this.When = this.memory.dictionary.addTextPart("when", POS_1.default.Adverb);
            this.Where = this.memory.dictionary.addTextPart("where", POS_1.default.Adverb);
            this.Why = this.memory.dictionary.addTextPart("why", POS_1.default.Adverb);
            this.How = this.memory.dictionary.addTextPart("how", POS_1.default.Adverb);
            this.Are = this.memory.dictionary.addTextPart("are", POS_1.default.Verb_Is);
            this.Is = this.memory.dictionary.addTextPart("is", POS_1.default.Verb_Is);
            this.If = this.memory.dictionary.addTextPart("if", POS_1.default.Conjunction);
            this.Can = this.memory.dictionary.addTextPart("can", POS_1.default.Verb_AbleToOrPermitted);
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
                context.Context.Add(new QuestionContext_1.default(this, this.What));
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
    __decorate([
        Concept_1.conceptHandler("Who^PN")
    ], QuestionsConcept.prototype, "_Who", null);
    __decorate([
        Concept_1.conceptHandler("name^N^V^A", QuestionContext_1.default, SubjectContext_1.default, 'tobe|is') //"what^PN is^V ^PN name"
    ], QuestionsConcept.prototype, "_GetName", null);
    __decorate([
        Concept_1.conceptHandler("What!?")
    ], QuestionsConcept.prototype, "_What_Exclamation", null);
    __decorate([
        Concept_1.conceptHandler("What")
    ], QuestionsConcept.prototype, "_What_Unknown_Question", null);
    __decorate([
        Concept_1.conceptHandler("When")
    ], QuestionsConcept.prototype, "_When", null);
    __decorate([
        Concept_1.conceptHandler("Where")
    ], QuestionsConcept.prototype, "_Where", null);
    __decorate([
        Concept_1.conceptHandler("Why", "Why *")
    ], QuestionsConcept.prototype, "_Why", null);
    __decorate([
        Concept_1.conceptHandler("How")
    ], QuestionsConcept.prototype, "_How", null);
    __decorate([
        Concept_1.intentHandler("How")
    ], QuestionsConcept.prototype, "_How_Intent", null);
    __decorate([
        Concept_1.conceptHandler("Can", "Can *")
    ], QuestionsConcept.prototype, "_Can", null);
    __decorate([
        Concept_1.conceptHandler("Is", "Is *")
    ], QuestionsConcept.prototype, "_Is", null);
    __decorate([
        Concept_1.conceptHandler("Are", "Are *")
    ], QuestionsConcept.prototype, "_Are", null);
    __decorate([
        Concept_1.conceptHandler("If", "If *")
    ], QuestionsConcept.prototype, "_If", null);
    QuestionsConcept = __decorate([
        Concept_1.concept()
    ], QuestionsConcept);
    return QuestionsConcept;
})();
exports.default = QuestionsConcept;
//# sourceMappingURL=QuestionsConcept.js.map