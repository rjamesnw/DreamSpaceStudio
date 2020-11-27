import Context from "../core/Context";
import DictionaryItem from "../core/DictionaryItem";
import { IUnderlyingContext } from "./GroupContext";
import Concept from "../core/Concept";

/**
 * A subject instance contains details on a tangible object or intangible idea.
 * For instance, a list of colors verses specific parts of a car.
 * Most conversations require one or more subject matters as focus of communication, along a verb; otherwise the
 * idea is fragmented (i.e. fragmented sentences).
 * Most conversations have a subject, and thus, the subject is the start of understanding the text inputs.  The parts
 * of a sentence will build upon the subject (which may be empty if unknown).
 * Subjects form a "picture" in a virtual graph.  Humans usually think in pictures, and this process also helps to translate between languages.
 */
export default class SubjectContext extends Context implements IUnderlyingContext<SubjectContext>
{
    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  The name of this attribute, which is usually taken from determiners, adjectives, or adverbs.
    */
    nameOrTitle: DictionaryItem;

    // IUnderlyingContext<SubjectContext> properties ...
    get contexts(): Iterable<SubjectContext> { return [this]; }
    get hasItems() { return true; }
    get first(): SubjectContext { return this; }
    get last(): SubjectContext { return this; }

    ///**
    //// * Returns this context or the nearest parent context that has subjects (the root context of one or more subjects).
    //// *  If no root contexts are found with subjects, the top most context in the hierarchy is returned.
    ///// <para>Note this does NOT return nodes of 'SubjectContext' type, but only contexts that have subjects as child nodes.
    ///// This allows focusing on a single or group of subjects in a context.</para>
    //*/
    //x public Context SubjectRootContext { get { return HasSubjects ? this : Parent == null ? this : Parent.SubjectRootContext; } }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, nameOrTitle: DictionaryItem, parent: Context = null) {
        super(concept, parent);
        this.nameOrTitle = nameOrTitle;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
