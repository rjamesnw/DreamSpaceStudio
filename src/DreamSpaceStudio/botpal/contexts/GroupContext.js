"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
/** Manages a specific collection of contexts. */
class GroupContext extends Context_1.default //x implements IUnderlyingContext<T>
 {
    ///**
    // *  Returns this context or the nearest parent context that has subjects (the root context of one or more subjects).
    // *  If no root contexts are found with subjects, the top most context in the hierarchy is returned.
    ///// <para>Note this does NOT return nodes of 'GroupContext' type, but only contexts that have subjects as child nodes.
    ///// This allows focusing on a single or group of subjects in a context.</para>
    //*/
    //x public Context SubjectRootContext { get { return HasItems ? this : Parent == null ? this : Parent.SubjectRootContext; } }
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, contextType, parent = null) {
        super(concept, parent);
        this.contexts = new Context_1.ContextCollection(contextType, this);
    }
    /** Returns the first context in the list. */
    /// <value> The first context. </value>
    /// <seealso cref="P:BotPal.IUnderlyingContext{T}.First"/>
    get first() { return this.contexts[0]; }
    /** Returns the last context in the list. The last context is the most recent context. */
    /// <value> The last (most recent) context. </value>
    /// <seealso cref="P:BotPal.IUnderlyingContext{T}.Last"/>
    get last() { var _a; return (_a = this.contexts) === null || _a === void 0 ? void 0 : _a[this.contexts.length - 1]; }
    /**
     *  True if this context has subjects.
    */
    get hasItems() { return this.contexts.hasItems; }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Attempts to detect and remove the given context object from any of the context collections it should belong to.
    */
    remove(context) {
        return this.contexts.remove(context);
    }
}
exports.default = GroupContext;
//# sourceMappingURL=GroupContext.js.map