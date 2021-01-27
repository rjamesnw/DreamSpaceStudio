import DictionaryItem from "../core/DictionaryItem";
import Context from "../core/Context";
import Concept from "../core/Concept";

export default class ModifierContext extends Context {
    // --------------------------------------------------------------------------------------------------------------------

    /**
     * The name of this modifier, which is usually taken from adverbs.
     * @param Memory memory
     * @param Concept concept
     * @param DictionaryItem attributeName
     * @param Context parent = null
     */
    name: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Constructs a new modifier instance.
     * @param {Concept} concept The concept that created this context.
     * @param {DictionaryItem} name The name for the modifier.  This is usually an attribute name, such as "fast" that modifies a verb (such as "running").
     * @param {Context = null} parent An optional parent context, of applicable.
     */
    constructor(concept: Concept, name: DictionaryItem, parent: Context = null) {
        super(concept, parent)
        this.name = name;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
