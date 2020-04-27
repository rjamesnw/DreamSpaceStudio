import TimeReferencedObject, { ITimeReferencedObject } from "./TimeReferencedObject";
import { bool } from "aws-sdk/clients/signer";
import Memory, { IMemoryObject } from "./Memory";
import Concept from "./Concept";
import DictionaryItem from "./DictionaryItem";

export class ContextCollection<T extends IContext> extends Array<T>
{
    /// <summary>
    /// The context that owns this collection.
    /// </summary>
    readonly Owner: Context;

    get HasItems(): boolean { return this.length > 0; }

    constructor(owner: Context);
    /// <summary> Constructs a new collection from another by copying only types that match the new collection's type. </summary>
    /// <param name="contextCollection"> Collection of contexts by base reference. </param>
    constructor(contextCollection: ContextCollection<IContext>);
    constructor(obj: Context | ContextCollection<IContext>) {
        super();
        if (!obj)
            throw DS.Exception.invalidArgument('ContextCollection()', 'owner/contextCollection', obj);
        if (obj instanceof ContextCollection) {
            this.Owner = obj.Owner;
        }
        else {
            if (contextCollection)
                for (var ctx of contextCollection)
                    if (ctx is T)
            Add((T)ctx);
        }
    }

    /// <summary>
    /// Searches the for a context of the requested type, or null if nothing was found.
    /// </summary>
    GetContexts<TContext>(): TContext[] {
        return this.Where(a => a.ContextType == typeof (TContext)).Cast<TContext>().ToArray();
    }

    Add(context: T) {
        var ctx = context as Context;
        if (context.Parent != null)
            ctx?.Remove(context.Parent);
        if (ctx != null) ctx.Parent = Owner;
        base.Add(context);
    }

    Remove(T context): boolean {
        if (base.Remove(context)) {
            var ctx = context as Context;
            if (ctx != null) ctx.Parent = null;
            return true;
        }
        else return false;
    }

    /// <summary>
    /// Removes the given context and returns true, or false if not found.
    /// </summary>
    RemoveContext(context: T): boolean {
        return Remove(context);
    }

    /// <summary>
    /// Removes one or more contexts.
    /// </summary>
    RemoveContexts(...contexts: T[]) {
        for (var c of contexts)
            RemoveContext(c);
    }

    /// <summary>
    /// Removes one or more contexts of the given type.
    /// </summary>
    RemoveContexts<TContext>() {
        RemoveContexts(GetContexts<TContext>().Cast<T>().ToArray());
    }
}

/// <summary> This just serves as a method to register contexts that are alike (using a shared type name). </summary>
/// <typeparam name="T"> A context type. </typeparam>
export interface IContext implements ITimeReferencedObject {
    Parent: Context;
    contextType: Type;
}

/// <summary>
/// The context around a given concept.
/// When concepts are triggered, contexts are built up in order to establish the content and intent of the user's input.
/// </summary>
export default class Context extends TimeReferencedObject implements IMemoryObject, IContext {
    // --------------------------------------------------------------------------------------------------------------------

    /// <summary>
    /// Keeps a reference of the parent context connections that relates to this context, if any. This allows nesting contexts under other contexts using relationships.
    /// A parent context can have many child contexts, which is a context tree that represents a potential engram of data content to store later.
    /// </summary>
    readonly Parent: Context;

    /// <summary>
    /// The type if this context.
    /// </summary>
    readonly contextType: IType<IContext>;

    /// <summary>
    /// The concept responsible for creating this context, if any.
    /// </summary>
    readonly concept: Concept;

    readonly memory: Memory;

    // --------------------------------------------------------------------------------------------------------------------

    private readonly _Contexts: Map<IType<IContext>, ContextCollection<IContext>> = new Map<IType<IContext>, ContextCollection<IContext>>();

    /// <summary> 
    /// A list of contexts in order of addition.  The first item is the first context added to this current
    /// context, and the last item is the most recent context that was added.
    /// </summary>
    OrderedContexts: Context[];

    // --------------------------------------------------------------------------------------------------------------------

    ///// <summary>
    ///// Get the current instance or a parent instance that is a subject context (<see cref="SubjectContext"/> instance).
    ///// </summary>
    //x public bool IsSubjectContext => this is SubjectContext;

    ///// <summary> Returns true if this object is question context (<see cref="QuestionContext"/> instance). </summary>
    ///// <value> A true or false value. </value>
    //x public bool IsQuestionContext => this is QuestionContext;

    /// <summary> 
    /// The action (verbs) of a statement in regards to the subjects. For example, "is" or "are" is a claim one or more
    /// things is like something else (i.e. John is nice), or as part of a question (who are they? what time is it?). 
    /// Other examples may be "John *drove* away" or "Pat *ran* to the store.".
    /// </summary>
    get Actions(): Iterable<ActionContext> { return this.Get(ActionContext); }

    /// <summary>
    /// True if this context has actions (typically because of verbs).
    /// </summary>
    get HasActions(): boolean { return this.Get(ActionContext)?.HasItems ?? false; }

