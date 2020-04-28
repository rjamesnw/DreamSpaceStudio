"use strict";
/// <summary>
/// Holds details about a question.
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
/// </summary>
class QuestionContext extends Context_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, question, parent = null) {
        super(concept.memory, concept, parent);
        this.question = question;
    }
    /** Returns true if 'Question' was set. */
    get IsQuestion() { return !!this.question; }
    get IsWhoQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("who")) !== null && _b !== void 0 ? _b : false; }
    get IsWhatQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("what")) !== null && _b !== void 0 ? _b : false; }
    get IsWhenQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("when")) !== null && _b !== void 0 ? _b : false; }
    get IsWhereQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("where")) !== null && _b !== void 0 ? _b : false; }
    get IsWhyQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("why")) !== null && _b !== void 0 ? _b : false; }
    get IsHowQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("how")) !== null && _b !== void 0 ? _b : false; }
    get IsAreQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("are")) !== null && _b !== void 0 ? _b : false; }
    get IsCanQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("can")) !== null && _b !== void 0 ? _b : false; }
    get IsIfQuestion() { var _a, _b; return (_b = (_a = this.question) === null || _a === void 0 ? void 0 : _a.equals("if")) !== null && _b !== void 0 ? _b : false; }
}
exports.default = QuestionContext;
//# sourceMappingURL=QuestionContext.js.map