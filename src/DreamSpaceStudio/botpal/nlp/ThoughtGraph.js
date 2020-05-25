"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __current;
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
const ThoughtGraphNode_1 = require("./ThoughtGraphNode");
/**
 * A thought graph breaks down multiple sentences into multiple graphs, each containing an isolated thought from the
 *  user (though they may be related).
 *
 *  Each thought graph acts like a logical container to isolate the main subjects, and related details, from other
 *  thoughts. The parent of a thought graph is usually the sentence outside a thought placed in brackets. Nesting occurs when nested
 *  brackets (parenthesis, square, curly, angled, or similar) are discovered. Doing this keeps sub-thoughts away from
 *  the main thought.
 *
 *  @see MultiNode<ThoughtGraph>
*/
class ThoughtGraph extends Node_1.default {
    constructor() {
        super(...arguments);
        //x private set _current(value: ThoughtGraphNode): { this.#_current = value; }
        __current.set(this, ThoughtGraphNode_1.default.CreateSubjectGroup());
    }
    /**
     * The current node in the build process. A blank subject group node is added by default for every thought graph, since
     * any meaningful thought usually has a subject which the attributes, descriptions, and actions relate to. A subject
     * group can contain nouns and pronouns, including descriptions applied to the group, and association branches.
     */
    get current() { return __classPrivateFieldGet(this, __current); }
    /**
     * Adds words (or symbols) to the thought graph. These are added like a human would read text - one by one, like a
     * stream of text parts.
     * @param words A variable-length parameters list containing words.
    */
    add(...words) {
        for (var i = 0, n = words.length; i < n; ++i) {
            var word = words[i];
            __classPrivateFieldSet(this, __current, this.current.Add(word));
            // (current always updates to the best context - typically the subject [noun], or the next best thing)
            // TODO: (when "and" is encountered, then either 1. the adjective or noun is grouped, or 2. in the presence of existing actions, a new thought graph is created and linked)
        }
        return this;
    }
}
exports.default = ThoughtGraph;
__current = new WeakMap();
//# sourceMappingURL=ThoughtGraph.js.map