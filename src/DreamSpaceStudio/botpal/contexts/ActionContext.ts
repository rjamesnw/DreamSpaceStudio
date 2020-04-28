import Context from "../core/Context";
import DictionaryItem from "../core/DictionaryItem";
import Concept from "../core/Concept";

export default class ActionContext extends Context {
    // --------------------------------------------------------------------------------------------------------------------

    /**
     * The name of this action, which is usually taken from verbs.
     */
    Name: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, actionName: DictionaryItem, parent: Context = null) {
        super(concept.memory, concept, parent)
        this.Name = actionName;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
