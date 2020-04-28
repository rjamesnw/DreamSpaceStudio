"use strict";
/// <summary>
/// Represents the state of a subject. Attributes are usually applied to various contexts, but can also be applied to other attributes.
/// For example, a noun "John" could be next to another noun "Peter", with a verb "talking" as an attribute on one or both of them.  The verb talking, however, could also
/// be modified with another attribute, such as the adverb "loudly", which would be applied to the verb "talking".
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
/// </summary>
class AttributeContext extends Context_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, name, parent = null) {
        super(concept.memory, concept, parent);
        this.name = name;
    }
}
exports.default = AttributeContext;
//# sourceMappingURL=AttributeContext.js.map