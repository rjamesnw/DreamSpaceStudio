"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __contextType, __contextMap, __contexts, __Attributes, __Modifiers, __Questions;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextCollection = exports.context = exports.contextTags = exports.ContextTag = void 0;
const TimeReferencedObject_1 = require("./TimeReferencedObject");
const ActionContext_1 = require("../contexts/ActionContext");
const AttributeContext_1 = require("../contexts/AttributeContext");
const ModifierContext_1 = require("../contexts/ModifierContext");
const QuestionContext_1 = require("../contexts/QuestionContext");
const GroupContext_1 = require("../contexts/GroupContext");
/**
 *  A context tag is a tag that can be applied by a concept.  Other concepts may rely on context tags in order to trigger.
 *  For example, the word "time" changes meaning between "The time is" and "What is the time", where one is in context of
 *  a question, and one is not.
 */
class ContextTag {
    /**
     * Constructs a new tag for a concept (see Concept.tag).
     * @param {string} name The name of the tag.
     * @param {number} weight
     * The weight between 0.0 (0%) and 1.0 (100%) that applies to this tag. This allows creating tags with a lower requirement
     * compared to other tags that have to exist. In the end it helps to better sort the most likely contexts by the assign tags.
     */
    constructor(name, weight) {
        this.name = name;
        this.weight = weight;
    }
}
exports.ContextTag = ContextTag;
/**
 * Holds a list of registered context tags, and the context type associated with it, if any.
 * Some concepts only trigger when certain context tags exist within a context.
 */
exports.contextTags = {};
/**
 * Registers a context tag name and type with the system.
 */
