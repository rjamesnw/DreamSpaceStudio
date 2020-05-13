"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const QuestionsConcept_1 = require("./QuestionsConcept");
/**
 *  This concept coverts the idea of "when {some criteria} do {some action}" style statements.
 */
let LogicConcept = /** @class */ (() => {
    let LogicConcept = class LogicConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brian) {
            super(brian);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _FindWhen(context) {
            return Promise.resolve(context);
        }
    };
    __decorate([
        Concept_1.conceptHandler(QuestionsConcept_1.default.when_AV) //x "when^AV ^N/^PN ^V ^V/^T/^N/^PP ^V"
    ], LogicConcept.prototype, "_FindWhen", null);
    LogicConcept = __decorate([
        Concept_1.concept()
    ], LogicConcept);
    return LogicConcept;
})();
exports.default = LogicConcept;
//# sourceMappingURL=LogicConcept.js.map