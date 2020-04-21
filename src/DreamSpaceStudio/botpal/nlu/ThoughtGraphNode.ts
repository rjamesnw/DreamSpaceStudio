import MultiNode from "./Node";

export default class ThoughtGraphNode extends MultiNode<ThoughtGraphNode>
{
    // --------------------------------------------------------------------------------------------------------------------

    static DictionaryItem CreateTempDictionaryItem(PartOfSpeech pos, TextPart part = null) => new DictionaryItem(null, part, pos);
         static DictionaryItem CreateSubjectGroupDictionaryItem(TextPart part = null) => CreateTempDictionaryItem(POS.Group_Subject, part);
         static DictionaryItem CreateQuestiontGroupDictionaryItem(TextPart part = null) => CreateTempDictionaryItem(POS.Group_Question, part);
         static DictionaryItem CreateAttributeGroupDictionaryItem(TextPart part = null) => CreateTempDictionaryItem(POS.Group_Attribute, part);
         static DictionaryItem CreateModifierGroupDictionaryItem(TextPart part = null) => CreateTempDictionaryItem(POS.Group_Modifier, part);
         static ThoughtGraphNode CreateSubjectGroup(TextPart part = null) => new ThoughtGraphNode(CreateSubjectGroupDictionaryItem(part));

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
get GeneralPOS(): PartOfSpeech { return this.#_GeneralPOS ?? Word?.POS; }
set GeneralPOS(value: PartOfSpeech) { this.#_GeneralPOS = value; }
        #_GeneralPOS: PartOfSpeech;

        public bool IsEmpty => Word?.TextPart == null && !IsGroup;

        public bool IsGroup => GeneralPOS?.ClassOf(POS.Group) ?? false;

        public bool IsQuestion => GeneralPOS?.Classification == POS.Adverb_Question.Classification; // (all classifications for question have the same name)

        public bool IsSubject => GeneralPOS == POS.Group_Subject;

        public bool IsAttribute => GeneralPOS == POS.Group_Attribute;

        public bool IsModifier => GeneralPOS == POS.Group_Modifier;

        /// <summary>
        /// Searches do no cross conjunction barriers (such as when "and" joins two parts).
        /// </summary>
        public bool IsConjunction => GeneralPOS == POS.Conjunction;

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
        public bool IsAssociation
{
    get
    {
        if (GeneralPOS == POS.Verb) return true;
        if (GeneralPOS == POS.Preposition) return true;
        if (GeneralPOS == POS.Conjunction) return true;
        return false;
    }
}

        // --------------------------------------------------------------------------------------------------------------------

        public ThoughtGraphNode(DictionaryItem word, PartOfSpeech pos = null)
{
    Word = word;
    _GeneralPOS = Generalize(pos ?? Word?.POS);
}

        /// <summary>
        /// Generalizes similar parts of speech (such as grouping all question types into one idea: question).
        /// </summary>
        /// <param name="pos"></param>
        /// <returns></returns>
        public static PartOfSpeech Generalize(PartOfSpeech pos)
{
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
        public ThoughtGraphNode Attach(DictionaryItem word)
{
    return Attach(new ThoughtGraphNode(word));
}

        /// <summary>
        ///     Replaces this node with the given node and attaches the current node as a child to the new parent node. Note: This
        ///     forces an attachment.  No check is performed, so it is assumed the caller knows what they are doing.
        /// </summary>
        /// <param name="word"> . </param>
        /// <returns> The new <see cref="ThoughtGraphNode"/> created. </returns>
        public ThoughtGraphNode AttachAsParent(DictionaryItem word)
{
    // ... detach the current node from its parents, if any ...

    var parent = Parent; // (save the parent reference before we lose it)
    Detach();

    var newNode = new ThoughtGraphNode(word)
    {
        // ... copy over the parent to the new node ...
        Parent = parent
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
        public ThoughtGraphNode Add(DictionaryItem word)
{
    // ... check the question FIRST, since we are ignoring the POS class here ...
    if (word.POS?.Classification == POS.Adverb_Question.Classification) // (all questions have the same classification text)
        return _AddQuestion(word);

    return _CheckConjunction(word)._Add(word);
}

ThoughtGraphNode _Add(DictionaryItem word)
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

ThoughtGraphNode _requireSubject()
{
    var subject = FindTopFirst(POS.Group_Subject, true);
    if (subject != null)
        return subject;

    if (Root.IsQuestion)
        return Root.Attach(CreateSubjectGroupDictionaryItem()); // (the subject should come under the question, if one exists)
    else
        return Root.AttachAsParent(CreateSubjectGroupDictionaryItem());
}

ThoughtGraphNode _requireQuestion()
{
    var qgroup = FindTopFirst(POS.Group_Question, true);
    if (qgroup != null)
        return qgroup;
    return _requireSubject().AttachAsParent(CreateQuestiontGroupDictionaryItem());
}

ThoughtGraphNode _requireAttribute()
{
    var attrGroup = FindBottomFirst(POS.Group_Attribute, true); // (usually attributes are in the children, so search there first)
    if (attrGroup == null) {
        // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
        var subject = _requireSubject(); // (first find the subject within this area)
        attrGroup = subject.Attach(CreateAttributeGroupDictionaryItem());
    }
    return attrGroup;
}

ThoughtGraphNode _requireModifier()
{
    var modGroup = FindBottomFirst(POS.Group_Modifier, true); // (usually attributes are in the children, so search there first)
    if (modGroup == null) {
        // ... this is the first attribute, so create a new group, attached to the current subject, and return it ...
        var verb = FindBottomFirst(POS.Verb, true); // (first find the subject within this area)
        modGroup = (verb ?? this).Attach(CreateModifierGroupDictionaryItem());
    }
    return modGroup;
}

// --------------------------------------------------------------------------------------------------------------------

ThoughtGraphNode _AddUnkown(DictionaryItem text)
{
    return Attach(text); // (in the case that we don't know what to do with this we just attach it and stay on the current node)
    //? return this;
}

ThoughtGraphNode _AddQuestion(DictionaryItem q)
{
    var qnode = _requireQuestion();
    var newNode = new ThoughtGraphNode(q);
    return qnode.AddSibling(newNode); // (the current node context is now the question group, not a single subject [noun])
}

ThoughtGraphNode _AddDeterminer(DictionaryItem det)
{
    var subject = _requireSubject();
    subject.Attach(det);
    return subject;
}

ThoughtGraphNode _AddSubjectAssociation(DictionaryItem assoc)
{
    var subject = _requireSubject();
    return subject.Attach(assoc); // (the "is" or "are" will act as a connector, and will become the new 'current' node [by returning it]; this also creates a barrier [all associations are subject ])
}

ThoughtGraphNode _AddIs(DictionaryItem isOrAre) => _AddSubjectAssociation(isOrAre);
ThoughtGraphNode _AddPreposition(DictionaryItem prepos) => _AddSubjectAssociation(prepos);

ThoughtGraphNode _AddConjunction(DictionaryItem conj) // TODO: Need to make sure "&" is also considered somehow.
{
    // ... if a duplicate, ignore and stay here ...
    if (Word == conj) return this;
    // ... certain conjunctions will tag on the end of the current node and then returned as current until we know what comes next ...
    if (conj == "and" || conj == "or")
        return Attach(conj);
    else
        return _requireSubject().Attach(conj); // (all others we will attach to the subject right away)
}

ThoughtGraphNode _CheckConjunction(DictionaryItem nextWord) // (repositions the conjunction based on the next word; returns where to add the next word)
{
    if (!IsConjunction) return this;

    if (Parent?.GeneralPOS == nextWord.POS) {
        // TODO: Convert to a group to combine them 
        // TOTEST: john is red and blue

        var parent = Parent;
        Detach(); // (abandon this and - it's implied by the sibling list)
        return parent;
    }

    if (nextWord.POS?.Classification == POS.Adverb_Question.Classification) {
        var q = _requireQuestion();
        Detach();
        return q;
    }

    // ... default to the subject as the connecting point ...

    var subj = _requireSubject();
    Detach();
    return subj;
}

ThoughtGraphNode _AddNoun(DictionaryItem noun)
{
    var subject = _requireSubject();
    var newNode = new ThoughtGraphNode(noun);
    return subject.AddSibling(newNode); // (the new noun node now becomes the new current node)
}

ThoughtGraphNode _AddPronoun(DictionaryItem pronoun)
{
    var subject = _requireSubject();
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
        public ThoughtGraphNode FindInParents(DictionaryItem word, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1, ThoughtGraphNode exclude = null)
{
    if (exclude == this) return null;

    if (includeThis && Word == word)
        return this;

    if (includeSiblings)
        for (int i = 0, n = Siblings?.Count ?? 0; i < n; ++i)
    Siblings[i].FindInParents(word, true, true, includeConjunctions, 0, exclude);

    if (!includeConjunctions && IsConjunction) return null; // (this is a subject area barrier)

    return (depth < 0 || depth > 0) ? Parent?.FindInParents(word, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
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
        public ThoughtGraphNode FindInChildren(DictionaryItem word, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1, ThoughtGraphNode exclude = null)
{
    if (exclude == this) return null;

    if (includeThis && Word == word)
        return this;

    if (includeSiblings)
        for (int i = 0, n = Siblings?.Count ?? 0; i < n; ++i)
    Siblings[i].FindInChildren(word, true, true, includeConjunctions, 0, exclude);

    if (!includeConjunctions && IsConjunction) return null; // (this is a subject area barrier)

    if (depth < 0 || depth > 0)
        for (int i = 0, n = Children?.Count ?? 0; i < n; ++i)
    {
        var child = Children[i];
        var result = child.FindInChildren(word, true, includeSiblings, includeConjunctions, depth - 1, exclude);
        if (result != null) return result;
    }

    return null;
}

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
        public ThoughtGraphNode FindTopFirst(DictionaryItem word, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1)
{
    return FindInParents(word, includeThis, includeSiblings, includeConjunctions, depth)  // (search up to root first)
        ?? Root.FindInChildren(word, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
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
        public ThoughtGraphNode FindBottomFirst(DictionaryItem word, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1)
{
    return FindInChildren(word, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
        ?? Root.FindInChildren(word, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
}

        // --------------------------------------------------------------------------------------------------------------------

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
        public ThoughtGraphNode FindInParents(PartOfSpeech pos, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1, ThoughtGraphNode exclude = null)
{
    if (exclude == this) return null;

    if (includeThis && GeneralPOS == pos)
        return this;

    if (includeSiblings)
        for (int i = 0, n = Siblings?.Count ?? 0; i < n; ++i)
    Siblings[i].FindInParents(pos, true, true, includeConjunctions, 0, exclude);

    if (!includeConjunctions && IsConjunction) return null; // (this is a subject area barrier)

    return (depth < 0 || depth > 0) ? Parent?.FindInParents(pos, true, includeSiblings, includeConjunctions, depth - 1, exclude) : null;
}

        /// <summary>
        ///     Searches the child nodes for a match to the given part of speech classification.
        ///     <para>Warning: Tense type and plurality is not considered.</para>
        /// </summary>
        /// <param name="pos"> The type of node (word classification) to search for. </param>
        /// <param name="includeThis"> (Optional) If true, then the current instance is included (default is false). </param>
        /// <param name="depth"> (Optional) How many children deep to run the search. Enabled if value is > 0. </param>
        /// <returns> The found in children. </returns>
        public ThoughtGraphNode FindInChildren(PartOfSpeech pos, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1, ThoughtGraphNode exclude = null)
{
    if (exclude == this) return null;

    if (includeThis && GeneralPOS == pos)
        return this;

    if (includeSiblings)
        for (int i = 0, n = Siblings?.Count ?? 0; i < n; ++i)
    Siblings[i].FindInChildren(pos, true, true, includeConjunctions, 0, exclude);

    if (!includeConjunctions && IsConjunction) return null; // (this is a subject area barrier)

    if (depth < 0 || depth > 0)
        for (int i = 0, n = Children?.Count ?? 0; i < n; ++i)
    {
        var child = Children[i];
        var result = child.FindInChildren(pos, true, includeSiblings, includeConjunctions, depth - 1, exclude);
        if (result != null) return result;
    }

    return null;
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
        public ThoughtGraphNode FindTopFirst(PartOfSpeech generalPOS, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1)
{
    return FindInParents(generalPOS, includeThis, includeSiblings, includeConjunctions, depth)  // (search up to root first)
        ?? Root.FindInChildren(generalPOS, false, includeSiblings, includeConjunctions, depth); // (search down from root next)
}

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
        public ThoughtGraphNode FindBottomFirst(PartOfSpeech generalPOS, bool includeThis = false, bool includeSiblings = false, bool includeConjunctions = false, int depth = -1)
{
    return FindInChildren(generalPOS, false, includeSiblings, includeConjunctions, depth) // (search under this node first)
        ?? Root.FindInChildren(generalPOS, includeThis, includeSiblings, includeConjunctions, depth, this); // (search from the root next, but don't search this node again)
}

        // --------------------------------------------------------------------------------------------------------------------
    }
