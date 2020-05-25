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
let NamesConcept = /** @class */ (() => {
    let NamesConcept = class NamesConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brian) {
            super(brian);
            this.Deb = this.memory.dictionary.addTextPart("deb", POS_1.default.Noun_Person);
            this.Debra = this.memory.dictionary.addTextPart("debra", POS_1.default.Noun_Person);
            this.Debohrra = this.memory.dictionary.addTextPart("debohrra", POS_1.default.Noun_Person);
            this.James = this.memory.dictionary.addTextPart("james", POS_1.default.Noun_Person);
        }
        // --------------------------------------------------------------------------------------------------------------------
        // TODO: *** Figure out how the left side will associate with the right.  Perhaps we expect to "iterate" over all the subjects, which should only be on in this case. *** 
        _Names(context) {
            if (context.WasPrevious(null)) {
                context.currentMatch.item.Concept.CurrentName = context.currentMatch.item.DictionaryItem;
                context.addIntentHandler(new DS.Delegate(this, this._Name_Intent), context.Operation.MinConfidence);
            }
            return Promise.resolve(context);
        }
        async _Name_Intent(context) {
            await this.brain.doResponse("Yes, please continue.");
            return true;
        }
    };
    __decorate([
        Concept_1.conceptHandler("deb,debra,debohrra,james")
    ], NamesConcept.prototype, "_Names", null);
    NamesConcept = __decorate([
        Concept_1.concept(true)
    ], NamesConcept);
    return NamesConcept;
})();
exports.default = NamesConcept;
//# sourceMappingURL=NamesConcept.js.map