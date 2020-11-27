"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PositionalConcept_1;
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const DictionaryItem_1 = require("../core/DictionaryItem");
const POS_1 = require("../core/POS");
let PositionalConcept = PositionalConcept_1 = class PositionalConcept extends Concept_1.default {
    constructor(brain) {
        super(brain);
    }
    // --------------------------------------------------------------------------------------------------------------------
    _NameIsHere(context) {
        if (context.WasPrevious("is"))
            context.addIntentHandler(new DS.Delegate(this, this._NameIsHere_Intent), 0.9);
        return Promise.resolve(context);
    }
    async _NameIsHere_Intent(context) {
        await this.brain.doResponse("Ok.");
        return Promise.resolve(true);
    }
};
// --------------------------------------------------------------------------------------------------------------------
PositionalConcept.here = new DictionaryItem_1.default("here", POS_1.default.Pronoun_Subject);
__decorate([
    Concept_1.conceptHandler(PositionalConcept_1.here)
], PositionalConcept.prototype, "_NameIsHere", null);
PositionalConcept = PositionalConcept_1 = __decorate([
    Concept_1.concept()
], PositionalConcept);
exports.default = PositionalConcept;
//# sourceMappingURL=PositionalConcept.js.map