"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const NamesConcept_1 = require("./NamesConcept");
/**
 *  Adds rules to help determine colors.
*/
let SalutationConcept = /** @class */ (() => {
    let SalutationConcept = class SalutationConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brain) {
            super(brain);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _Hi(context) {
            if (context.WasPrevious(null) && context.IsNext(null))
                context.addIntentHandler(new DS.Delegate(this, this._Hi_Intent), 1);
            else if (context.WasPrevious("say"))
                context.addIntentHandler(new DS.Delegate(this, this._SayHi_Intent), 1);
            return Promise.resolve(context.SetConfidence(1));
        }
        async _Hi_Intent(context) {
            await this.brain.doResponse("Hello.");
            return true;
        }
        async _SayHi_Intent(context) {
            var _a;
            var name = "";
            var c = this.brain.getConcept(NamesConcept_1.default);
            if (((_a = c === null || c === void 0 ? void 0 : c.CurrentName) === null || _a === void 0 ? void 0 : _a.textPart) != null)
                name = " " + c.CurrentName.textPart.text;
            await this.brain.doResponse("Hi" + name + ".");
            return true;
        }
        _Hello(context) {
            if (context.WasPrevious(null) && context.IsNext(null))
                context.addIntentHandler(new DS.Delegate(this, this._Hello_Intent), 1);
            return Promise.resolve(context.SetConfidence(1));
        }
        async _Hello_Intent(context) {
            await this.brain.doResponse("Hi there.");
            return true;
        }
    };
    __decorate([
        Concept_1.conceptHandler("Hi")
    ], SalutationConcept.prototype, "_Hi", null);
    __decorate([
        Concept_1.conceptHandler("Hello")
    ], SalutationConcept.prototype, "_Hello", null);
    SalutationConcept = __decorate([
        Concept_1.concept()
    ], SalutationConcept);
    return SalutationConcept;
})();
exports.default = SalutationConcept;
//# sourceMappingURL=SalutationConcept.js.map