"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
const QuestionsConcept_1 = require("../concepts/QuestionsConcept");
/**
 *  Holds details about a question.
 */
let QuestionContext = class QuestionContext extends Context_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, question, parent = null) {
        super(concept, parent);
        this.question = question;
    }
    /** Returns true if 'Question' was set. */
    get IsQuestion() { return !!this.question; }
    get IsWhoQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.who_PN)) !== null && _b !== void 0 ? _b : false; }
    get IsWhatQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.what)) !== null && _b !== void 0 ? _b : false; }
    get IsWhenQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.when_AV)) !== null && _b !== void 0 ? _b : false; }
    get IsWhereQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.where_AV)) !== null && _b !== void 0 ? _b : false; }
    get IsWhyQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.why_AV)) !== null && _b !== void 0 ? _b : false; }
    get IsHowQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.how_AV)) !== null && _b !== void 0 ? _b : false; }
    get IsAreQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.are_V)) !== null && _b !== void 0 ? _b : false; }
    get IsCanQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.can_V)) !== null && _b !== void 0 ? _b : false; }
    get IsIfQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals(QuestionsConcept_1.default.if_C)) !== null && _b !== void 0 ? _b : false; }
};
// --------------------------------------------------------------------------------------------------------------------
/**
 * Returns the tag that will represent this concept context.
 * @returns A tag name string.
 */
QuestionContext.tag = new Context_1.ContextTag("question", 1);
QuestionContext = __decorate([
    Context_1.context()
], QuestionContext);
exports.default = QuestionContext;
//# sourceMappingURL=QuestionContext.js.map