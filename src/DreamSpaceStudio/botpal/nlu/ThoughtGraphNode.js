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
var __generalPOS;
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
const POS_1 = require("../core/POS");
const DictionaryItem_1 = require("../core/DictionaryItem");
class ThoughtGraphNode extends Node_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(word, pos = null) {
        var _a;
        super();
        __generalPOS.set(this, void 0);
        this.word = word;
        __classPrivateFieldSet(this, __generalPOS, this.generalize(pos !== null && pos !== void 0 ? pos : (_a = this.word) === null || _a === void 0 ? void 0 : _a.pos));
    }
    // --------------------------------------------------------------------------------------------------------------------
    static CreateTempDictionaryItem(pos, part = null) { return new DictionaryItem_1.default(null, part, pos); }
    static CreateSubjectGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Subject, part); }
    static CreateQuestiontGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Question, part); }
    static CreateAttributeGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Attribute, part); }
    static CreateModifierGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Modifier, part); }
    static CreateSubjectGroup(part = null) { return new ThoughtGraphNode(this.CreateSubjectGroupDictionaryItem(part)); }
    // --------------------------------------------------------------------------------------------------------------------
    get root() { return super.root; }
    /**
     *      The part of speech that this node classifies under.  This is a generalization that may be different than the
     *      associated word (such as for groups).
    */
    get generalPOS() { var _a, _b; return (_a = __classPrivateFieldGet(this, __generalPOS)) !== null && _a !== void 0 ? _a : (_b = this.word) === null || _b === void 0 ? void 0 : _b.pos; }
    set generalPOS(value) { __classPrivateFieldSet(this, __generalPOS, value); }
    get isEmpty() { return (!this.word || this.word.textPart.equals(null)) && !this.isGroup; }
    get isGroup() { var _a, _b; return (_b = (_a = this.generalPOS) === null || _a === void 0 ? void 0 : _a.classOf(POS_1.default.Group)) !== null && _b !== void 0 ? _b : false; }
    get isQuestion() { var _a; return ((_a = this.generalPOS) === null || _a === void 0 ? void 0 : _a.classification) == POS_1.default.Adverb_Question.classification; } // (all classifications for question have the same name)
    get isSubject() { return this.generalPOS == POS_1.default.Group_Subject; }
    get isAttribute() { return this.generalPOS == POS_1.default.Group_Attribute; }
    get isModifier() { return this.generalPOS == POS_1.default.Group_Modifier; }
    /**
     * Searches do no cross conjunction barriers (such as when "and" joins two parts).
     * @returns
     */
    get isConjunction() { return this.generalPOS == POS_1.default.Conjunction; }
    /**
     *      Associations are boundaries where verbs (such as "is/are") connect a subject to another area of the thought graph.
     *      These "areas" may each have their own subjects, and as such, a subject search with each area should only return the
     *      subject for that area.
     *      <para>Example 1: For a sentence such as "John has brown eyes and Jane has blue eyes", "and" is the association
     *      (conjunction), and either side of it are the subjects "John" and "Jane". </para>
     *      <para>Example 2: For a sentence such as "Peter has a car, above which a bird flies.", "above" is the association
     *      (preposition), and either side of it are the subjects "Car" and "Bird"; however, "has" is ALSO an association,
     *      where either side are the subjects "Peter" and "Car". </para>
    */
    /// <value> A true or false value. </value>
    get isAssociation() {
        if (__classPrivateFieldGet(this, __generalPOS).equals(POS_1.default.Verb))
            return true;
        if (__classPrivateFieldGet(this, __generalPOS).equals(POS_1.default.Preposition))
            return true;
        if (__classPrivateFieldGet(this, __generalPOS).equals(POS_1.default.Conjunction))
            return true;
        return false;
    }
    /**
     * Generalizes similar parts of speech (such as grouping all question types into one idea: question).
     * @param {PartOfSpeech} pos
     * @returns
     */
    generalize(pos) {
        if (pos == null)
            return null;
        if ((pos === null || pos === void 0 ? void 0 : pos.classification) == POS_1.default.Adverb_Question.classification)
            return POS_1.default.Group_Question;
        //x if (pos?.ClassOf(POS.Noun) ?? false)
        //x    return POS.Group_Subject;
        return pos;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *      Attaches the word as a child to this node. Note: This forces an attachment.  No check is performed, so it is assumed
     *      the caller knows what they are doing.
    */
    /// <param name="word"> . </param>
    /// <returns> The new <see cref="ThoughtGraphNode"/> added. </returns>
    attach(word) {
        return super.attach(new ThoughtGraphNode(word));
    }
    /**
     *      Replaces this node with the given node and attaches the current node as a child to the new parent node. Note: This
     *      forces an attachment.  No check is performed, so it is assumed the caller knows what they are doing.
    */
    /// <param name="word"> . </param>
    /// <returns> The new <see cref="ThoughtGraphNode"/> created. </returns>
    attachAsParent(word) {
        // ... detach the current node from its parents, if any ...
        var parent = this.parent; // (save the parent reference before we lose it)
        this.Detach();
        var newNode = new ThoughtGraphNode(word);
        {
            // ... copy over the parent to the new node ...
            this._parent = parent;
        }
        ;
        // ... attach this node under the new node (parent) ...
        newNode.attach(this); // (this node will now be a child of the new node)
        return newNode;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *      Finds the best place to add the given word (or symbol). This method determines if this node is the best place.  For
     *      example, if an adjective is given, and the current node represents a determiner, then a subject will be searched for
     *      instead. The returned node is the node the word was actually added to (which of course may not be the current node).
    */
    /// <param name="word"> The dictionary item to search for. </param>
    /// <returns> A ThoughtGraphNode. </returns>
    Add(word) {
        var _a;
        // ... check the question FIRST, since we are ignoring the POS class here ...
        if (((_a = word.pos) === null || _a === void 0 ? void 0 : _a.Classification) == POS_1.default.Adverb_Question.classification) // (all questions have the same classification text)
            return this._AddQuestion(word);
        return this._CheckConjunction(word)._Add(word);
    }
    _Add(word) {
        if (word.classOf(POS_1.default.Determiner))
            return this._AddDeterminer(word);
        if (word.classOf(POS_1.default.Noun))
            return this._AddNoun(word);
        if (word.classOf(POS_1.default.Pronoun))
            return this._AddPronoun(word);
        if (word.classOf(POS_1.default.Conjunction))
            return this._AddConjunction(word);
        if (word.classOf(POS_1.default.Preposition))
            return this._AddPreposition(word);
        if (word.classOf(POS_1.default.Verb_Is))
            return this._AddIs(word); // (or 'are')
        return this._AddUnkown(word);
    }
    // --------------------------------------------------------------------------------------------------------------------
    _requireSubject() {
        var subject = this.FindTopFirst(POS_1.default.Group_Subject, true);
        if (subject != null)
            return subject;
        if (this.root.isQuestion)
            return this.root.attach(ThoughtGraphNode.CreateSubjectGroupDictionaryItem()); // (the subject should come under the question, if one exists)
        else
            return this.root.attachAsParent(ThoughtGraphNode.CreateSubjectGroupDictionaryItem());
    }
    _requireQuestion() {
        var qgroup = this.FindTopFirst(POS_1.default.Group_Question, true);
        if (qgroup != null)
            return qgroup;
        return this._requireSubject().attachAsParent(ThoughtGraphNode.CreateQuestiontGroupDictionaryItem());
    }
    _requireAttribute() {
        var attrGroup = this.FindBottomFirst(POS_1.default.Group_Attribute, true); // (usually attributes are in the children, so search there first)
        if (attrGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var subject = this._requireSubject(); // (first find the subject within this area)
            attrGroup = subject.attach(ThoughtGraphNode.CreateAttributeGroupDictionaryItem());
        }
        return attrGroup;
    }
    _requireModifier() {
        var modGroup = this.FindBottomFirst(POS_1.default.Group_Modifier, true); // (usually attributes are in the children, so search there first)
        if (modGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var verb = this.FindBottomFirst(POS_1.default.Verb, true); // (first find the subject within this area)
            modGroup = (verb !== null && verb !== void 0 ? verb : this).attach(ThoughtGraphNode.CreateModifierGroupDictionaryItem());
        }
        return modGroup;
    }
    // --------------------------------------------------------------------------------------------------------------------
    _AddUnkown(text) {
        return this.attach(text); // (in the case that we don't know what to do with this we just attach it and stay on the current node)
        //? return this;
    }
    _AddQuestion(q) {
        var qnode = this._requireQuestion();
        var newNode = new ThoughtGraphNode(q);
        return qnode.AddSibling(newNode); // (the current node context is now the question group, not a single subject [noun])
    }
    _AddDeterminer(det) {
        var subject = this._requireSubject();
        subject.attach(det);
        return subject;
    }
    _AddSubjectAssociation(assoc) {
        var subject = this._requireSubject();
        return subject.attach(assoc); // (the "is" or "are" will act as a connector, and will become the new 'current' node [by returning it]; this also creates a barrier [all associations are subject ])
    }
    _AddIs(isOrAre) { return this._AddSubjectAssociation(isOrAre); }
    _AddPreposition(prepos) { return this._AddSubjectAssociation(prepos); }
    _AddConjunction(conj) {
        // ... if a duplicate, ignore and stay here ...
        if (this.word.equals(conj))
            return this;
        // ... certain conjunctions will tag on the end of the current node and then returned as current until we know what comes next ...
        if (conj.equals("and") || conj.equals("or"))
            return this.attach(conj);
        else
            return this._requireSubject().attach(conj); // (all others we will attach to the subject right away)
    }
    _CheckConjunction(nextWord) {
        var _a, _b, _c;
        if (!this.isConjunction)
            return this;
        if ((_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.generalPOS) === null || _b === void 0 ? void 0 : _b.equals(nextWord.pos)) {
            // TODO: Convert to a group to combine them 
            // TOTEST: john is red and blue
            var parent = this.parent;
            this.Detach(); // (abandon this and - it's implied by the sibling list)
            return parent;
        }
        if (((_c = nextWord.pos) === null || _c === void 0 ? void 0 : _c.classification) == POS_1.default.Adverb_Question.classification) {
            var q = this._requireQuestion();
            this.Detach();
            return q;
        }
        // ... default to the subject as the connecting point ...
        var subj = this._requireSubject();
        this.Detach();
        return subj;
    }
    _AddNoun(noun) {
        var subject = this._requireSubject();
        var newNode = new ThoughtGraphNode(noun);
        return subject.AddSibling(newNode); // (the new noun node now becomes the new current node)
    }
    _AddPronoun(pronoun) {
        var subject = this._requireSubject();
        var newNode = new ThoughtGraphNode(pronoun);
        return subject.AddSibling(newNode); // (the new noun node now becomes the new current node)
    }
    FindInParents(item, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1, exclude = null) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (item instanceof DictionaryItem_1.default) {
            if (exclude == this)
                return null;
            if (includeThis && this.word.equals(item))
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_b = (_a = this.siblings) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.isConjunction)
                return null; // (this is a subject area barrier)
            return (depth < 0 || depth > 0) ? (_c = this.parent) === null || _c === void 0 ? void 0 : _c.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
        }
        else {
            if (exclude == this)
                return null;
            if (includeThis && ((_d = __classPrivateFieldGet(this, __generalPOS)) === null || _d === void 0 ? void 0 : _d.equals(item)))
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_f = (_e = this.siblings) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.isConjunction)
                return null; // (this is a subject area barrier)
            return (depth < 0 || depth > 0) ? (_g = this.parent) === null || _g === void 0 ? void 0 : _g.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
        }
    }
    /** Searches the child nodes for a match to the given dictionary word item. */
    /// <param name="word"> The dictionary item to search for. </param>
    /// <param name="includeThis"> (Optional) If true, then the current instance is included (default is false). </param>
    /// <param name="includeSiblings">
    ///     (Optional) Set to true to include grouped nodes (siblings) in the search. The default is false, which ignores all
    ///     siblings.
    /// </param>
    /// <param name="includeConjunctions">
    ///     (Optional) Associations are subject boundaries. Most searches usually occur within specific subject areas. If this
    ///     is true, then associations are ignored, which means the entire thought graph as a whole is searched. The default is
    ///     false.
    /// </param>
    /// <param name="depth"> (Optional) How many children deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in children. </returns>
    FindInChildren(item, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1, exclude = null) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (item instanceof DictionaryItem_1.default) {
            if (exclude == this)
                return null;
            if (includeThis && ((_a = this.word) === null || _a === void 0 ? void 0 : _a.equals(item)))
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_c = (_b = this.siblings) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.isConjunction)
                return null; // (this is a subject area barrier)
            if (depth < 0 || depth > 0)
                for (var i = 0, n = (_e = (_d = this.children) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0; i < n; ++i) {
                    var child = this.children[i];
                    var result = child.FindInChildren(item, true, includeSiblings, includeConjunctions, depth - 1, exclude);
                    if (result != null)
                        return result;
                }
            return null;
        }
        else {
            if (exclude == this)
                return null;
            if (includeThis && ((_f = __classPrivateFieldGet(this, __generalPOS)) === null || _f === void 0 ? void 0 : _f.equals(item)))
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_h = (_g = this.siblings) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.isConjunction)
                return null; // (this is a subject area barrier)
            if (depth < 0 || depth > 0)
                for (var i = 0, n = (_k = (_j = this.children) === null || _j === void 0 ? void 0 : _j.length) !== null && _k !== void 0 ? _k : 0; i < n; ++i) {
                    var child = this.children[i];
                    var result = child.FindInChildren(item, true, includeSiblings, includeConjunctions, depth - 1, exclude);
                    if (result != null)
                        return result;
                }
            return null;
        }
    }
    FindTopFirst(item, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1) {
        var _a, _b;
        if (item instanceof DictionaryItem_1.default)
            return (_a = this.FindInParents(item, includeThis, includeSiblings, includeConjunctions, depth) // (search up to root first)
            ) !== null && _a !== void 0 ? _a : this.root.FindInChildren(item, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
        else
            return (_b = this.FindInParents(item, includeThis, includeSiblings, includeConjunctions, depth) // (search up to root first)
            ) !== null && _b !== void 0 ? _b : this.root.FindInChildren(item, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
    }
    FindBottomFirst(item, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1) {
        var _a, _b;
        if (item instanceof DictionaryItem_1.default)
            return (_a = this.FindInChildren(item, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
            ) !== null && _a !== void 0 ? _a : this.root.FindInChildren(item, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
        else
            return (_b = this.FindInChildren(item, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
            ) !== null && _b !== void 0 ? _b : this.root.FindInChildren(item, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
    }
}
exports.default = ThoughtGraphNode;
__generalPOS = new WeakMap();
//# sourceMappingURL=ThoughtGraphNode.js.map