function context() {
    return (target) => {
        var tag = target.tag;
        if (DS.StringUtils.isEmptyOrWhitespace(tag === null || tag === void 0 ? void 0 : tag.name))
            throw "You did not specify a valid context tag name for context type '" + DS.Utilities.getTypeName(target) + "'.";
        exports.contextTags[tag.name] = target;
    };
}
exports.context = context;
class ContextCollection extends Array {
    constructor(contextType, obj) {
        super();
        __contextType.set(this, void 0);
        if (!obj)
            throw DS.Exception.invalidArgument('ContextCollection()', 'owner or contextCollection', obj);
        __classPrivateFieldSet(this, __contextType, contextType);
        if (obj instanceof Context)
            this.owner = obj;
        else
            for (var ctx of obj)
                if (ctx instanceof contextType)
                    this.add(ctx);
    }
    get hasItems() { return this.length > 0; }
    /**
     *  Searches the for a context of the requested type, or null if nothing was found.
    */
    getContexts(type) {
        return this.filter(a => a.contextType == type);
    }
    add(context) {
        var _a;
        if ((_a = context === null || context === void 0 ? void 0 : context.parent) === null || _a === void 0 ? void 0 : _a.remove)
            context.remove(context.parent);
        if (context) {
            context.parent = this.owner;
            this.push(context);
        }
    }
    remove(context) {
        if (super.remove(context)) {
            if (context instanceof Context)
                context.parent = null;
            return true;
        }
        else
            return false;
    }
    RemoveContexts(...items) {
        for (var item of items)
            if (item instanceof Context)
                this.remove(item);
            else
                this.RemoveContexts(...this.getContexts(item));
    }
}
exports.ContextCollection = ContextCollection;
__contextType = new WeakMap();
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
class Context extends TimeReferencedObject_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, parent = null) {
        super();
        // --------------------------------------------------------------------------------------------------------------------
        /** A mapping of Context types to a collection of context instances of the same type. */
        __contextMap.set(this, new Map());
        __contexts.set(this, void 0);
        __Attributes.set(this, void 0);
        __Modifiers.set(this, void 0);
        __Questions.set(this, void 0);
        if (!concept)
            throw DS.Exception.argumentRequired('Context()', 'concept', this);
        this.concept = concept;
        this.contextType = this.constructor;
        //? Concept = concept ?? throw new ArgumentNullException(nameof(concept));
        this.parent = parent;
    }
    get memory() { return this.concept.memory; }
    /**
     * Returns a copy of the internal contexts in order of addition.  The first item is the first context added to this current
     * context, and the last item is the most recent context that was added.
     */
    getContexts() { return __classPrivateFieldGet(this, __contexts).slice(0); }
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
    get() { }
    Actions() { return this.get(ActionContext_1.default); }
    /**
     *  True if this context has actions (typically because of verbs).
    */
    get HasActions() { var _a, _b; return (_b = (_a = this.get(ActionContext_1.default)) === null || _a === void 0 ? void 0 : _a.hasItems) !== null && _b !== void 0 ? _b : false; }
    /**
     *  Associates descriptive attributes for this context.
     *  These contexts typically determine how something is like another.
    */
    get Attributes() { return __classPrivateFieldGet(this, __Attributes); }
    ;
    /**
     *  True if this context has attributes (typically because of adjectives).
    */
    get HasAttributes() { var _a, _b; return (_b = (_a = this.get(AttributeContext_1.default)) === null || _a === void 0 ? void 0 : _a.hasItems) !== null && _b !== void 0 ? _b : false; }
    /**
     *  Associates contexts that modify this context (such as frequency, time constraints, speed, etc.).
     *  The most common is the frequency context, which use used with the determiner concept (i.e. "the" or "a", etc.).
    */
    get Modifiers() { return __classPrivateFieldGet(this, __Modifiers); }
    /**
     *  True if this context has modifiers (typically because of adverbs).
    */
    get HasModifiers() { var _a, _b; return (_b = (_a = this.get(ModifierContext_1.default)) === null || _a === void 0 ? void 0 : _a.hasItems) !== null && _b !== void 0 ? _b : false; }
    /**
     *  Associates contexts that modify this context (such as frequency, time constraints, speed, etc.).
     *  The most common is the frequency context, which use used with the determiner concept (i.e. "the" or "a", etc.).
    */
    get Questions() { return __classPrivateFieldGet(this, __Questions); }
    /**
     *  True if this context has modifiers (typically because of adverbs).
    */
    get HasQuestions() { var _a, _b; return (_b = (_a = this.get(QuestionContext_1.default)) === null || _a === void 0 ? void 0 : _a.hasItems) !== null && _b !== void 0 ? _b : false; }
    /** Determines if there is a question context associated with the given question word. */
    /// <param name="question"> The question word to check for. </param>
    /// <returns> True if the question is in the context, and false if not. </returns>
    HasQuestion(question) {
        var _a;
        var questions = this.get(QuestionContext_1.default);
        if (questions != null)
            for (var q of questions)
                if ((_a = q.question) === null || _a === void 0 ? void 0 : _a.equals(question))
                    return true;
        return false;
    }
    // --------------------------------------------------------------------------------------------------------------------
    add(ctx) {
        if (ctx != null) {
            var type = ctx.contextType;
            if (!__classPrivateFieldGet(this, __contextMap).has(type))
                __classPrivateFieldGet(this, __contextMap).set(type, new ContextCollection(type, this));
            __classPrivateFieldGet(this, __contextMap).get(type).add(ctx);
            if (__classPrivateFieldGet(this, __contexts) == null)
                __classPrivateFieldSet(this, __contexts, []);
            __classPrivateFieldGet(this, __contexts).push(ctx);
        }
        return this;
    }
    /** Enumerates the contexts of a given type and returns them in a new collection object. */
    /// <param name="contextType"> The context type to find. </param>
    /// <returns> An enumerator that allows enumerating over the matched items. </returns>
    get(contextType) {
        var existingCollection = __classPrivateFieldGet(this, __contextMap).get(contextType);
        return existingCollection ? new ContextCollection(contextType, existingCollection) : null;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /** Enumerates this collection for all contexts of type <typeparamref name="T"/>. */
    /// <typeparam name="T"> The context types to include in the enumeration. </typeparam>
    /// <param name="includeGroups"> (Optional) True to include grouped contexts in the search. </param>
    /// <returns> An enumeration of all contexts found matching type <typeparamref name="T"/>. </returns>
    *Flatten(type, includeGroups = true) {
        var subjects = this.get(type);
        yield* subjects;
        var subjectGroups = this.get(GroupContext_1.default);
        for (var sg of subjectGroups)
            yield* sg.contexts;
        //if (Parent != null)
        //    foreach (var s in Parent.FlattenSubjects())
        //        yield return s;
    }
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
    remove(context) {
        if (context == null)
            return false;
        var removed = false;
        for (var item of __classPrivateFieldGet(this, __contextMap))
            if (item[1].remove(context))
                removed = true;
        if (__classPrivateFieldGet(this, __contexts) && __classPrivateFieldGet(this, __contexts).remove(context))
            removed = true;
        return removed;
    }
}
exports.default = Context;
__contextMap = new WeakMap(), __contexts = new WeakMap(), __Attributes = new WeakMap(), __Modifiers = new WeakMap(), __Questions = new WeakMap();
//# sourceMappingURL=Context.js.map