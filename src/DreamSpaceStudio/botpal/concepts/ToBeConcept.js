"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
/** Covers "is"/"are" concepts for when applying attributes and relationships between subjects. */
let ToBeConcept = /** @class */ (() => {
    let ToBeConcept = class ToBeConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brain) {
            super(brain);
        }
        // --------------------------------------------------------------------------------------------------------------------
        // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
        _Is(context) {
            if (context.WasPrevious("how"))
                context.addIntentHandler(this._How_Is_Intent, context.Operation.MinConfidence);
            else if (context.WasPrevious("time"))
                context.addIntentHandler(this._How_Is_Intent, context.Operation.MinConfidence);
            else
                context.addIntentHandler(this._Is_What_Intent, context.Operation.MinConfidence);
            //{
            //    var ctx = context.Context;
            //    if (ctx.AllSubjects().Any())
            //    {
            //        if (ctx.HasActions)
            //        {
            //            // ... assign actions (could be more than one) ...
            //        }
            //        else if (ctx.HasAttributes)
            //        {
            //            // ... assign attributes ...
            //        }
            //    }
            //    else
            //    {
            //        var subjects = ctx.AllSubjects(); // (try right side for 
            //    }
            //}
            return Promise.resolve(context);
        }
        async _How_Is_Intent(context) {
            await this.brain.doResponse("How is what?");
            return true;
        }
        async _Is_What_Intent(context) {
            await this.brain.doResponse("Is what?");
            return true;
        }
        // --------------------------------------------------------------------------------------------------------------------
        //@conceptHandler("How are")
        //ConceptHandlerContext _How_are(context: ConceptHandlerContext )
        //{
        //    if (context.WasPrevious(null))
        //        context.AddIntentHandler(_How_Intent, context.Operation.MinConfidence);
        //    return context;
        //}
        //[IntentHandler("How are [subject]")]
        //bool _How_are_Intent(context: ConceptHandlerContext )
        //{
        //    Brain.DoResponse("How are what?");
        //    return true;
        //}
        // --------------------------------------------------------------------------------------------------------------------
        // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, and assigned attributes from the right side. *** 
        async _Are(context) {
            if (context.WasPrevious("how"))
                context.addIntentHandler(this._How_Are_Intent, 0.5);
            return Promise.resolve(context);
        }
        async _How_Are_Intent(context) {
            await this.brain.doResponse("How are what?");
            return Promise.resolve(context);
        }
    };
    __decorate([
        Concept_1.conceptHandler("is")
    ], ToBeConcept.prototype, "_Is", null);
    __decorate([
        Concept_1.conceptHandler("are")
    ], ToBeConcept.prototype, "_Are", null);
    ToBeConcept = __decorate([
        Concept_1.concept()
    ], ToBeConcept);
    return ToBeConcept;
})();
exports.default = ToBeConcept;
//# sourceMappingURL=ToBeConcept.js.map