    /// <summary>
    /// Associates descriptive attributes for this context.
    /// These contexts typically determine how something is like another.
    /// </summary>
    get Attributes() { return #_Attributes; };
    #_Attributes: Iterable<AttributeContext>;

    /// <summary>
    /// True if this context has attributes (typically because of adjectives).
    /// </summary>
    get HasAttributes(): boolean { return this.Get(AttributeContext)?.HasItems ?? false; }

    /// <summary>
    /// Associates contexts that modify this context (such as frequency, time constraints, speed, etc.).
    /// The most common is the frequency context, which use used with the determiner concept (i.e. "the" or "a", etc.).
    /// </summary>
    get Modifiers() { return this.#_Modifiers; }
    #_Modifiers: Iterable<ModifierContext>;

    /// <summary>
    /// True if this context has modifiers (typically because of adverbs).
    /// </summary>
    get HasModifiers(): boolean { return this.Get(typeof (ModifierContext))?.HasItems ?? false; }

    /// <summary>
    /// Associates contexts that modify this context (such as frequency, time constraints, speed, etc.).
    /// The most common is the frequency context, which use used with the determiner concept (i.e. "the" or "a", etc.).
    /// </summary>
    get Questions() { return this.#_Questions; }
    #_Questions: Iterable<ModifierContext>;

    /// <summary>
    /// True if this context has modifiers (typically because of adverbs).
    /// </summary>
    get HasQuestions(): boolean { return this.Get(QuestionContext)?.HasItems ?? false; }

    /// <summary> Determines if there is a question context associated with the given question word. </summary>
    /// <param name="question"> The question word to check for. </param>
    /// <returns> True if the question is in the context, and false if not. </returns>
    HasQuestion(question: DictionaryItem): boolean {
        var questions = this.Get(QuestionContext);
        if (questions != null)
            foreach(var q in questions)
        if (((QuestionContext)q).Question == question)
        return true;
        return false;
    }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(memory: Memory, concept: Concept, parent: Context = null) {
        super();
        if (!memory) throw DS.Exception.argumentRequired('Context()', 'memory', memory);
        this.contextType = <any>this.constructor;
        this.memory = memory;
        //? Concept = concept ?? throw new ArgumentNullException(nameof(concept));
        this.Parent = parent;
    }

    // --------------------------------------------------------------------------------------------------------------------

    Add(ctx: Context): this {
        if (ctx != null) {
            var type = ctx.contextType;
            if (!this._Contexts.has(type))
                this._Contexts.set(type, new ContextCollection<IContext>(this));
            this._Contexts.get(type).Add(ctx);
            if (this.OrderedContexts == null)
                this.OrderedContexts = [];
            this.OrderedContexts.push(ctx);
        }
        return this;
    }

    /// <summary> Enumerates the contexts of a given type and returns them in a new collection object. </summary>
    /// <param name="contextType"> The context type to find. </param>
    /// <returns> An enumerator that allows enumerating over the matched items. </returns>
    Get<T extends IContext>(contextType: IType<IContext>): ContextCollection<T> {
        var existingCollection = this._Contexts.get(contextType);
        return existingCollection ? new ContextCollection<T>(existingCollection) : null;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /// <summary> Enumerates this collection for all contexts of type <typeparamref name="T"/>. </summary>
    /// <typeparam name="T"> The context types to include in the enumeration. </typeparam>
    /// <param name="includeGroups"> (Optional) True to include grouped contexts in the search. </param>
    /// <returns> An enumeration of all contexts found matching type <typeparamref name="T"/>. </returns>
    *Flatten<T extends IType<IContext>>(type: T, includeGroups = true): Iterable<T> {
        var subjects = this.Get(type);
        yield* subjects;

        var subjectGroups = Get<GroupContext<T>>();
        for (var sg of subjectGroups)
            for (var s of sg.Contexts)
                yield s;

        //if (Parent != null)
        //    foreach (var s in Parent.FlattenSubjects())
        //        yield return s;
    }

    // --------------------------------------------------------------------------------------------------------------------

    ///// <summary>
    ///// Get the current instance or a parent instance that is a context of the requested type, or null if nothing was found.
    ///// </summary>
    //public T GetContext<T>() where T : Context
    //{
    //    return (this is T) ? (T)this : Parent?.GetContext<T>();
    //}

    ///// <summary>
    ///// Ignores the current instance and looks for a parent instance that is a context of the requested type, or null if nothing was found.
    ///// </summary>
    //public T GetParentContext<T>() where T : Context
    //{
    //    return Parent?.GetContext<T>();
    //}

    // --------------------------------------------------------------------------------------------------------------------

    ///// <summary>
    ///// Create a split point from this scene to process separately, but in relation to this one.
    ///// </summary>
    //? public virtual Context Fork()
    //{
    //    var s = new Context(Memory, this);

    //    // Forked contexts are blank, but allow associating sub-contexts with a related parent context.
    //    // Example: The dog [the one I saw yesterday] was black)
    //    // In the above case, "the one" refers to the parent context subject "the dog". As such, contexts can back reference subjects in parent scopes.

    //    return s;
    //}

    // --------------------------------------------------------------------------------------------------------------------

    /// <summary>
    /// Attempts to detect and remove the given context object from any of the context collections it should belong to.
    /// </summary>
    Remove(context: Context): boolean {
        if (context == null) return false;

        var removed = false;

        foreach(var item in _Contexts)
        if (item.Value.Remove(context))
            removed = true;

        if (OrderedContexts != null)
            if (OrderedContexts.Remove(context))
                removed = true;

        return removed;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
