"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const POS_1 = require("../core/POS");
let SpeakingConcept = class SpeakingConcept extends Concept_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(brain) {
        super(brain);
        this.Say = this.memory.dictionary.addTextPart("say", POS_1.default.Noun_Person);
    }
    // --------------------------------------------------------------------------------------------------------------------
    // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
    _Names(context) {
        if (context.WasPrevious(null))
            context.addIntentHandler(new DS.Delegate(this, this._Say_Intent), context.operation.MinConfidence);
        return Promise.resolve(context);
    }
    async _Say_Intent(context) {
        await this.brain.doResponse("Say what.");
        return true;
    }
};
__decorate([
    Concept_1.conceptHandler("say")
], SpeakingConcept.prototype, "_Names", null);
SpeakingConcept = __decorate([
    Concept_1.concept()
], SpeakingConcept);
exports.default = SpeakingConcept;
//# sourceMappingURL=SpeakingConcept.js.map