import Context, { context, ContextTag } from "../core/Context";
import DictionaryItem from "../core/DictionaryItem";
import Concept from "../core/Concept";
import QuestionsConcept from "../concepts/QuestionsConcept";
import ThoughtGraph from "../nlp/ThoughtGraph";

/**
 *  Holds details about a question.
 */
@context()
export default class TextRecognitionContext extends Context {
    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Returns the tag that will represent this concept context.
     * @returns A tag name string.
     */
    static readonly tag = new ContextTag("textRecognition", 1);

    /** The original user input text. */
    text: DictionaryItem;

    /** The root thought graph where the user's input text is pla*/
    thoughtGraphRoot: ThoughtGraph;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, text: DictionaryItem, parent: Context = null) {
        super(concept, parent)
        this.text = text;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
