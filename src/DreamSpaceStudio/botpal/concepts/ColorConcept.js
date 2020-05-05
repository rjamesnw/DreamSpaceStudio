"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Concept_1 = require("../core/Concept");
const ColorContext_1 = require("../contexts/ColorContext");
/**
 * Adds rules to help determine colors.
 * @param Brain brain
 * @returns
 */
let ColorConcept = /** @class */ (() => {
    class ColorConcept extends Concept_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(brain) {
            super(brain);
        }
        // --------------------------------------------------------------------------------------------------------------------
        _AssignColor(context) {
            var currentContext = context.Context; // (get the current context)
            var subject = currentContext.Get();
            //x var subjectRootContext = currentContext.SubjectRootContext; // (get the root context with subjects)
            var color = context.CurrentDictionaryItem; // (get the color dictionary entry that resulted in this handler call)
            var colorContext = new ColorContext_1.default(this, color); // (add it to a new color context)
            context.Context.Add(colorContext); // (connect it to the root subject context)
            return Promise.resolve(context.SetConfidence(1));
        }
    }
    __decorate([
        Concept_1.conceptHandler("red,green,blue,purple,yellow,black,white,brown,cyan,sky blue,magenta,gold")
    ], ColorConcept.prototype, "_AssignColor", null);
    return ColorConcept;
})();
exports.default = ColorConcept;
//# sourceMappingURL=ColorConcept.js.map