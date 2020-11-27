"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
/**
 * A subject instance contains details on a tangible object or intangible idea.
 * For instance, a list of colors verses specific parts of a car.
 * Most conversations require one or more subject matters as focus of communication, along a verb; otherwise the
 * idea is fragmented (i.e. fragmented sentences).
 * Most conversations have a subject, and thus, the subject is the start of understanding the text inputs.  The parts
 * of a sentence will build upon the subject (which may be empty if unknown).
 * Subjects form a "picture" in a virtual graph.  Humans usually think in pictures, and this process also helps to translate between languages.
 */
class SubjectContext extends Context_1.default {
    ///**
    //// * Returns this context or the nearest parent context that has subjects (the root context of one or more subjects).
    //// *  If no root contexts are found with subjects, the top most context in the hierarchy is returned.
    ///// <para>Note this does NOT return nodes of 'SubjectContext' type, but only contexts that have subjects as child nodes.
    ///// This allows focusing on a single or group of subjects in a context.</para>
    //*/
    //x public Context SubjectRootContext { get { return HasSubjects ? this : Parent == null ? this : Parent.SubjectRootContext; } }
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, nameOrTitle, parent = null) {
        super(concept, parent);
        this.nameOrTitle = nameOrTitle;
    }
    // IUnderlyingContext<SubjectContext> properties ...
    get contexts() { return [this]; }
    get hasItems() { return true; }
    get first() { return this; }
    get last() { return this; }
}
exports.default = SubjectContext;
//# sourceMappingURL=SubjectContext.js.map