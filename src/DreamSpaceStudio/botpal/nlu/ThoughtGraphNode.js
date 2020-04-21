"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
class ThoughtGraphNode extends Node_1.default {
    CreateTempDictionaryItem(PartOfSpeech, pos, TextPart, part = null) { }
}
exports.default = ThoughtGraphNode;
new DictionaryItem(null, part, pos);
DictionaryItem;
CreateSubjectGroupDictionaryItem(TextPart, part = null);
CreateTempDictionaryItem(POS.Group_Subject, part);
DictionaryItem;
CreateQuestiontGroupDictionaryItem(TextPart, part = null);
CreateTempDictionaryItem(POS.Group_Question, part);
DictionaryItem;
CreateAttributeGroupDictionaryItem(TextPart, part = null);
CreateTempDictionaryItem(POS.Group_Attribute, part);
DictionaryItem;
CreateModifierGroupDictionaryItem(TextPart, part = null);
CreateTempDictionaryItem(POS.Group_Modifier, part);
ThoughtGraphNode;
CreateSubjectGroup(TextPart, part = null);
new ThoughtGraphNode(CreateSubjectGroupDictionaryItem(part));
// --------------------------------------------------------------------------------------------------------------------
/// <summary>
/// A word (or symbol or other text) that is the subject of this node in the graph.
/// This is set to the detected "word" in the user's request.
/// </summary>
Word: DictionaryItem;
/// <summary>
///     The part of speech that this node classifies under.  This is a generalization that may be different than the
///     associated word (such as for groups).
/// </summary>
get;
GeneralPOS();
PartOfSpeech;
{
    return (_a = this.) !== null && _a !== void 0 ? _a : Word === null || Word === void 0 ? void 0 : Word.POS;
}
set;
GeneralPOS(value, PartOfSpeech);
{
    this. = value;
}
#_GeneralPOS: PartOfSpeech;
bool;
IsEmpty => (Word === null || Word === void 0 ? void 0 : Word.TextPart) == null && !IsGroup;
bool;
IsGroup => { var _a; return (_a = GeneralPOS === null || GeneralPOS === void 0 ? void 0 : GeneralPOS.ClassOf(POS.Group)) !== null && _a !== void 0 ? _a : false; };
bool;
IsQuestion => (GeneralPOS === null || GeneralPOS === void 0 ? void 0 : GeneralPOS.Classification) == POS.Adverb_Question.Classification; // (all classifications for question have the same name)
bool;
IsSubject => GeneralPOS == POS.Group_Subject;
bool;
IsAttribute => GeneralPOS == POS.Group_Attribute;
bool;
IsModifier => GeneralPOS == POS.Group_Modifier;
bool;
IsConjunction => GeneralPOS == POS.Conjunction;
bool;
IsAssociation;
{
    get;
    {
        if (GeneralPOS == POS.Verb)
            return true;
        if (GeneralPOS == POS.Preposition)
            return true;
        if (GeneralPOS == POS.Conjunction)
            return true;
        return false;
    }
}
ThoughtGraphNode(DictionaryItem, word, PartOfSpeech, pos = null);
{
    Word = word;
    _GeneralPOS = Generalize(pos !== null && pos !== void 0 ? pos : Word === null || Word === void 0 ? void 0 : Word.POS);
}
PartOfSpeech;
Generalize(PartOfSpeech, pos);
{
    if (pos == null)
        return null;
    if ((pos === null || pos === void 0 ? void 0 : pos.Classification) == POS.Adverb_Question.Classification)
        return POS.Group_Question;
    //x if (pos?.ClassOf(POS.Noun) ?? false)
    //x    return POS.Group_Subject;
    return pos;
}
ThoughtGraphNode;
Attach(DictionaryItem, word);
{
    return Attach(new ThoughtGraphNode(word));
}
ThoughtGraphNode;
AttachAsParent(DictionaryItem, word);
{
    // ... detach the current node from its parents, if any ...
    var parent = Parent; // (save the parent reference before we lose it)
    Detach();
    var newNode = new ThoughtGraphNode(word);
    {
        // ... copy over the parent to the new node ...
        Parent = parent;
    }
    ;
    // ... attach this node under the new node (parent) ...
    newNode.Attach(this); // (this node will now be a child of the new node)
    return newNode;
}
ThoughtGraphNode;
Add(DictionaryItem, word);
{
    // ... check the question FIRST, since we are ignoring the POS class here ...
    if (((_b = word.POS) === null || _b === void 0 ? void 0 : _b.Classification) == POS.Adverb_Question.Classification) // (all questions have the same classification text)
        return _AddQuestion(word);
    return _CheckConjunction(word)._Add(word);
}
ThoughtGraphNode;
_Add(DictionaryItem, word);
{
    if (word.ClassOf(POS.Determiner))
        return _AddDeterminer(word);
    if (word.ClassOf(POS.Noun))
        return _AddNoun(word);
    if (word.ClassOf(POS.Pronoun))
        return _AddPronoun(word);
    if (word.ClassOf(POS.Conjunction))
        return _AddConjunction(word);
    if (word.ClassOf(POS.Preposition))
        return _AddPreposition(word);
    if (word.ClassOf(POS.Verb_Is))
        return _AddIs(word); // (or 'are')
    return _AddUnkown(word);
}
// --------------------------------------------------------------------------------------------------------------------
ThoughtGraphNode;
_requireSubject();
{
    var subject = FindTopFirst(POS.Group_Subject, true);
    if (subject != null)
        return subject;
    if (Root.IsQuestion)
        return Root.Attach(CreateSubjectGroupDictionaryItem()); // (the subject should come under the question, if one exists)
    else
        return Root.AttachAsParent(CreateSubjectGroupDictionaryItem());
}
ThoughtGraphNode;
_requireQuestion();
{
    var qgroup = FindTopFirst(POS.Group_Question, true);
    if (qgroup != null)
        return qgroup;
    return _requireSubject().AttachAsParent(CreateQuestiontGroupDictionaryItem());
}
ThoughtGraphNode;
_requireAttribute();
{
    var attrGroup = FindBottomFirst(POS.Group_Attribute, true); // (usually attributes are in the children, so search there first)
    if (attrGroup == null) {
        // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
        var subject = _requireSubject(); // (first find the subject within this area)
        attrGroup = subject.Attach(CreateAttributeGroupDictionaryItem());
    }
    return attrGroup;
}
ThoughtGraphNode;
_requireModifier();
{
    var modGroup = FindBottomFirst(POS.Group_Modifier, true); // (usually attributes are in the children, so search there first)
    if (modGroup == null) {
        // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
        var verb = FindBottomFirst(POS.Verb, true); // (first find the subject within this area)
        modGroup = (verb !== null && verb !== void 0 ? verb : this).Attach(CreateModifierGroupDictionaryItem());
    }
    return modGroup;
}
// --------------------------------------------------------------------------------------------------------------------
ThoughtGraphNode;
_AddUnkown(DictionaryItem, text);
{
    return Attach(text); // (in the case that we don't know what to do with this we just attach it and stay on the current node)
    //? return this;
}
ThoughtGraphNode;
_AddQuestion(DictionaryItem, q);
{
    var qnode = _requireQuestion();
    var newNode = new ThoughtGraphNode(q);
    return qnode.AddSibling(newNode); // (the current node context is now the question group, not a single subject [noun])
}
ThoughtGraphNode;
_AddDeterminer(DictionaryItem, det);
{
    var subject = _requireSubject();
    subject.Attach(det);
    return subject;
}
ThoughtGraphNode;
_AddSubjectAssociation(DictionaryItem, assoc);
{
    var subject = _requireSubject();
    return subject.Attach(assoc); // (the "is" or "are" will act as a connector, and will become the new 'current' node [by returning it]; this also creates a barrier [all associations are subject ])
}
ThoughtGraphNode;
_AddIs(DictionaryItem, isOrAre);
_AddSubjectAssociation(isOrAre);
ThoughtGraphNode;
_AddPreposition(DictionaryItem, prepos);
_AddSubjectAssociation(prepos);
ThoughtGraphNode;
_AddConjunction(DictionaryItem, conj); // TODO: Need to make sure "&" is also considered somehow.
{
    // ... if a duplicate, ignore and stay here ...
    if (Word == conj)
        return this;
    // ... certain conjunctions will tag on the end of the current node and then returned as current until we know what comes next ...
    if (conj == "and" || conj == "or")
        return Attach(conj);
    else
        return _requireSubject().Attach(conj); // (all others we will attach to the subject right away)
}
ThoughtGraphNode;
_CheckConjunction(DictionaryItem, nextWord); // (repositions the conjunction based on the next word; returns where to add the next word)
{
    if (!IsConjunction)
        return this;
    if ((Parent === null || Parent === void 0 ? void 0 : Parent.GeneralPOS) == nextWord.POS) {
        // TODO: Convert to a group to combine them 
        // TOTEST: john is red and blue
        var parent = Parent;
        Detach(); // (abandon this and - it's implied by the sibling list)
        return parent;
    }
    if (((_c = nextWord.POS) === null || _c === void 0 ? void 0 : _c.Classification) == POS.Adverb_Question.Classification) {
        var q = _requireQuestion();
        Detach();
        return q;
    }
    // ... default to the subject as the connecting point ...
    var subj = _requireSubject();
    Detach();
    return subj;
}
ThoughtGraphNode;
_AddNoun(DictionaryItem, noun);
{
    var subject = _requireSubject();
    var newNode = new ThoughtGraphNode(noun);
    return subject.AddSibling(newNode); // (the new noun node now becomes the new current node)
}
ThoughtGraphNode;
_AddPronoun(DictionaryItem, pronoun);
{
    var subject = _requireSubject();
    var newNode = new ThoughtGraphNode(pronoun);
    return subject.AddSibling(newNode); // (the new noun node now becomes the new current node)
}
ThoughtGraphNode;
FindInParents(DictionaryItem, word, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1, ThoughtGraphNode, exclude = null);
{
    if (exclude == this)
        return null;
    if (includeThis && Word == word)
        return this;
    if (includeSiblings)
        for (int; i = 0, n = (_d = Siblings === null || Siblings === void 0 ? void 0 : Siblings.Count) !== null && _d !== void 0 ? _d : 0; i < n)
            ;
    ++i;
    Siblings[i].FindInParents(word, true, true, includeConjunctions, 0, exclude);
    if (!includeConjunctions && IsConjunction)
        return null; // (this is a subject area barrier)
    return (depth < 0 || depth > 0) ? Parent === null || Parent === void 0 ? void 0 : Parent.FindInParents(word, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
}
ThoughtGraphNode;
FindInChildren(DictionaryItem, word, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1, ThoughtGraphNode, exclude = null);
{
    if (exclude == this)
        return null;
    if (includeThis && Word == word)
        return this;
    if (includeSiblings)
        for (int; i = 0, n = (_e = Siblings === null || Siblings === void 0 ? void 0 : Siblings.Count) !== null && _e !== void 0 ? _e : 0; i < n)
            ;
    ++i;
    Siblings[i].FindInChildren(word, true, true, includeConjunctions, 0, exclude);
    if (!includeConjunctions && IsConjunction)
        return null; // (this is a subject area barrier)
    if (depth < 0 || depth > 0)
        for (int; i = 0, n = (_f = Children === null || Children === void 0 ? void 0 : Children.Count) !== null && _f !== void 0 ? _f : 0; i < n)
            ;
    ++i;
    {
        var child = Children[i];
        var result = child.FindInChildren(word, true, includeSiblings, includeConjunctions, depth - 1, exclude);
        if (result != null)
            return result;
    }
    return null;
}
ThoughtGraphNode;
FindTopFirst(DictionaryItem, word, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1);
{
    return (_g = FindInParents(word, includeThis, includeSiblings, includeConjunctions, depth) // (search up to root first)
    ) !== null && _g !== void 0 ? _g : Root.FindInChildren(word, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
}
ThoughtGraphNode;
FindBottomFirst(DictionaryItem, word, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1);
{
    return (_h = FindInChildren(word, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
    ) !== null && _h !== void 0 ? _h : Root.FindInChildren(word, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
}
ThoughtGraphNode;
FindInParents(PartOfSpeech, pos, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1, ThoughtGraphNode, exclude = null);
{
    if (exclude == this)
        return null;
    if (includeThis && GeneralPOS == pos)
        return this;
    if (includeSiblings)
        for (int; i = 0, n = (_j = Siblings === null || Siblings === void 0 ? void 0 : Siblings.Count) !== null && _j !== void 0 ? _j : 0; i < n)
            ;
    ++i;
    Siblings[i].FindInParents(pos, true, true, includeConjunctions, 0, exclude);
    if (!includeConjunctions && IsConjunction)
        return null; // (this is a subject area barrier)
    return (depth < 0 || depth > 0) ? Parent === null || Parent === void 0 ? void 0 : Parent.FindInParents(pos, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
}
ThoughtGraphNode;
FindInChildren(PartOfSpeech, pos, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1, ThoughtGraphNode, exclude = null);
{
    if (exclude == this)
        return null;
    if (includeThis && GeneralPOS == pos)
        return this;
    if (includeSiblings)
        for (int; i = 0, n = (_k = Siblings === null || Siblings === void 0 ? void 0 : Siblings.Count) !== null && _k !== void 0 ? _k : 0; i < n)
            ;
    ++i;
    Siblings[i].FindInChildren(pos, true, true, includeConjunctions, 0, exclude);
    if (!includeConjunctions && IsConjunction)
        return null; // (this is a subject area barrier)
    if (depth < 0 || depth > 0)
        for (int; i = 0, n = (_l = Children === null || Children === void 0 ? void 0 : Children.Count) !== null && _l !== void 0 ? _l : 0; i < n)
            ;
    ++i;
    {
        var child = Children[i];
        var result = child.FindInChildren(pos, true, includeSiblings, includeConjunctions, depth - 1, exclude);
        if (result != null)
            return result;
    }
    return null;
}
ThoughtGraphNode;
FindTopFirst(PartOfSpeech, generalPOS, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1);
{
    return (_m = FindInParents(generalPOS, includeThis, includeSiblings, includeConjunctions, depth) // (search up to root first)
    ) !== null && _m !== void 0 ? _m : Root.FindInChildren(generalPOS, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
}
ThoughtGraphNode;
FindBottomFirst(PartOfSpeech, generalPOS, bool, includeThis = false, bool, includeSiblings = false, bool, includeConjunctions = false, int, depth = -1);
{
    return (_o = FindInChildren(generalPOS, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
    ) !== null && _o !== void 0 ? _o : Root.FindInChildren(generalPOS, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
}
//# sourceMappingURL=ThoughtGraphNode.js.map