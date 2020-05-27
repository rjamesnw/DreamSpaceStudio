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
const DictionaryItem_1 = require("../core/DictionaryItem");
/**
 *  A concept to understand and handle pronouns.
*/
let ConjunctionConcept = /** @class */ (() => {
    var ConjunctionConcept_1;
    let ConjunctionConcept = ConjunctionConcept_1 = class ConjunctionConcept extends Concept_1.default {
        constructor(brain) {
            super(brain);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _conjunction(context) {
            return Promise.resolve(context);
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    ConjunctionConcept.and = new DictionaryItem_1.default("and", POS_1.default.Conjunction);
    ConjunctionConcept.that = new DictionaryItem_1.default("that", POS_1.default.Conjunction);
    __decorate([
        Concept_1.conceptHandler(ConjunctionConcept_1.and, ConjunctionConcept_1.that) // (ex: "she said that she was satisfied" [statement or hypothesis] / "oh that he could be restored to health" [wish or regret])
    ], ConjunctionConcept.prototype, "_conjunction", null);
    ConjunctionConcept = ConjunctionConcept_1 = __decorate([
        Concept_1.concept()
    ], ConjunctionConcept);
    return ConjunctionConcept;
})();
exports.default = ConjunctionConcept;
//# sourceMappingURL=Conjunctions.js.map