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
let QuestionContext = /** @class */ (() => {
    let QuestionContext = class QuestionContext extends Context_1.default {
        // --------------------------------------------------------------------------------------------------------------------
        constructor(concept, question, parent = null) {
            super(concept, parent);
            this.question = question;
        }
        // --------------------------------------------------------------------------------------------------------------------
        static get tag() { return "question"; }
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
    };
    QuestionContext = __decorate([
        Context_1.context()
    ], QuestionContext);
    return QuestionContext;
})();
exports.default = QuestionContext;
//# sourceMappingURL=QuestionContext.js.map