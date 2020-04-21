"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __parent;
Object.defineProperty(exports, "__esModule", { value: true });
/// <summary>
/// A multi-node is a node that has multiple children and siblings.
/// Sibling nodes are use mainly for grouping together the same types of nodes.
/// </summary>
/// <typeparam name="T"></typeparam>
class MultiNode {
    constructor() {
        // --------------------------------------------------------------------------------------------------------------------
        __parent.set(this, void 0);
        // --------------------------------------------------------------------------------------------------------------------
    }
    /// <summary> The parent nodes. </summary>
    get parent() { return __classPrivateFieldGet(this, __parent); }
    set _parent(value) { __classPrivateFieldSet(this, __parent, value); }
    get HasSiblings() { var _a; return ((_a = this.siblings) === null || _a === void 0 ? void 0 : _a.length) > 0; }
    /// <summary>
    /// Returns the node at the top left most side of the parent hierarchy.
    /// <para>Note: If the current node is already the top left most, then itself is returned. </para>
    /// </summary>
    get root() { var _a, _b; return (_b = (_a = __classPrivateFieldGet(this, __parent)) === null || _a === void 0 ? void 0 : _a.root) !== null && _b !== void 0 ? _b : this; }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary> Removes the given node from the children (if exists) then returns the node. </summary>
    /// <param name="node"> . </param>
    /// <param name="includeParent">
    ///     (Optional) True to also remove this parent from the given child node (the default is true).
    /// </param>
    /// <returns> Returns the type 'T' instance. </returns>
    RemoveChild(node, includeParent = true) {
        var _a, _b;
        if ((_b = (_a = this.children) === null || _a === void 0 ? void 0 : _a.remove(node)) !== null && _b !== void 0 ? _b : false)
            if (includeParent)
                node.RemoveParent(false);
        return node;
    }
    /// <summary> Removes the given node from the children (if exists) then returns the node. </summary>
    /// <param name="node"> . </param>
    /// <param name="includeParent"> (Optional) True to also remove this parent from the given child node. </param>
    /// <returns> Returns the type 'T' instance. </returns>
    RemoveSibling(node, includeParent = true) {
        var _a, _b;
        if ((_b = (_a = this.siblings) === null || _a === void 0 ? void 0 : _a.remove(node)) !== null && _b !== void 0 ? _b : false)
            if (includeParent)
                node.Detach();
        return node;
    }
    /// <summary> Removes the given parent node from this child node (if exists), then returns this node. </summary>
    /// <param name="includeChild">
    ///     (Optional) True to also removed this child from the parent's children list (the default is true). If false, then the
    ///     node is detached locally only.
    /// </param>
    /// <returns> Returns the type 'T' instance. </returns>
    RemoveParent(includeChild = true) {
        if (__classPrivateFieldGet(this, __parent) != null) {
            if (includeChild)
                __classPrivateFieldGet(this, __parent).RemoveChild(this, false);
            __classPrivateFieldSet(this, __parent, null);
        }
        return this;
    }
    /// <summary> Removes and returns all the child nodes. </summary>
    /// <returns> A List&lt;T&gt; </returns>
    RemoveChildren() {
        var _a, _b;
        var removedItems = [];
        for (var i = ((_b = (_a = this.children) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - 1; i >= 0; --i)
            removedItems.push(this.RemoveChild(this.children[i]));
        return removedItems;
    }
    /// <summary>
    ///     Completely removes the given node from the parent (if any) then returns the node. This involves removing from either
    ///     the child or sibling parent lists.
    /// </summary>
    /// <returns> Returns the type 'T' instance. </returns>
    Detach() {
        var _a, _b;
        (_a = __classPrivateFieldGet(this, __parent)) === null || _a === void 0 ? void 0 : _a.RemoveChild(this, false);
        (_b = __classPrivateFieldGet(this, __parent)) === null || _b === void 0 ? void 0 : _b.RemoveSibling(this, false);
        __classPrivateFieldSet(this, __parent, null);
        return this;
    }
    /// <summary>
    ///     Attaches the node as a child to this node. Note: This forces an attachment.  No check is performed, so it is assumed
    ///     the caller knows what they are doing.
    /// </summary>
    /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
    /// <param name="node"> . </param>
    /// <returns> A Node. </returns>
    Attach(node) {
        if (node !== null && node !== void 0 ? node : true)
            throw DS.Exception.argumentUndefinedOrNull('MultiNode.attach()', 'node');
        if (node.parent != null && node.parent != this)
            node.Detach();
        if (this.children == null)
            this.children = [node];
        else if (!this.children.includes(node))
            this.children.push(node);
        __classPrivateFieldSet(node, __parent, this);
        return node;
    }
    /// <summary>
    ///     Attaches the node as a child to this node. Note: This forces an attachment.  No check is performed, so it is assumed
    ///     the caller knows what they are doing.
    /// </summary>
    /// <param name="node"> . </param>
    /// <returns> A Node. </returns>
    AddSibling(node) {
        if (node == null)
            throw DS.Exception.argumentUndefinedOrNull('MultiNode.addSibling()', 'node');
        if (__classPrivateFieldGet(node, __parent) != null && __classPrivateFieldGet(node, __parent) != this)
            node.Detach();
        if (this.siblings == null)
            this.siblings = [node];
        else if (!this.siblings.includes(node))
            this.siblings.push(node);
        __classPrivateFieldSet(node, __parent, this);
        return node;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary> Replaces the current node with the given node and returns the given node. </summary>
    /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
    /// <param name="node"> . </param>
    /// <returns> Returns the type 'T' instance. </returns>
    Replace(node) {
        var _a, _b, _c;
        if (node == null)
            throw DS.Exception.argumentUndefinedOrNull('MultiNode.replace()', 'node');
        node.Detach();
        // ... copy over current parent and children to the new node ...
        (_a = __classPrivateFieldGet(this, __parent)) === null || _a === void 0 ? void 0 : _a.Attach(node);
        for (var i = 0, n = (_c = (_b = this.children) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0; i < n; ++i)
            node.Attach(this.children[i]);
        // ... detach the current node from its parents ...
        this.Detach();
        this.RemoveChildren();
        return node;
    }
}
exports.default = MultiNode;
__parent = new WeakMap();
//# sourceMappingURL=Node.js.map