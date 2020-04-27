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
var __GeneralPOS;
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
const POS_1 = require("../core/POS");
const DictionaryItem_1 = require("../core/DictionaryItem");
class ThoughtGraphNode extends Node_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(word, pos = null) {
        __GeneralPOS.set(this, void 0);
        this.Word = word;
        __classPrivateFieldSet(this, __GeneralPOS, this.Generalize(pos !== null && pos !== void 0 ? pos : Word === null || Word === void 0 ? void 0 : Word.POS));
    }
    // --------------------------------------------------------------------------------------------------------------------
    static get CreateTempDictionaryItem(pos, part = null) { return new DictionaryItem_1.default(null, part, pos); }
    static get CreateSubjectGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Subject, part); }
    static get CreateQuestiontGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Question, part); }
    static get CreateAttributeGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Attribute, part); }
    static get CreateModifierGroupDictionaryItem(part = null) { return this.CreateTempDictionaryItem(POS_1.default.Group_Modifier, part); }
    static get CreateSubjectGroup(part = null) { return new ThoughtGraphNode(this.CreateSubjectGroupDictionaryItem(part)); }
    // --------------------------------------------------------------------------------------------------------------------
    get root() { return super.root; }
    /// <summary>
    ///     The part of speech that this node classifies under.  This is a generalization that may be different than the
    ///     associated word (such as for groups).
    /// </summary>
    get GeneralPOS() { var _a; return (_a = __classPrivateFieldGet(this, __GeneralPOS)) !== null && _a !== void 0 ? _a : Word === null || Word === void 0 ? void 0 : Word.POS; }
    set GeneralPOS(value) { __classPrivateFieldSet(this, __GeneralPOS, value); }
    get IsEmpty() { var _a; return ((_a = this.Word) === null || _a === void 0 ? void 0 : _a.TextPart) == null && !this.IsGroup; }
    get IsGroup() { var _a, _b; return (_b = (_a = this.GeneralPOS) === null || _a === void 0 ? void 0 : _a.ClassOf(POS_1.default.Group)) !== null && _b !== void 0 ? _b : false; }
    get IsQuestion() { var _a; return ((_a = this.GeneralPOS) === null || _a === void 0 ? void 0 : _a.Classification) == POS_1.default.Adverb_Question.Classification; } // (all classifications for question have the same name)
    get IsSubject() { return this.GeneralPOS == POS_1.default.Group_Subject; }
    get IsAttribute() { return this.GeneralPOS == POS_1.default.Group_Attribute; }
    get IsModifier() { return this.GeneralPOS == POS_1.default.Group_Modifier; }
    /// <summary>
    /// Searches do no cross conjunction barriers (such as when "and" joins two parts).
    /// </summary>
    get IsConjunction() { return this.GeneralPOS == POS_1.default.Conjunction; }
    /// <summary>
    ///     Associations are boundaries where verbs (such as "is/are") connect a subject to another area of the thought graph.
    ///     These "areas" may each have their own subjects, and as such, a subject search with each area should only return the
    ///     subject for that area.
    ///     <para>Example 1: For a sentence such as "John has brown eyes and Jane has blue eyes", "and" is the association
    ///     (conjunction), and either side of it are the subjects "John" and "Jane". </para>
    ///     <para>Example 2: For a sentence such as "Peter has a car, above which a bird flies.", "above" is the association
    ///     (preposition), and either side of it are the subjects "Car" and "Bird"; however, "has" is ALSO an association,
    ///     where either side are the subjects "Peter" and "Car". </para>
    /// </summary>
    /// <value> A true or false value. </value>
    get IsAssociation() {
        if (GeneralPOS == POS_1.default.Verb)
            return true;
        if (GeneralPOS == POS_1.default.Preposition)
            return true;
        if (GeneralPOS == POS_1.default.Conjunction)
            return true;
        return false;
    }
    /// <summary>
    /// Generalizes similar parts of speech (such as grouping all question types into one idea: question).
    /// </summary>
    /// <param name="pos"></param>
    /// <returns></returns>
    Generalize(pos) {
        if (pos == null)
            return null;
        if ((pos === null || pos === void 0 ? void 0 : pos.Classification) == POS_1.default.Adverb_Question.Classification)
            return POS_1.default.Group_Question;
        //x if (pos?.ClassOf(POS.Noun) ?? false)
        //x    return POS.Group_Subject;
        return pos;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary>
    ///     Attaches the word as a child to this node. Note: This forces an attachment.  No check is performed, so it is assumed
    ///     the caller knows what they are doing.
    /// </summary>
    /// <param name="word"> . </param>
    /// <returns> The new <see cref="ThoughtGraphNode"/> added. </returns>
    Attach(word) {
        return super.Attach(new ThoughtGraphNode(word));
    }
    /// <summary>
    ///     Replaces this node with the given node and attaches the current node as a child to the new parent node. Note: This
    ///     forces an attachment.  No check is performed, so it is assumed the caller knows what they are doing.
    /// </summary>
    /// <param name="word"> . </param>
    /// <returns> The new <see cref="ThoughtGraphNode"/> created. </returns>
    AttachAsParent(word) {
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
        newNode.Attach(this); // (this node will now be a child of the new node)
        return newNode;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary>
    ///     Finds the best place to add the given word (or symbol). This method determines if this node is the best place.  For
    ///     example, if an adjective is given, and the current node represents a determiner, then a subject will be searched for
    ///     instead. The returned node is the node the word was actually added to (which of course may not be the current node).
    /// </summary>
    /// <param name="word"> The dictionary item to search for. </param>
    /// <returns> A ThoughtGraphNode. </returns>
    Add(word) {
        var _a;
        // ... check the question FIRST, since we are ignoring the POS class here ...
        if (((_a = word.POS) === null || _a === void 0 ? void 0 : _a.Classification) == POS_1.default.Adverb_Question.Classification) // (all questions have the same classification text)
            return _AddQuestion(word);
        return _CheckConjunction(word)._Add(word);
    }
    _Add(word) {
        if (word.ClassOf(POS_1.default.Determiner))
            return _AddDeterminer(word);
        if (word.ClassOf(POS_1.default.Noun))
            return _AddNoun(word);
        if (word.ClassOf(POS_1.default.Pronoun))
            return _AddPronoun(word);
        if (word.ClassOf(POS_1.default.Conjunction))
            return _AddConjunction(word);
        if (word.ClassOf(POS_1.default.Preposition))
            return _AddPreposition(word);
        if (word.ClassOf(POS_1.default.Verb_Is))
            return _AddIs(word); // (or 'are')
        return _AddUnkown(word);
    }
    // --------------------------------------------------------------------------------------------------------------------
    _requireSubject() {
        var subject = FindTopFirst(POS_1.default.Group_Subject, true);
        if (subject != null)
            return subject;
        if (Root.IsQuestion)
            return Root.Attach(CreateSubjectGroupDictionaryItem()); // (the subject should come under the question, if one exists)
        else
            return Root.AttachAsParent(CreateSubjectGroupDictionaryItem());
    }
    _requireQuestion() {
        var qgroup = FindTopFirst(POS_1.default.Group_Question, true);
        if (qgroup != null)
            return qgroup;
        return _requireSubject().AttachAsParent(CreateQuestiontGroupDictionaryItem());
    }
    _requireAttribute() {
        var attrGroup = FindBottomFirst(POS_1.default.Group_Attribute, true); // (usually attributes are in the children, so search there first)
        if (attrGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var subject = _requireSubject(); // (first find the subject within this area)
            attrGroup = subject.Attach(CreateAttributeGroupDictionaryItem());
        }
        return attrGroup;
    }
    _requireModifier() {
        var modGroup = this.FindBottomFirst(POS_1.default.Group_Modifier, true); // (usually attributes are in the children, so search there first)
        if (modGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var verb = this.FindBottomFirst(POS_1.default.Verb, true); // (first find the subject within this area)
            modGroup = (verb !== null && verb !== void 0 ? verb : this).Attach(CreateModifierGroupDictionaryItem());
        }
        return modGroup;
    }
    // --------------------------------------------------------------------------------------------------------------------
    _AddUnkown(text) {
        return Attach(text); // (in the case that we don't know what to do with this we just attach it and stay on the current node)
        //? return this;
    }
    _AddQuestion(q) {
        var qnode = this._requireQuestion();
        var newNode = new ThoughtGraphNode(q);
        return qnode.AddSibling(newNode); // (the current node context is now the question group, not a single subject [noun])
    }
    _AddDeterminer(det) {
        var subject = this._requireSubject();
        subject.Attach(det);
        return subject;
    }
    _AddSubjectAssociation(assoc) {
        var subject = this._requireSubject();
        return subject.Attach(assoc); // (the "is" or "are" will act as a connector, and will become the new 'current' node [by returning it]; this also creates a barrier [all associations are subject ])
    }
    _AddIs(isOrAre) { return _AddSubjectAssociation(isOrAre); }
    _AddPreposition(prepos) { return _AddSubjectAssociation(prepos); }
    _AddConjunction(conj) {
        // ... if a duplicate, ignore and stay here ...
        if (this.Word == conj)
            return this;
        // ... certain conjunctions will tag on the end of the current node and then returned as current until we know what comes next ...
        if (conj == "and" || conj == "or")
            return this.Attach(conj);
        else
            return this._requireSubject().Attach(conj); // (all others we will attach to the subject right away)
    }
    _CheckConjunction(nextWord) {
        var _a, _b;
        if (!this.IsConjunction)
            return this;
        if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.GeneralPOS) == nextWord.POS) {
            // TODO: Convert to a group to combine them 
            // TOTEST: john is red and blue
            var parent = this.parent;
            this.Detach(); // (abandon this and - it's implied by the sibling list)
            return parent;
        }
        if (((_b = nextWord.POS) === null || _b === void 0 ? void 0 : _b.Classification) == POS_1.default.Adverb_Question.Classification) {
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
        var _a, _b, _c, _d, _e, _f;
        if (item instanceof DictionaryItem_1.default) {
            if (exclude == this)
                return null;
            if (includeThis && this.Word.equals(item))
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_b = (_a = this.siblings) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.IsConjunction)
                return null; // (this is a subject area barrier)
            return (depth < 0 || depth > 0) ? (_c = this.parent) === null || _c === void 0 ? void 0 : _c.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
        }
        else {
            if (exclude == this)
                return null;
            if (includeThis && __classPrivateFieldGet(this, __GeneralPOS).equals(item))
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_e = (_d = this.siblings) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.IsConjunction)
                return null; // (this is a subject area barrier)
            return (depth < 0 || depth > 0) ? (_f = this.parent) === null || _f === void 0 ? void 0 : _f.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
        }
    }
    /// <summary> Searches the child nodes for a match to the given dictionary word item. </summary>
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
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (item instanceof DictionaryItem_1.default) {
            if (exclude == this)
                return null;
            if (includeThis && this.Word == item)
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_b = (_a = this.siblings) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.IsConjunction)
                return null; // (this is a subject area barrier)
            if (depth < 0 || depth > 0)
                for (var i = 0, n = (_d = (_c = this.children) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0; i < n; ++i) {
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
            if (includeThis && __classPrivateFieldGet(this, __GeneralPOS).equals(item))
                return this;
            if (includeSiblings)
                for (var i = 0, n = (_f = (_e = this.siblings) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);
            if (!includeConjunctions && this.IsConjunction)
                return null; // (this is a subject area barrier)
            if (depth < 0 || depth > 0)
                for (var i = 0, n = (_h = (_g = this.children) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0; i < n; ++i) {
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
__GeneralPOS = new WeakMap();
//# sourceMappingURL=ThoughtGraphNode.js.map