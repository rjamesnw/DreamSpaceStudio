﻿/**
 *  A multi-node is a node that has multiple children and siblings.
 *  Sibling nodes are use mainly for grouping together the same types of nodes.
*/
/// <typeparam name="T"></typeparam>
export default class MultiNode<T extends MultiNode<any>>
{
    // --------------------------------------------------------------------------------------------------------------------

    /** The parent nodes. */
    get parent(): T { return this._parent; }
    protected _parent: T;

    /** The child nodes. */
    children: T[];

    /**
     *      Sibling nodes are nodes grouped together under a single node. This allows the node to be a group node and act like
     *      an entity in itself (for instance, a group node that tracks a noun and a pronoun). This allows the children to
     *      remain acting more like associations to extended data related to the group.
    */
    siblings: T[];

    get hasSiblings(): boolean { return this.siblings?.length > 0; }

    /**
     *  Returns the node at the top left most side of the parent hierarchy.
     *  <para>Note: If the current node is already the top left most, then itself is returned. </para>
    */
    get root(): T { return this._parent?.root ?? this; }

    // --------------------------------------------------------------------------------------------------------------------

    /** Removes the given node from the children (if exists) then returns the node. */
    /// <param name="node"> . </param>
    /// <param name="includeParent">
    ///     (Optional) True to also remove this parent from the given child node (the default is true).
    /// </param>
    /// <returns> Returns the type 'T' instance. </returns>
    RemoveChild(node: T, includeParent = true): T {
        if (this.children?.remove(node) ?? false)
            if (includeParent)
                node.RemoveParent(false);
        return node;
    }

    /** Removes the given node from the children (if exists) then returns the node. */
    /// <param name="node"> . </param>
    /// <param name="includeParent"> (Optional) True to also remove this parent from the given child node. </param>
    /// <returns> Returns the type 'T' instance. </returns>
    RemoveSibling(node: T, includeParent = true): T {
        if (this.siblings?.remove(node) ?? false)
            if (includeParent)
                node.Detach();
        return node;
    }

    /** Removes the given parent node from this child node (if exists), then returns this node. */
    /// <param name="includeChild">
    ///     (Optional) True to also removed this child from the parent's children list (the default is true). If false, then the
    ///     node is detached locally only.
    /// </param>
    /// <returns> Returns the type 'T' instance. </returns>
    RemoveParent(includeChild = true): this {
        if (this._parent != null) {
            if (includeChild)
                this._parent.RemoveChild(this, false);
            this._parent = null;
        }
        return this;
    }

    /** Removes and returns all the child nodes. */
    /// <returns> A List&lt;T&gt; </returns>
    RemoveChildren(): T[] {
        var removedItems: T[] = [];

        for (var i = (this.children?.length ?? 0) - 1; i >= 0; --i)
            removedItems.push(this.RemoveChild(this.children[i]));

        return removedItems;
    }

    /**
     *      Completely removes the given node from the parent (if any) then returns the node. This involves removing from either
     *      the child or sibling parent lists.
    */
    /// <returns> Returns the type 'T' instance. </returns>
    Detach(): this {
        this._parent?.RemoveChild(this, false);
        this._parent?.RemoveSibling(this, false);
        this._parent = null;
        return this;
    }

    /**
     *      Attaches the node as a child to this node. Note: This forces an attachment.  No check is performed, so it is assumed
     *      the caller knows what they are doing.
    */
    /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
    /// <param name="node"> . </param>
    /// <returns> A Node. </returns>
    attach(node: T): T {
        if (node ?? true)
            throw DS.Exception.argumentUndefinedOrNull('MultiNode.attach()', 'node');

        if (node.parent != null && node.parent != this)
            node.Detach();

        if (this.children == null)
            this.children = [node];
        else if (!this.children.includes(node))
            this.children.push(node);

        node._parent = this;

        return node;
    }

    /**
     *      Attaches the node as a child to this node. Note: This forces an attachment.  No check is performed, so it is assumed
     *      the caller knows what they are doing.
    */
    /// <param name="node"> . </param>
    /// <returns> A Node. </returns>
    AddSibling(node: T): T {
        if (node == null)
            throw DS.Exception.argumentUndefinedOrNull('MultiNode.addSibling()', 'node');

        if (node._parent != null && node._parent != this)
            node.Detach();

        if (this.siblings == null)
            this.siblings = [node];
        else if (!this.siblings.includes(node))
            this.siblings.push(node);

        node._parent = this;

        return node;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Replaces the current node with the given node and returns the given node. */
    /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
    /// <param name="node"> . </param>
    /// <returns> Returns the type 'T' instance. </returns>
    Replace(node: T): T {
        if (node == null)
            throw DS.Exception.argumentUndefinedOrNull('MultiNode.replace()', 'node');

        node.Detach();

        // ... copy over current parent and children to the new node ...

        this._parent?.attach(node);

        for (var i = 0, n = this.children?.length ?? 0; i < n; ++i)
            node.attach(this.children[i]);

        // ... detach the current node from its parents ...

        this.Detach();
        this.RemoveChildren();

        return node;
    }

    // --------------------------------------------------------------------------------------------------------------------
}