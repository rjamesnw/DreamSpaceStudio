"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AttributeContext_1 = require("./AttributeContext");
/**
 * Represents a color state of a subject. Attributes are usually applied to subject contexts, but can also be applied to other attributes.
 * For example, a noun "John" could be next to another noun "Peter", with a verb "talking" as an attribute on one or both of them.  The verb talking, however, could also
 * be modified with another attribute, such as the adverb "loudly", which would be applied to the verb "talking".
 */
class ColorContext extends AttributeContext_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, color, parent = null) {
        super(concept, color, parent);
    }
}
exports.default = ColorContext;
//# sourceMappingURL=ColorContext.js.map