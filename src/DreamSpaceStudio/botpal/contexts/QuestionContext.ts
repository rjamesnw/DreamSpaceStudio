/**
 *  Holds details about a question.

import Context from "../core/Context";
import DictionaryItem from "../core/DictionaryItem";
import Concept from "../core/Concept";

*/
export default class QuestionContext extends Context {
    // --------------------------------------------------------------------------------------------------------------------

    /** If the user's context is a question, this is the question type (who, what, when, where, why, etc.). */
    question: DictionaryItem;

    /** Returns true if 'Question' was set. */
    get IsQuestion() { return !!this.question; }

    get IsWhoQuestion() { return this.question?.equals("who") ?? false; }
    get IsWhatQuestion() { return this.question?.equals("what") ?? false; }
    get IsWhenQuestion() { return this.question?.equals("when") ?? false; }
    get IsWhereQuestion() { return this.question?.equals("where") ?? false; }
    get IsWhyQuestion() { return this.question?.equals("why") ?? false; }
    get IsHowQuestion() { return this.question?.equals("how") ?? false; }
    get IsAreQuestion() { return this.question?.equals("are") ?? false; }
    get IsCanQuestion() { return this.question?.equals("can") ?? false; }
    get IsIfQuestion() { return this.question?.equals("if") ?? false; }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, question: DictionaryItem, parent: Context = null) {
        super(concept.memory, concept, parent)
        this.question = question;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
