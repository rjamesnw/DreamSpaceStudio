import TimeReferencedObject, { ITimeReferencedObject } from "./TimeReferencedObject";
import Memory, { IMemoryObject } from "./Memory";
import Concept from "./Concept";
import DictionaryItem from "./DictionaryItem";
import ActionContext from "../contexts/ActionContext";
import AttributeContext from "../contexts/AttributeContext";
import ModifierContext from "../contexts/ModifierContext";
import QuestionContext from "../contexts/QuestionContext";
import GroupContext from "../contexts/GroupContext";

export class ContextCollection<T extends Context> extends Array<T>
{
    /**
     *  The context that owns this collection.
    */
    readonly owner: Context;

    #_contextType: IType<T>;

    get hasItems(): boolean { return this.length > 0; }

    constructor(contextType: IType<T>, owner: Context);
    /**
     * Constructs a new collection from another by copying only types that match the new collection's type.
     * @param contextCollection Collection of contexts by base reference.
     */
    constructor(contextType: IType<T>, contextCollection: ContextCollection<Context>);
    constructor(contextType: IType<T>, obj: Context | ContextCollection<Context>) {
        super();
        if (!obj)
            throw DS.Exception.invalidArgument('ContextCollection()', 'owner or contextCollection', obj);
        this.#_contextType = contextType;
        if (obj instanceof Context)
            this.owner = obj;
        else
            for (var ctx of obj)
                if (ctx instanceof contextType)
                    this.add(ctx);
    }

    /**
     *  Searches the for a context of the requested type, or null if nothing was found.
    */
    getContexts<TContext extends Context>(type: IType<TContext>): TContext[] {
        return <TContext[]><any>this.filter(a => a.contextType == type);
    }

    add(context: T) {
        if (context?.parent?.remove)
            context.remove(context.parent);
        if (context) {
            (<Writeable<Context>>context).parent = this.owner;
            this.push(context);
        }
    }

    remove(context: T): boolean {
        if (super.remove(context)) {
            if (context instanceof Context)
                (<Writeable<Context>>context).parent = null;
            return true;
        }
        else return false;
    }

    /**
     * Removes one or more contexts.
     * @param contexts
     */
    RemoveContexts(...contexts: T[]): void;

    /**
     * Removes one or more contexts of the given type.
     * @param {TContext[]} ...contextTypes
     * @returns
     */
    RemoveContexts<TContext extends IType<T>>(...contextTypes: TContext[]): boolean | void;

    RemoveContexts(...items: (T | IType<T>)[]): boolean | void {
        for (var item of items)
            if (item instanceof Context)
                this.remove(<any>item);
            else
                this.RemoveContexts(...this.getContexts(item));
    }
}

///** This just serves as a method to register contexts that are alike (using a shared type name). */
///// <typeparam name="T"> A context type. </typeparam>
//x export interface IContext implements ITimeReferencedObject {
//    Parent: Context;
//    contextType: IType<Context>;
//}


