"use strict";
// ========================================================================================================================
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const FrequencyContext_1 = require("../contexts/FrequencyContext");
let DeterminerConcept = /** @class */ (() => {
    class DeterminerConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brain) {
            super(brain);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _A(context) {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext_1.default(this, currentContext);
            timeContext.relationshipType = FrequencyContext_1.RelationshipTypes.One;
            currentContext.Add(timeContext);
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _The(context) {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext_1.default(this, currentContext);
            timeContext.relationshipType = FrequencyContext_1.RelationshipTypes.One;
            currentContext.Add(timeContext);
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _My(context) {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext_1.default(this, currentContext);
            timeContext.relationshipType = FrequencyContext_1.RelationshipTypes.One;
            currentContext.Add(timeContext);
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Them_Any(context) {
            return Promise.resolve(context);
        }
        _Them_That_Specific_Subject(context) {
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Those(context) {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext_1.default(this, currentContext);
            timeContext.relationshipType = FrequencyContext_1.RelationshipTypes.Many;
            currentContext.Add(timeContext);
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _These(context) {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext_1.default(this, currentContext);
            timeContext.relationshipType = FrequencyContext_1.RelationshipTypes.Many;
            currentContext.Add(timeContext);
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Every(context) {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext_1.default(this, currentContext);
            timeContext.relationshipType = FrequencyContext_1.RelationshipTypes.Many;
            currentContext.Add(timeContext);
            return Promise.resolve(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _All(context) {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext_1.default(this, currentContext);
            timeContext.relationshipType = FrequencyContext_1.RelationshipTypes.Many;
            currentContext.Add(timeContext);
            return Promise.resolve(context);
        }
    }
    __decorate([
        Concept_1.conceptHandler("A^DI", " * A^DI *") // (indefinite determiner, any such thing)
    ], DeterminerConcept.prototype, "_A", null);
    __decorate([
        Concept_1.conceptHandler("The", "* The^D *") // (definite determiner, a specific/known thing)
    ], DeterminerConcept.prototype, "_The", null);
    __decorate([
        Concept_1.conceptHandler("My^D", "* My^D *")
    ], DeterminerConcept.prototype, "_My", null);
    __decorate([
        Concept_1.conceptHandler("them^DI", " * them^DI *") // (ex: "Them that do", anyone)
    ], DeterminerConcept.prototype, "_Them_Any", null);
    __decorate([
        Concept_1.conceptHandler("them^D,that^D", "* them^D|that^D *") // (ex: "look at them eyes" / "Look at that man there")
    ], DeterminerConcept.prototype, "_Them_That_Specific_Subject", null);
    __decorate([
        Concept_1.conceptHandler("those^D", " * those^D *")
    ], DeterminerConcept.prototype, "_Those", null);
    __decorate([
        Concept_1.conceptHandler("these^D", " * these^D *")
    ], DeterminerConcept.prototype, "_These", null);
    __decorate([
        Concept_1.conceptHandler("every^DI", " * every^DI *")
    ], DeterminerConcept.prototype, "_Every", null);
    __decorate([
        Concept_1.conceptHandler("all^DI", " * all^DI *")
    ], DeterminerConcept.prototype, "_All", null);
    return DeterminerConcept;
})();
exports.default = DeterminerConcept;
// ========================================================================================================================
//# sourceMappingURL=DeterminerConcept.js.map