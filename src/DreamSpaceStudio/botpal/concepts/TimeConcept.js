"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const DictionaryItem_1 = require("../core/DictionaryItem");
const POS_1 = require("../core/POS");
const SubjectContext_1 = require("../contexts/SubjectContext");
let TimeConcept = /** @class */ (() => {
    let TimeConcept = class TimeConcept extends Concept_1.default {
        constructor(brian) {
            super(brian);
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
        _What_Unknown_Question(context) {
            if (context.WasPrevious("what")) {
                context.Context.Add(new SubjectContext_1.default(this.memory, this, this.time));
                context.AddIntentHandler(this._Time_Intent, context.Operation.MinConfidence);
            }
            return Promise.resolve(context);
        }
        async _Time_Intent(context) {
            return Promise.resolve(true);
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // (https://foxtype.com/sentence-tree)
    TimeConcept.time = new DictionaryItem_1.default("time", POS_1.default.Noun_Temporal);
    __decorate([
        Concept_1.conceptHandler("time", "time")
    ], TimeConcept.prototype, "_What_Unknown_Question", null);
    TimeConcept = __decorate([
        Concept_1.concept()
    ], TimeConcept);
    return TimeConcept;
})();
exports.default = TimeConcept;
//# sourceMappingURL=TimeConcept.js.map