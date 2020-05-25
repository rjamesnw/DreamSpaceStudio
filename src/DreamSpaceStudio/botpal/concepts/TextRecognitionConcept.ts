import Concept from "../core/Concept";
import DictionaryItem from "../core/DictionaryItem";
import Brain from "../core/Brain";
import ThoughtGraph from "../nlp/ThoughtGraph";

/**
 *  Ads a concept that recognizes user input text against the current dictionary.
 *  When a user inputs text, it needs to be broken down into phrases and words.  This concept starts with all words and symbols
 *  as a single phrase. A special "group key" is made from the text for rapid lookups. This allows fast recognition of any
 *  existing phrases. A loop breaks own words and symbols by removing the right most entry until either a phrase, or single
 *  word or symbol remains. Each phrase, word, or symbol is added to the NLP via a ThoughtGrap root instance.
*/
export default class TextRecognitionConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    thoughtGraphRoot: ThoughtGraph;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain);
        brain.textInputHandlers.push(new DS.Delegate(this, this.onTextInput));
    }

    /** Executes once the after all core system concepts have been registered. */
    protected onAfterAllRegistered() { }

    onTextInput(text: string) {

    }

    // --------------------------------------------------------------------------------------------------------------------
}
