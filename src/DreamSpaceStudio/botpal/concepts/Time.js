"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const Brain_1 = require("../core/Brain");
let TimeConcept = /** @class */ (() => {
    let TimeConcept = class TimeConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brian) {
            super(brian);
            // (https://foxtype.com/sentence-tree)
            this.time = this.memory.Dictionary.AddTextPart("time", this.POS.Noun_Temporal);
        }
    };
    TimeConcept = __decorate([
        Concept_1.concept()
    ], TimeConcept);
    return TimeConcept;
})();
exports.default = TimeConcept;
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
await Brain_1.default.DoResponse("I don't know what time.");
Promise < ConceptHandlerContext > _IsTimeTo(context, ConceptHandlerContext);
//{
//    return Promise.resolve(context);
//}
_What_Unknown_Question(context, ConceptHandlerContext);
Promise < ConceptHandlerContext > {
    if(context) { }, : .WasPrevious("what")
};
{
    context.Context.Add(new SubjectContext(Memory, this, Time));
    context.AddIntentHandler(_Time_Intent, context.Operation.MinConfidence);
}
return Promise.resolve(context);
async;
_Time_Intent(context, ConceptHandlerContext);
Promise();
return true;
//# sourceMappingURL=Time.js.map