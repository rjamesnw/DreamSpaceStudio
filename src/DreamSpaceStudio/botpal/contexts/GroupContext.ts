import Context, { ContextCollection } from "../core/Context";
import Concept from "../core/Concept";

/**
 * Creates a type that defines the underlying context type. This is used as a common key between groups of types and a single type.
 */
/// <typeparam name="T"> Generic type parameter. </typeparam>
export interface IUnderlyingContext<T extends Context> extends Context {
    contexts: Iterable<T>;

    /**
     *  True if this context has any items.
    */
    hasItems: boolean;

    /** Returns the first context in the list. */
    /// <value> The first context. </value>
    first: T;

    /** Returns the last context in the list. The last context is the most recent context. */
    /// <value> The last (most recent) context. </value>
    last: T;
}

/** Manages a specific collection of the same contexts. */
export default class GroupContext<T extends Context> extends Context //x implements IUnderlyingContext<T>
{
    // --------------------------------------------------------------------------------------------------------------------

    /**
     *      As the conversation progresses, this set will increase with the subjects talked about. This set will hold all the
     *      entities which will be acting in the scenes of this context.
    */
    /// <value> The contexts. </value>
    contexts: ContextCollection<T>;

    /** Returns the first context in the list. */
    /// <value> The first context. </value>
    /// <seealso cref="P:BotPal.IUnderlyingContext{T}.First"/>
    get first() { return this.contexts[0]; }

    /** Returns the last context in the list. The last context is the most recent context. */
    /// <value> The last (most recent) context. </value>
    /// <seealso cref="P:BotPal.IUnderlyingContext{T}.Last"/>
    get last() { return this.contexts?.[this.contexts.length - 1]; }

    /**
     *  True if this context has subjects.
    */
    get hasItems() { return this.contexts.hasItems; }

    ///**
     * // Returns this context or the nearest parent context that has subjects (the root context of one or more subjects).
    // *  If no root contexts are found with subjects, the top most context in the hierarchy is returned.
    ///// <para>Note this does NOT return nodes of 'GroupContext' type, but only contexts that have subjects as child nodes.
    ///// This allows focusing on a single or group of subjects in a context.</para>
    //*/
    //x public Context SubjectRootContext { get { return HasItems ? this : Parent == null ? this : Parent.SubjectRootContext; } }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, contextType: IType<T>, parent: Context = null) {
        super(concept, parent)
        this.contexts = new ContextCollection<T>(contextType, this);
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Attempts to detect and remove the given context object from any of the context collections it should belong to.
    */
    remove(context: T): boolean {
        return this.contexts.remove(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
