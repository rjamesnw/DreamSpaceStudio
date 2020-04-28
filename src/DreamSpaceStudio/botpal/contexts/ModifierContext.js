"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
class ModifierContext extends Context_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    /**
     * Constructs a new modifier instance.
     * @param {Concept} concept The concept that created this context.
     * @param {DictionaryItem} name The name for the modifier.  This is usually an attribute name, such as "fast" that modifies a verb (such as "running").
     * @param {Context = null} parent An optional parent context, of applicable.
     */
    constructor(concept, name, parent = null) {
        super(concept.memory, concept, parent);
        this.name = name;
    }
}
exports.default = ModifierContext;
//# sourceMappingURL=ModifierContext.js.map