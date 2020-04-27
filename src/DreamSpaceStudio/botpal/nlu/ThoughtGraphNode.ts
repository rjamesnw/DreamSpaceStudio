import MultiNode from "./Node";
import TextPart from "../core/TextPart";
import POS, { PartOfSpeech } from "../core/POS";
import DictionaryItem from "../core/DictionaryItem";

export default class ThoughtGraphNode extends MultiNode<ThoughtGraphNode>
{
    // --------------------------------------------------------------------------------------------------------------------

    static get CreateTempDictionaryItem(pos: PartOfSpeech, part: TextPart = null) { return new DictionaryItem(null, part, pos); }
    static get CreateSubjectGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Subject, part); }
    static get CreateQuestiontGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Question, part); }
    static get CreateAttributeGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Attribute, part); }
    static get CreateModifierGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Modifier, part); }
    static get CreateSubjectGroup(part: TextPart = null) { return new ThoughtGraphNode(this.CreateSubjectGroupDictionaryItem(part)); }

    // --------------------------------------------------------------------------------------------------------------------

    get root(): ThoughtGraphNode { return super.root; }

    /// <summary>
    /// A word (or symbol or other text) that is the subject of this node in the graph.
    /// This is set to the detected "word" in the user's request.
    /// </summary>
    Word: DictionaryItem;

    /// <summary>
    ///     The part of speech that this node classifies under.  This is a generalization that may be different than the
    ///     associated word (such as for groups).
    /// </summary>
    get GeneralPOS(): PartOfSpeech { return this.#_GeneralPOS ?? Word?.POS; }
    set GeneralPOS(value: PartOfSpeech) { this.#_GeneralPOS = value; }
    #_GeneralPOS: PartOfSpeech;

    get IsEmpty() { return this.Word?.TextPart == null && !this.IsGroup; }

    get IsGroup() { return this.GeneralPOS?.ClassOf(POS.Group) ?? false; }

    get IsQuestion() { return this.GeneralPOS?.Classification == POS.Adverb_Question.Classification; }// (all classifications for question have the same name)

    get IsSubject() { return this.GeneralPOS == POS.Group_Subject; }

    get IsAttribute() { return this.GeneralPOS == POS.Group_Attribute; }

    get IsModifier() { return this.GeneralPOS == POS.Group_Modifier; }

    /// <summary>
    /// Searches do no cross conjunction barriers (such as when "and" joins two parts).
    /// </summary>
    get IsConjunction() { return this.GeneralPOS == POS.Conjunction; }

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
        if (GeneralPOS == POS.Verb) return true;
        if (GeneralPOS == POS.Preposition) return true;
        if (GeneralPOS == POS.Conjunction) return true;
        return false;
    }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(word: DictionaryItem, pos: PartOfSpeech = null) {
        this.Word = word;
        this.#_GeneralPOS = this.Generalize(pos ?? Word?.POS);
    }

    /// <summary>
    /// Generalizes similar parts of speech (such as grouping all question types into one idea: question).
    /// </summary>
    /// <param name="pos"></param>
    /// <returns></returns>
    Generalize(pos: PartOfSpeech): PartOfSpeech {
        if (pos == null) return null;
        if (pos?.Classification == POS.Adverb_Question.Classification)
            return POS.Group_Question;
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
    Attach(word: DictionaryItem): ThoughtGraphNode {
        return super.Attach(new ThoughtGraphNode(word));
    }

    /// <summary>
    ///     Replaces this node with the given node and attaches the current node as a child to the new parent node. Note: This
    ///     forces an attachment.  No check is performed, so it is assumed the caller knows what they are doing.
    /// </summary>
    /// <param name="word"> . </param>
    /// <returns> The new <see cref="ThoughtGraphNode"/> created. </returns>
    AttachAsParent(word: DictionaryItem): ThoughtGraphNode {
        // ... detach the current node from its parents, if any ...

        var parent = this.parent; // (save the parent reference before we lose it)
        this.Detach();

        var newNode = new ThoughtGraphNode(word)
        {
            // ... copy over the parent to the new node ...
            this._parent = parent
        };

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
    Add(word: DictionaryItem): ThoughtGraphNode {
        // ... check the question FIRST, since we are ignoring the POS class here ...
        if (word.POS?.Classification == POS.Adverb_Question.Classification) // (all questions have the same classification text)
            return _AddQuestion(word);

        return _CheckConjunction(word)._Add(word);
    }

    _Add(word: DictionaryItem): ThoughtGraphNode {
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

    _requireSubject(): ThoughtGraphNode {
        var subject = FindTopFirst(POS.Group_Subject, true);
        if (subject != null)
            return subject;

        if (Root.IsQuestion)
            return Root.Attach(CreateSubjectGroupDictionaryItem()); // (the subject should come under the question, if one exists)
        else
            return Root.AttachAsParent(CreateSubjectGroupDictionaryItem());
    }

    _requireQuestion(): ThoughtGraphNode {
        var qgroup = FindTopFirst(POS.Group_Question, true);
        if (qgroup != null)
            return qgroup;
        return _requireSubject().AttachAsParent(CreateQuestiontGroupDictionaryItem());
    }

    _requireAttribute(): ThoughtGraphNode {
        var attrGroup = FindBottomFirst(POS.Group_Attribute, true); // (usually attributes are in the children, so search there first)
        if (attrGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var subject = _requireSubject(); // (first find the subject within this area)
            attrGroup = subject.Attach(CreateAttributeGroupDictionaryItem());
        }
        return attrGroup;
    }

    _requireModifier(): ThoughtGraphNode {
        var modGroup = this.FindBottomFirst(POS.Group_Modifier, true); // (usually attributes are in the children, so search there first)
        if (modGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var verb = this.FindBottomFirst(POS.Verb, true); // (first find the subject within this area)
            modGroup = (verb ?? this).Attach(CreateModifierGroupDictionaryItem());
        }
        return modGroup;
    }

    // --------------------------------------------------------------------------------------------------------------------

    _AddUnkown(text: DictionaryItem): ThoughtGraphNode {
        return Attach(text); // (in the case that we don't know what to do with this we just attach it and stay on the current node)
        //? return this;
    }

    _AddQuestion(q: DictionaryItem): ThoughtGraphNode {
        var qnode = this._requireQuestion();
        var newNode = new ThoughtGraphNode(q);
        return qnode.AddSibling(newNode); // (the current node context is now the question group, not a single subject [noun])
    }

    _AddDeterminer(det: DictionaryItem): ThoughtGraphNode {
        var subject = this._requireSubject();
        subject.Attach(det);
        return subject;
    }

    _AddSubjectAssociation(assoc: DictionaryItem): ThoughtGraphNode {
        var subject = this._requireSubject();
        return subject.Attach(assoc); // (the "is" or "are" will act as a connector, and will become the new 'current' node [by returning it]; this also creates a barrier [all associations are subject ])
    }

    _AddIs(isOrAre: DictionaryItem): ThoughtGraphNode { return _AddSubjectAssociation(isOrAre); }
    _AddPreposition(prepos: DictionaryItem): ThoughtGraphNode { return _AddSubjectAssociation(prepos); }

    _AddConjunction(conj: DictionaryItem): ThoughtGraphNode  // TODO: Need to make sure "&" is also considered somehow.
    {
        // ... if a duplicate, ignore and stay here ...
        if (this.Word == conj) return this;
        // ... certain conjunctions will tag on the end of the current node and then returned as current until we know what comes next ...
        if (conj == "and" || conj == "or")
            return this.Attach(conj);
        else
            return this._requireSubject().Attach(conj); // (all others we will attach to the subject right away)
    }

    _CheckConjunction(nextWord: DictionaryItem): ThoughtGraphNode // (repositions the conjunction based on the next word; returns where to add the next word)
    {
        if (!this.IsConjunction) return this;

        if (this.parent?.GeneralPOS == nextWord.POS) {
            // TODO: Convert to a group to combine them 
            // TOTEST: john is red and blue

            var parent = this.parent;
            this.Detach(); // (abandon this and - it's implied by the sibling list)
            return parent;
        }

        if (nextWord.POS?.Classification == POS.Adverb_Question.Classification) {
            var q = this._requireQuestion();
            this.Detach();
            return q;
        }

        // ... default to the subject as the connecting point ...

        var subj = this._requireSubject();
        this.Detach();
        return subj;
    }

    _AddNoun(noun: DictionaryItem): ThoughtGraphNode {
        var subject = this._requireSubject();
        var newNode = new ThoughtGraphNode(noun);
        return subject.AddSibling(newNode); // (the new noun node now becomes the new current node)
    }

    _AddPronoun(pronoun: DictionaryItem): ThoughtGraphNode {
        var subject = this._requireSubject();
        var newNode = new ThoughtGraphNode(pronoun);
        return subject.AddSibling(newNode); // (the new noun node now becomes the new current node)
    }

    // --------------------------------------------------------------------------------------------------------------------

    ///// <summary>
    /////     Converts the current node to a group, if not already a group, by making sure the parent is a group node, and then
    /////     adds the given node.
    ///// </summary>
    ///// <param name="groupPOS"> The group position. </param>
    ///// <param name="newNode"> . </param>
    ///// <returns> The current node, or if converted to a group, the group node. </returns>
    //x public ThoughtGraphNode AddToGroup(PartOfSpeech groupPOS, ThoughtGraphNode newNode)
    //{
    //    if (IsGroup)
    //        return Attach(newNode);
    //    else if (Parent?.IsGroup ?? false)
    //        return Parent.Attach(newNode);

    //    // ... no group found, so create one for this node ...

    //    var group = AttachAsParent(CreateTempDictionaryItem(groupPOS));
    //    group.Attach(this); // (subject now moved into a group; next we add the new noun to the group)
    //    group.Attach(newNode);
    //    return group;
    //}

    // --------------------------------------------------------------------------------------------------------------------

    /// <summary> Searches the parent nodes for a match to the given dictionary word item. </summary>
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
    /// <param name="depth"> (Optional) How many parents deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in parents. </returns>
    FindInParents(word: DictionaryItem, includeThis: boolean, includeSiblings: boolean, includeConjunctions: boolean, depth: number, exclude?: ThoughtGraphNode): ThoughtGraphNode;

    /// <summary>
    ///     Searches the parent nodes for a match to the given part of speech classification.
    ///     <para>Warning: Tense type and plurality is not considered.</para>
    /// </summary>
    /// <param name="pos"> The type of node (word classification) to search for. </param>
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
    /// <param name="depth"> (Optional) How many parents deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in parents. </returns>
    FindInParents(pos: PartOfSpeech, includeThis: boolean, includeSiblings: boolean, includeConjunctions: boolean, depth: number, exclude?: ThoughtGraphNode): ThoughtGraphNode;

    FindInParents(item: PartOfSpeech | DictionaryItem, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1, exclude: ThoughtGraphNode = null): ThoughtGraphNode {
        if (item instanceof DictionaryItem) {
            if (exclude == this) return null;

            if (includeThis && this.Word.equals(item))
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.IsConjunction) return null; // (this is a subject area barrier)

            return (depth < 0 || depth > 0) ? this.parent?.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
        } else {
            if (exclude == this) return null;

            if (includeThis && this.#_GeneralPOS.equals(item))
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.IsConjunction) return null; // (this is a subject area barrier)

            return (depth < 0 || depth > 0) ? this.parent?.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
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
    FindInChildren(word: DictionaryItem, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number, exclude?: ThoughtGraphNode): ThoughtGraphNode;

    /// <summary>
    ///     Searches the child nodes for a match to the given part of speech classification.
    ///     <para>Warning: Tense type and plurality is not considered.</para>
    /// </summary>
    /// <param name="pos"> The type of node (word classification) to search for. </param>
    /// <param name="includeThis"> (Optional) If true, then the current instance is included (default is false). </param>
    /// <param name="depth"> (Optional) How many children deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in children. </returns>
    FindInChildren(pos: PartOfSpeech, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number, exclude?: ThoughtGraphNode): ThoughtGraphNode;

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
    FindInChildren(item: DictionaryItem | PartOfSpeech, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1, exclude: ThoughtGraphNode = null): ThoughtGraphNode {
        if (item instanceof DictionaryItem) {
            if (exclude == this) return null;

            if (includeThis && this.Word == item)
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.IsConjunction) return null; // (this is a subject area barrier)

            if (depth < 0 || depth > 0)
                for (var i = 0, n = this.children?.length ?? 0; i < n; ++i) {
                    var child = this.children[i];
                    var result = child.FindInChildren(item, true, includeSiblings, includeConjunctions, depth - 1, exclude);
                    if (result != null) return result;
                }

            return null;
        } else {
            if (exclude == this) return null;

            if (includeThis && this.#_GeneralPOS.equals(item))
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.IsConjunction) return null; // (this is a subject area barrier)

            if (depth < 0 || depth > 0)
                for (var i = 0, n = this.children?.length ?? 0; i < n; ++i) {
                    var child = this.children[i];
                    var result = child.FindInChildren(item, true, includeSiblings, includeConjunctions, depth - 1, exclude);
                    if (result != null) return result;
                }

            return null;
        }
    }

    /// <summary>
    ///     Searches the parent AND child nodes (in that order) for a match to the given part of speech classification.
    ///     <para>Warning: Tense type and plurality is not considered.</para>
    /// </summary>
    /// <param name="generalPOS"> The type of node (word classification) to search for. </param>
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
    /// <param name="depth"> (Optional) How many parents/children deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in children. </returns>
    FindTopFirst(generalPOS: PartOfSpeech, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number): ThoughtGraphNode;

    /// <summary> Searches the parent AND child nodes (in that order) for a match to the given dictionary word item. </summary>
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
    /// <param name="depth"> (Optional) How many parents/children deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in children. </returns>
    FindTopFirst(word: DictionaryItem, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number): ThoughtGraphNode;
    FindTopFirst(item: DictionaryItem | PartOfSpeech, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1): ThoughtGraphNode {
        if (item instanceof DictionaryItem)
            return this.FindInParents(item, includeThis, includeSiblings, includeConjunctions, depth)  // (search up to root first)
                ?? this.root.FindInChildren(item, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
        else
            return this.FindInParents(item, includeThis, includeSiblings, includeConjunctions, depth)  // (search up to root first)
                ?? this.root.FindInChildren(item, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
    }


    /// <summary> Searches the child nodes AND parent (in that order) for a match to the given dictionary word item. </summary>
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
    /// <param name="depth"> (Optional) How many parents/children deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in children. </returns>
    FindBottomFirst(word: DictionaryItem, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number): ThoughtGraphNode;

    /// <summary>
    ///     Searches the child nodes AND parent (in that order) for a match to the given part of speech classification.
    ///     <para>Warning: Tense type and plurality is not considered.</para>
    /// </summary>
    /// <param name="generalPOS"> The type of node (word classification) to search for. </param>
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
    /// <param name="depth"> (Optional) How many parents/children deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in children. </returns>
    FindBottomFirst(generalPOS: PartOfSpeech, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number): ThoughtGraphNode;

    FindBottomFirst(item: DictionaryItem | PartOfSpeech, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1): ThoughtGraphNode {
        if (item instanceof DictionaryItem)
            return this.FindInChildren(item, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
                ?? this.root.FindInChildren(item, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
        else
            return this.FindInChildren(item, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
                ?? this.root.FindInChildren(item, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
    }


    // --------------------------------------------------------------------------------------------------------------------
}
