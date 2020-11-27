"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PossessionTypes = void 0;
const Concept_1 = require("../core/Concept");
var PossessionTypes;
(function (PossessionTypes) {
    PossessionTypes[PossessionTypes["Unspecified"] = 0] = "Unspecified";
    /**
     *  The subject(s) HAS something.
    */
    PossessionTypes[PossessionTypes["ToHave"] = 1] = "ToHave";
    /**
     *  The subject(s) OWN something.
    */
    PossessionTypes[PossessionTypes["ToOwn"] = 2] = "ToOwn";
})(PossessionTypes = exports.PossessionTypes || (exports.PossessionTypes = {}));
/**
 *  Holds connection and relationship information between concepts.
*/
let PossessionsConcept = class PossessionsConcept extends Concept_1.default {
    constructor(brain) {
        super(brain);
    }
};
PossessionsConcept = __decorate([
    Concept_1.concept()
], PossessionsConcept);
exports.default = PossessionsConcept;
//# sourceMappingURL=PossessionsConcept.js.map