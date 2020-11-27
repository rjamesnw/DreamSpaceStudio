import Concept from "../core/Concept";
import Context from "../core/Context";
import DictionaryItem from "../core/DictionaryItem";

/**
 *  Represents the state of a subject. Attributes are usually applied to various contexts, but can also be applied to other attributes.
 *  For example, a noun "John" could be next to another noun "Peter", with a verb "talking" as an attribute on one or both of them.  The verb talking, however, could also
 *  be modified with another attribute, such as the adverb "loudly", which would be applied to the verb "talking".

import DictionaryItem from "../core/DictionaryItem";
import Concept from "../core/Concept";
import Context from "../core/Context";

*/
export default class AttributeContext extends Context {
    // --------------------------------------------------------------------------------------------------------------------

    /**
     * The name of this attribute, which is usually taken from adjectives.
     */
    name: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, name: DictionaryItem, parent: Context = null) {
        super(concept, parent);
        this.name = name;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
