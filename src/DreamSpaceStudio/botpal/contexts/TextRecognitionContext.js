"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
/**
 *  Holds details about a question.
 */
let TextRecognitionContext = class TextRecognitionContext extends Context_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, text, parent = null) {
        super(concept, parent);
        this.text = text;
    }
};
// --------------------------------------------------------------------------------------------------------------------
/**
 * Returns the tag that will represent this concept context.
 * @returns A tag name string.
 */
TextRecognitionContext.tag = new Context_1.ContextTag("textRecognition", 1);
TextRecognitionContext = __decorate([
    Context_1.context()
], TextRecognitionContext);
exports.default = TextRecognitionContext;
//# sourceMappingURL=TextRecognitionContext.js.map