/**
 *  The context around a given concept.
 *  When concepts are triggered, contexts are built up in order to establish the content and intent of the user's input.
*/
export default class Context extends TimeReferencedObject implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Keeps a reference of the parent context connections that relates to this context, if any. This allows nesting contexts under other contexts using relationships.
     *  A parent context can have many child contexts, which is a context tree that represents a potential engram of data content to store later.
    */
    readonly parent: Context;

    /**
     *  The type if this context.
    */
    readonly contextType: IType<Context>;

    /**
     *  The concept responsible for creating this context, if any.
    */
    readonly concept: Concept;

    get memory() { return this.concept.memory; }

    // --------------------------------------------------------------------------------------------------------------------

    /** A mapping of Context types to a collection of context instances of the same type. */
    #_contextMap: Map<IType<Context>, ContextCollection<Context>> = new Map<IType<Context>, ContextCollection<Context>>();

    #_contexts: Context[];

    /**
     * Returns a copy of the internal contexts in order of addition.  The first item is the first context added to this current
     * context, and the last item is the most recent context that was added.
     */
    getContexts() { return this.#_contexts.slice(0); }

    // --------------------------------------------------------------------------------------------------------------------

    ///**
     * // Get the current instance or a parent instance that is a subject context (<see cref="SubjectContext"/> instance).
    //*/
    //x public bool IsSubjectContext => this is SubjectContext;

    ///** Returns true if this object is question context (<see cref="QuestionContext"/> instance). */
    ///// <value> A true or false value. </value>
    //x public bool IsQuestionContext => this is QuestionContext;

    /** 
     *  The action (verbs) of a statement in regards to the subjects. For example, "is" or "are" is a claim one or more
     *  things is like something else (i.e. John is nice), or as part of a question (who are they? what time is it?). 
     *  Other examples may be "John *drove* away" or "Pat *ran* to the store.".
    */
    get Actions(): Iterable<ActionContext> { return this.get(ActionContext); }

    /**
     *  True if this context has actions (typically because of verbs).
    */
    get HasActions(): boolean { return this.get(ActionContext)?.hasItems ?? false; }

    /**
     *  Associates descriptive attributes for this context.
     *  These contexts typically determine how something is like another.
    */
    get Attributes() { return this.#_Attributes; };
    #_Attributes: Iterable<AttributeContext>;

    /**
     *  True if this context has attributes (typically because of adjectives).
    */
    get HasAttributes(): boolean { return this.get(AttributeContext)?.hasItems ?? false; }

    /**
     *  Associates contexts that modify this context (such as frequency, time constraints, speed, etc.).
     *  The most common is the frequency context, which use used with the determiner concept (i.e. "the" or "a", etc.).
    */
    get Modifiers() { return this.#_Modifiers; }
    #_Modifiers: Iterable<ModifierContext>;

    /**
     *  True if this context has modifiers (typically because of adverbs).
    */
    get HasModifiers(): boolean { return this.get(ModifierContext)?.hasItems ?? false; }

    /**
     *  Associates contexts that modify this context (such as frequency, time constraints, speed, etc.).
     *  The most common is the frequency context, which use used with the determiner concept (i.e. "the" or "a", etc.).
    */
    get Questions() { return this.#_Questions; }
    #_Questions: Iterable<ModifierContext>;

    /**
     *  True if this context has modifiers (typically because of adverbs).
    */
    get HasQuestions(): boolean { return this.get(QuestionContext)?.hasItems ?? false; }

    /** Determines if there is a question context associated with the given question word. */
    /// <param name="question"> The question word to check for. </param>
    /// <returns> True if the question is in the context, and false if not. </returns>
    HasQuestion(question: DictionaryItem): boolean {
        var questions = this.get(QuestionContext);
        if (questions != null)
            for (var q of questions)
                if (q.question?.equals(question))
                    return true;
        return false;
    }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(concept: Concept, parent: Context = null) {
        super();
        if (!concept) throw DS.Exception.argumentRequired('Context()', 'concept', this);
        this.concept = concept;
        this.contextType = <any>this.constructor;
        //? Concept = concept ?? throw new ArgumentNullException(nameof(concept));
        this.parent = parent;
    }

    // --------------------------------------------------------------------------------------------------------------------

    add(ctx: Context): this {
        if (ctx != null) {
            var type = ctx.contextType;
            if (!this.#_contextMap.has(type))
                this.#_contextMap.set(type, new ContextCollection<Context>(type, this));
            this.#_contextMap.get(type).add(ctx);
            if (this.#_contexts == null)
                this.#_contexts = [];
            this.#_contexts.push(ctx);
        }
        return this;
    }

    /** Enumerates the contexts of a given type and returns them in a new collection object. */
    /// <param name="contextType"> The context type to find. </param>
    /// <returns> An enumerator that allows enumerating over the matched items. </returns>
    get<T extends Context>(contextType: IType<T>): ContextCollection<T> {
        var existingCollection = this.#_contextMap.get(contextType);
        return existingCollection ? new ContextCollection<T>(contextType, existingCollection) : null;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Enumerates this collection for all contexts of type <typeparamref name="T"/>. */
    /// <typeparam name="T"> The context types to include in the enumeration. </typeparam>
    /// <param name="includeGroups"> (Optional) True to include grouped contexts in the search. </param>
    /// <returns> An enumeration of all contexts found matching type <typeparamref name="T"/>. </returns>
    *Flatten<T extends Context>(type: IType<T>, includeGroups = true): Iterable<T> {
        var subjects = this.get(type);
        yield* subjects;

        var subjectGroups = this.get<GroupContext<T>>(GroupContext);
        for (var sg of subjectGroups)
            yield* sg.contexts;

        //if (Parent != null)
        //    foreach (var s in Parent.FlattenSubjects())
        //        yield return s;
    }

    // --------------------------------------------------------------------------------------------------------------------

    ///**
     * // Get the current instance or a parent instance that is a context of the requested type, or null if nothing was found.
    //*/
    //public T GetContext<T>() where T : Context
    //{
    //    return (this is T) ? (T)this : Parent?.GetContext<T>();
    //}

    ///**
     * // Ignores the current instance and looks for a parent instance that is a context of the requested type, or null if nothing was found.
    //*/
    //public T GetParentContext<T>() where T : Context
    //{
    //    return Parent?.GetContext<T>();
    //}

    // --------------------------------------------------------------------------------------------------------------------

    ///**
     * // Create a split point from this scene to process separately, but in relation to this one.
    //*/
    //? public virtual Context Fork()
    //{
    //    var s = new Context(Memory, this);

    //    // Forked contexts are blank, but allow associating sub-contexts with a related parent context.
    //    // Example: The dog [the one I saw yesterday] was black)
    //    // In the above case, "the one" refers to the parent context subject "the dog". As such, contexts can back reference subjects in parent scopes.

    //    return s;
    //}

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Attempts to detect and remove the given context object from any of the context collections it should belong to.
    */
    remove(context: Context): boolean {
        if (context == null) return false;

        var removed = false;

        for (var item of this.#_contextMap)
            if (item[1].remove(context))
                removed = true;

        if (this.#_contexts && this.#_contexts.remove(context))
            removed = true;

        return removed;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
