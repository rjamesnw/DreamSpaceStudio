import MultiNode from "./Node";
import TextPart from "../core/TextPart";
import POS, { PartOfSpeech } from "../core/POS";
import DictionaryItem from "../core/DictionaryItem";
import GroupContext from "../contexts/GroupContext";

export default class ThoughtGraphNode extends MultiNode<ThoughtGraphNode>
{
    // --------------------------------------------------------------------------------------------------------------------

    static CreateTempDictionaryItem(pos: PartOfSpeech, part: TextPart = null) { return new DictionaryItem(null, part, pos); }
    static CreateSubjectGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Subject, part); }
    static CreateQuestiontGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Question, part); }
    static CreateAttributeGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Attribute, part); }
    static CreateModifierGroupDictionaryItem(part: TextPart = null) { return this.CreateTempDictionaryItem(POS.Group_Modifier, part); }
    static CreateSubjectGroup(part: TextPart = null) { return new ThoughtGraphNode(this.CreateSubjectGroupDictionaryItem(part)); }

    // --------------------------------------------------------------------------------------------------------------------

    get root(): ThoughtGraphNode { return super.root; }

    /**
     * Gets the context for the subject related to this node.
     * When a thought graph is being analyzed a context group is first made for the subject node (which is required in all graphs). 
     * The whole graph is then cross-referenced with all registered concepts. Each concept can add new context objects to expand the
     * context group.  Typically this means the top level group contains the main subjects, and 
     */
    get context(): GroupContext { return this.findTopFirst(POS.Group_Subject, true)?._context; }
    private _context: GroupContext;

    /**
     *  A word (or symbol or other text) that is the subject of this node in the graph.
     *  This is set to the detected "word" in the user's request.
    */
    word: DictionaryItem;

    /**
     *      The part of speech that this node classifies under.  This is a generalization that may be different than the
     *      associated word (such as for groups).
    */
    get generalPOS(): PartOfSpeech { return this.#_generalPOS ?? this.word?.pos; }
    set generalPOS(value: PartOfSpeech) { this.#_generalPOS = value; }
    #_generalPOS: PartOfSpeech;

    get isEmpty() { return (!this.word || this.word.textPart.equals(null)) && !this.isGroup; }

    get isGroup() { return this.generalPOS?.classOf(POS.Group) ?? false; }

    get isQuestion() { return this.generalPOS?.classification == POS.Adverb_Question.classification; }// (all classifications for question have the same name)

    get isSubject() { return this.generalPOS == POS.Group_Subject; }

    get isAttribute() { return this.generalPOS == POS.Group_Attribute; }

    get isModifier() { return this.generalPOS == POS.Group_Modifier; }

    /**
     * Searches do no cross conjunction barriers (such as when "and" joins two parts).
     * @returns
     */
    get isConjunction() { return this.generalPOS == POS.Conjunction; }

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
        if (this.#_generalPOS.equals(POS.Verb)) return true;
        if (this.#_generalPOS.equals(POS.Preposition)) return true;
        if (this.#_generalPOS.equals(POS.Conjunction)) return true;
        return false;
    }

    // --------------------------------------------------------------------------------------------------------------------

    constructor(word: DictionaryItem, pos: PartOfSpeech = null) {
        super();
        this.word = word;
        this.#_generalPOS = this.generalize(pos ?? this.word?.pos);
    }

    /**
     * Generalizes similar parts of speech (such as grouping all question types into one idea: question).
     * @param {PartOfSpeech} pos
     * @returns
     */
    generalize(pos: PartOfSpeech): PartOfSpeech {
        if (pos == null) return null;
        if (pos?.classification == POS.Adverb_Question.classification)
            return POS.Group_Question;
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
    attach(word: DictionaryItem): ThoughtGraphNode {
        return super.attach(new ThoughtGraphNode(word));
    }

    /**
     *      Replaces this node with the given node and attaches the current node as a child to the new parent node. Note: This
     *      forces an attachment.  No check is performed, so it is assumed the caller knows what they are doing.
    */
    /// <param name="word"> . </param>
    /// <returns> The new <see cref="ThoughtGraphNode"/> created. </returns>
    attachAsParent(word: DictionaryItem): ThoughtGraphNode {
        // ... detach the current node from its parents, if any ...

        var parent = this.parent; // (save the parent reference before we lose it)
        this.Detach();

        var newNode = new ThoughtGraphNode(word)
        {
            // ... copy over the parent to the new node ...
            this._parent = parent
        };

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
    Add(word: DictionaryItem): ThoughtGraphNode {
        // ... check the question FIRST, since we are ignoring the POS class here ...
        if (word.pos?.Classification == POS.Adverb_Question.classification) // (all questions have the same classification text)
            return this._AddQuestion(word);

        return this._CheckConjunction(word)._Add(word);
    }

    _Add(word: DictionaryItem): ThoughtGraphNode {
        if (word.classOf(POS.Determiner))
            return this._AddDeterminer(word);

        if (word.classOf(POS.Noun))
            return this._AddNoun(word);

        if (word.classOf(POS.Pronoun))
            return this._AddPronoun(word);

        if (word.classOf(POS.Conjunction))
            return this._AddConjunction(word);

        if (word.classOf(POS.Preposition))
            return this._AddPreposition(word);

        if (word.classOf(POS.Verb_Is))
            return this._AddIs(word); // (or 'are')

        return this._AddUnkown(word);
    }

    // --------------------------------------------------------------------------------------------------------------------

    _requireSubject(): ThoughtGraphNode {
        var subject = this.findTopFirst(POS.Group_Subject, true);
        if (subject != null)
            return subject;

        if (this.root.isQuestion)
            return this.root.attach(ThoughtGraphNode.CreateSubjectGroupDictionaryItem()); // (the subject should come under the question, if one exists)
        else
            return this.root.attachAsParent(ThoughtGraphNode.CreateSubjectGroupDictionaryItem());
    }

    _requireQuestion(): ThoughtGraphNode {
        var qgroup = this.findTopFirst(POS.Group_Question, true);
        if (qgroup != null)
            return qgroup;
        return this._requireSubject().attachAsParent(ThoughtGraphNode.CreateQuestiontGroupDictionaryItem());
    }

    _requireAttribute(): ThoughtGraphNode {
        var attrGroup = this.FindBottomFirst(POS.Group_Attribute, true); // (usually attributes are in the children, so search there first)
        if (attrGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var subject = this._requireSubject(); // (first find the subject within this area)
            attrGroup = subject.attach(ThoughtGraphNode.CreateAttributeGroupDictionaryItem());
        }
        return attrGroup;
    }

    _requireModifier(): ThoughtGraphNode {
        var modGroup = this.FindBottomFirst(POS.Group_Modifier, true); // (usually attributes are in the children, so search there first)
        if (modGroup == null) {
            // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
            var verb = this.FindBottomFirst(POS.Verb, true); // (first find the subject within this area)
            modGroup = (verb ?? this).attach(ThoughtGraphNode.CreateModifierGroupDictionaryItem());
        }
        return modGroup;
    }

    // --------------------------------------------------------------------------------------------------------------------

    _AddUnkown(text: DictionaryItem): ThoughtGraphNode {
        return this.attach(text); // (in the case that we don't know what to do with this we just attach it and stay on the current node)
        //? return this;
    }

    _AddQuestion(q: DictionaryItem): ThoughtGraphNode {
        var qnode = this._requireQuestion();
        var newNode = new ThoughtGraphNode(q);
        return qnode.AddSibling(newNode); // (the current node context is now the question group, not a single subject [noun])
    }

    _AddDeterminer(det: DictionaryItem): ThoughtGraphNode {
        var subject = this._requireSubject();
        subject.attach(det);
        return subject;
    }

    _AddSubjectAssociation(assoc: DictionaryItem): ThoughtGraphNode {
        var subject = this._requireSubject();
        return subject.attach(assoc); // (the "is" or "are" will act as a connector, and will become the new 'current' node [by returning it]; this also creates a barrier [all associations are subject ])
    }

    _AddIs(isOrAre: DictionaryItem): ThoughtGraphNode { return this._AddSubjectAssociation(isOrAre); }
    _AddPreposition(prepos: DictionaryItem): ThoughtGraphNode { return this._AddSubjectAssociation(prepos); }

    _AddConjunction(conj: DictionaryItem): ThoughtGraphNode  // TODO: Need to make sure "&" is also considered somehow.
    {
        // ... if a duplicate, ignore and stay here ...
        if (this.word.equals(conj)) return this;
        // ... certain conjunctions will tag on the end of the current node and then returned as current until we know what comes next ...
        if (conj.equals("and") || conj.equals("or"))
            return this.attach(conj);
        else
            return this._requireSubject().attach(conj); // (all others we will attach to the subject right away)
    }

    _CheckConjunction(nextWord: DictionaryItem): ThoughtGraphNode // (repositions the conjunction based on the next word; returns where to add the next word)
    {
        if (!this.isConjunction) return this;

        if (this.parent?.generalPOS?.equals(nextWord.pos)) {
            // TODO: Convert to a group to combine them 
            // TOTEST: john is red and blue

            var parent = this.parent;
            this.Detach(); // (abandon this and - it's implied by the sibling list)
            return parent;
        }

        if (nextWord.pos?.classification == POS.Adverb_Question.classification) {
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

    ///**
    * //     Converts the current node to a group, if not already a group, by making sure the parent is a group node, and then
        // *      adds the given node.
        //*/
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

        /** Searches the parent nodes for a match to the given dictionary word item. */
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

    /**
     *      Searches the parent nodes for a match to the given part of speech classification.
     *      <para>Warning: Tense type and plurality is not considered.</para>
    */
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

            if (includeThis && this.word.equals(item))
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.isConjunction) return null; // (this is a subject area barrier)

            return (depth < 0 || depth > 0) ? this.parent?.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
        } else {
            if (exclude == this) return null;

            if (includeThis && this.#_generalPOS?.equals(item))
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInParents(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.isConjunction) return null; // (this is a subject area barrier)

            return (depth < 0 || depth > 0) ? this.parent?.FindInParents(item, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
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
    FindInChildren(word: DictionaryItem, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number, exclude?: ThoughtGraphNode): ThoughtGraphNode;

    /**
     *      Searches the child nodes for a match to the given part of speech classification.
     *      <para>Warning: Tense type and plurality is not considered.</para>
    */
    /// <param name="pos"> The type of node (word classification) to search for. </param>
    /// <param name="includeThis"> (Optional) If true, then the current instance is included (default is false). </param>
    /// <param name="depth"> (Optional) How many children deep to run the search. Enabled if value is > 0. </param>
    /// <returns> The found in children. </returns>
    FindInChildren(pos: PartOfSpeech, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number, exclude?: ThoughtGraphNode): ThoughtGraphNode;

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
    FindInChildren(item: DictionaryItem | PartOfSpeech, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1, exclude: ThoughtGraphNode = null): ThoughtGraphNode {
        if (item instanceof DictionaryItem) {
            if (exclude == this) return null;

            if (includeThis && this.word?.equals(item))
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.isConjunction) return null; // (this is a subject area barrier)

            if (depth < 0 || depth > 0)
                for (var i = 0, n = this.children?.length ?? 0; i < n; ++i) {
                    var child = this.children[i];
                    var result = child.FindInChildren(item, true, includeSiblings, includeConjunctions, depth - 1, exclude);
                    if (result != null) return result;
                }

            return null;
        } else {
            if (exclude == this) return null;

            if (includeThis && this.#_generalPOS?.equals(item))
                return this;

            if (includeSiblings)
                for (var i = 0, n = this.siblings?.length ?? 0; i < n; ++i)
                    this.siblings[i].FindInChildren(item, true, true, includeConjunctions, 0, exclude);

            if (!includeConjunctions && this.isConjunction) return null; // (this is a subject area barrier)

            if (depth < 0 || depth > 0)
                for (var i = 0, n = this.children?.length ?? 0; i < n; ++i) {
                    var child = this.children[i];
                    var result = child.FindInChildren(item, true, includeSiblings, includeConjunctions, depth - 1, exclude);
                    if (result != null) return result;
                }

            return null;
        }
    }

    /**
     *      Searches the parent AND child nodes (in that order) for a match to the given part of speech classification.
     *      <para>Warning: Tense type and plurality is not considered.</para>
    */
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
    findTopFirst(generalPOS: PartOfSpeech, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number): ThoughtGraphNode;

    /** Searches the parent AND child nodes (in that order) for a match to the given dictionary word item. */
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
    findTopFirst(word: DictionaryItem, includeThis?: boolean, includeSiblings?: boolean, includeConjunctions?: boolean, depth?: number): ThoughtGraphNode;
    findTopFirst(item: DictionaryItem | PartOfSpeech, includeThis = false, includeSiblings = false, includeConjunctions = false, depth = -1): ThoughtGraphNode {
        if (item instanceof DictionaryItem)
            return this.FindInParents(item, includeThis, includeSiblings, includeConjunctions, depth)  // (search up to root first)
                ?? this.root.FindInChildren(item, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
        else
            return this.FindInParents(item, includeThis, includeSiblings, includeConjunctions, depth)  // (search up to root first)
                ?? this.root.FindInChildren(item, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
    }


    /** Searches the child nodes AND parent (in that order) for a match to the given dictionary word item. */
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

    /**
     *      Searches the child nodes AND parent (in that order) for a match to the given part of speech classification.
     *      <para>Warning: Tense type and plurality is not considered.</para>
    */
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
