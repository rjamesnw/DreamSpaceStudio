import Context, { context, ContextTag } from "../core/Context";
import DictionaryItem from "../core/DictionaryItem";
import Concept from "../core/Concept";
import QuestionsConcept from "../concepts/QuestionsConcept";

/**
 *  Holds details about a question.
 */
@context()
export default class QuestionContext extends Context {
    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Returns the tag that will represent this concept context.
     * @returns A tag name string.
     */
    static readonly tag = new ContextTag("question", 1);

    /** If the user's context is a question, this is the question type (who, what, when, where, why, etc.). */
    question: DictionaryItem;

    /** Returns true if 'Question' was set. */
    get IsQuestion() { return !!this.question; }

    get IsWhoQuestion() { return this.question?.equals(QuestionsConcept.who_PN) ?? false; }
    get IsWhatQuestion() { return this.question?.equals(QuestionsConcept.what) ?? false; }
    get IsWhenQuestion() { return this.question?.equals(QuestionsConcept.when_AV) ?? false; }
    get IsWhereQuestion() { return this.question?.equals(QuestionsConcept.where_AV) ?? false; }
    get IsWhyQuestion() { return this.question?.equals(QuestionsConcept.why_AV) ?? false; }
    get IsHowQuestion() { return this.question?.equals(QuestionsConcept.how_AV) ?? false; }
    get IsAreQuestion() { return this.question?.equals(QuestionsConcept.are_V) ?? false; }
    get IsCanQuestion() { return this.question?.equals(QuestionsConcept.can_V) ?? false; }
    get IsIfQuestion() { return this.question?.equals(QuestionsConcept.if_C) ?? false; }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, question: DictionaryItem, parent: Context = null) {
        super(concept, parent)
        this.question = question;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
