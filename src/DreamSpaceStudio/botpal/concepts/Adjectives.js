"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
let AdjectiveConcept = /** @class */ (() => {
    class AdjectiveConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brian) {
            super(brian);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Adjective(context) {
            return Promise.resolve(context);
        }
    }
    __decorate([
        Concept_1.conceptHandler(null, "* ^AD ^N *") // (ex: "I would not go that far")
    ], AdjectiveConcept.prototype, "_Adjective", null);
    return AdjectiveConcept;
})();
exports.default = AdjectiveConcept;
//# sourceMappingURL=Adjectives.js.map