"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NodeIteratorBase {
    constructor(node) { this._node = this.root = node; }
}
exports.NodeIteratorBase = NodeIteratorBase;
;
class NodeIterator extends NodeIteratorBase {
    next() {
        if (this._node) {
            var result = { value: this._node, done: false };
            this._node = this._node.nextSibling;
            return result;
        }
        else
            return { done: true };
    }
    constructor(node) { super(node); }
}
exports.NodeIterator = NodeIterator;
;
class NodeKeyIterator extends NodeIteratorBase {
    constructor(node) {
        super(node);
        this._index = 0;
    }
    next() {
        if (this._node) {
            var result = { value: this._index++, done: false };
            this._node = this._node.nextSibling;
            return result;
        }
        else
            return { done: true };
    }
}
exports.NodeKeyIterator = NodeKeyIterator;
;
class NodeKeyValueIterator extends NodeIteratorBase {
    constructor(node) {
        super(node);
        this._index = 0;
    }
    next() {
        if (this._node) {
            var result = { value: [this._index++, this._node], done: false };
            this._node = this._node.nextSibling;
            return result;
        }
        else
            return { done: true };
    }
}
exports.NodeKeyValueIterator = NodeKeyValueIterator;
;
class NodeList {
    //private _firstNode: Node;
    //private _lastNode: Node;
    get length() { var count = 0, node = this._owner.firstChild; while (node) {
        node = node.nextSibling;
        ++count;
    } return count; }
    constructor(owner, firstNode) { this._owner = owner; this._owner.firstChild = firstNode; }
    forEach(callback, thisArg) {
        var index = 0;
        if (callback) {
            var node = this._owner.firstChild;
            if (typeof thisArg != 'object')
                while (node) {
                    callback(node, index++, this);
                    node = node.nextSibling;
                }
            else
                while (node) {
                    callback.call(thisArg, node, index++, this);
                    node = node.nextSibling;
                }
        }
    }
    /** Returns a node at the given index, or null if the index is out of bounds. */
    item(index) {
        var node = this._owner.firstChild, i = 0;
        while (node) {
            if (i++ == index)
                return node;
            node = node.nextSibling;
        }
        return null;
    }
    entries() { return new NodeKeyValueIterator(this._owner.firstChild); }
    keys() { return new NodeKeyIterator(this._owner.firstChild); }
    values() { return this[Symbol.iterator](); }
    [Symbol.iterator]() { return new NodeIterator(this._owner.firstChild); }
}
exports.NodeList = NodeList;
var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeTypes[NodeTypes["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
    NodeTypes[NodeTypes["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeTypes[NodeTypes["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
    NodeTypes[NodeTypes["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
    NodeTypes[NodeTypes["ENTITY_NODE"] = 6] = "ENTITY_NODE";
    NodeTypes[NodeTypes["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
    NodeTypes[NodeTypes["COMMENT_NODE"] = 8] = "COMMENT_NODE";
    NodeTypes[NodeTypes["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
    NodeTypes[NodeTypes["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
    NodeTypes[NodeTypes["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
    NodeTypes[NodeTypes["NOTATION_NODE"] = 12] = "NOTATION_NODE";
})(NodeTypes = exports.NodeTypes || (exports.NodeTypes = {}));
/** Performs a deep-copy on a given object.
 * This deep-copy assumes constructor parameters are not required, and just copies over primitive property values while cloning nested object references.
 * References are properly preserved by using a WeakMap to maintain a list of the new instances.
 */
function deepClone(v, cloneWeakMap) {
    cloneWeakMap = cloneWeakMap || new WeakMap();
    if (typeof v == 'string' || typeof v == 'number' || typeof v == 'boolean')
        return v;
    var o = v;
    var clone = cloneWeakMap.get(v);
    if (clone)
        return clone; // (the object to be cloned was already cloned, so we will use the cloned instance)
    try {
        clone = new o.constructor();
    }
    catch (err) {
        throw new Error(`deepClone(): Could not create instance for constructor '${DS.getFunctionName(o.constructor)}' (parameters may be required).\r\n${err}`);
    }
    cloneWeakMap.set(v, clone);
    for (var p in o)
        if (Object.prototype.hasOwnProperty.call(o, p))
            clone[p] = deepClone(o[p], cloneWeakMap);
    return clone;
}
/** Represents a single parsed DOM node (this is the base type to all other element types, since server-side processing does not handle events). */
class Node {
    /** Constructs a new node for the Virtual DOM.
     */
    constructor(
    /** The node name.*/
    nodeName, 
    /** The node type.*/
    nodeType) {
        this.childNodes = new NodeList(this, null);
        nodeName = ('' + nodeName).trim();
        if (!nodeName)
            throw "A node name is required.";
        if (typeof nodeType != 'number' || nodeType < 0)
            throw "'nodeType' is not valid.";
        this.nodeName = nodeName.charAt(0) != '#' ? nodeName.toUpperCase() : nodeName;
        this.nodeType = nodeType;
    }
    /** A convenient function that simply allows using call-chaining to set properties without having to write multiple lines of code within a code block.
     * It also helps to prevent the need for constructors, since deep-cloning requires "default" constructors.
     */
    $__set(name, value) { this[name] = value; return this; }
    get nodeValue() {
        switch (this.nodeType) {
            case NodeTypes.CDATA_SECTION_NODE: /* Content of the CDATA section */ return null; // TODO: ...
            case NodeTypes.COMMENT_NODE: /* Content of the comment */ return null; // TODO: ...
            case NodeTypes.PROCESSING_INSTRUCTION_NODE: /* Entire content excluding the target */ return null; // TODO: ...
            case NodeTypes.TEXT_NODE: /* Content of the text node */ return null; // TODO: ...
        }
        return null; // (all other types return null)
    }
    set nodeValue(value) {
        switch (this.nodeType) {
            case NodeTypes.CDATA_SECTION_NODE: /* Content of the CDATA section */ break; // TODO: ...
            case NodeTypes.COMMENT_NODE: /* Content of the comment */ break; // TODO: ...
            case NodeTypes.PROCESSING_INSTRUCTION_NODE: /* Entire content excluding the target */ break; // TODO: ...
            case NodeTypes.TEXT_NODE: /* Content of the text node */ break; // TODO: ...
        }
    }
    appendChild(child) {
        if (child.parentElement)
            child.parentElement.removeChild(child);
        var lastNode = this.lastChild || this.firstChild;
        if (lastNode) {
            lastNode.nextSibling = child;
            child.previousSibling = lastNode;
            this.lastChild = child;
        }
        if (!this.firstChild)
            this.firstChild = child;
    }
    removeChild(child) {
        if (!child || !(child instanceof Node))
            throw new Error("Failed to execute 'removeChild' on 'Node': parameter 1 is not of type 'Node'.");
        if (child.parentElement != this)
            throw new Error("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
        if (child.previousSibling)
            child.previousSibling.nextSibling = child.nextSibling;
        if (child.nextSibling)
            child.nextSibling.previousSibling = child.previousSibling;
        child.parentElement = null;
        if (this.lastChild == child)
            this.lastChild = null;
        if (this.firstChild == child)
            this.firstChild = null;
    }
    contains(node) {
        var n = this.firstChild;
        do {
            if (n == node)
                return true;
        } while (n = n.nextSibling);
        return false;
    }
    cloneNode() { return deepClone(this); }
    getRootNode() { return this.parentElement; /* Returning a shadow root is not supported at this time. */ }
    hasChildNodes() { return !!this.firstChild; }
    insertBefore(sibling, child) {
        if (!sibling || !(sibling instanceof Node))
            throw new Error("Failed to execute 'insertBefore' on 'Node': parameter 1 is not of type 'Node'.");
        if (sibling.parentElement != this)
            throw new Error("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.");
        if (child.parentElement)
            child.parentElement.removeChild(child);
        var firstNode = sibling || this.firstChild || this.lastChild;
        if (firstNode) {
            firstNode.previousSibling = child;
            child.nextSibling = firstNode;
            this.firstChild = child;
        }
        if (!this.lastChild)
            this.lastChild = child;
    }
    replaceChild(childToReplace, childToAdd) {
        if (!childToReplace || !(childToReplace instanceof Node))
            throw new Error("Failed to execute 'replaceChild' on 'Node': parameter 1 is not of type 'Node'.");
        if (childToReplace.parentElement != this)
            throw new Error("Failed to execute 'replaceChild' on 'Node': The node to be replaced is not a child of this node.");
        if (!childToAdd || !(childToAdd instanceof Node))
            throw new Error("Failed to execute 'replaceChild' on 'Node': parameter 2 is not of type 'Node'.");
        this.insertBefore(childToReplace, childToAdd);
        this.removeChild(childToReplace);
    }
}
exports.Node = Node;
/** Represents a single parsed element. */
class Element extends Node {
    constructor(
    /** The node name.*/
    nodeName, 
    /** The node type.*/
    nodeType, 
    /** The element attributes.*/
    attributes = {}, 
    /** The element CSS classes.*/
    className, 
    /** The element namespace prefix.*/
    prefix) {
        super(nodeName, nodeType);
        this.attributes = attributes;
        this.className = className;
        this.prefix = prefix;
    }
    /** Gets or sets the child objects based on a string.  When setting a string, the current children are replaced by the parsed result.
     * Please be mindful that this is done on every read, so if the node hierarchy is large this could slow things down.
     */
    get innerHTML() {
        return this.toString();
    }
    set innerHTML(value) {
    }
    get outerHTML() { return `<${this.nodeName}>${this.innerHTML}</${this.nodeName}>`; }
    // TODO: Support setting the outer HTML - just parse it as normal.
    toString() { return this.outerHTML; }
}
exports.Element = Element;
/** Represents a single parsed HTML element. */
class HTMLElement extends Element {
    constructor(
    /** The node name.*/
    nodeName = HTMLElement.defaultHTMLTagName, 
    /** The node type.*/
    nodeType = NodeTypes.ELEMENT_NODE, 
    /** The element attributes.*/
    attributes, 
    /** The element CSS classes.*/
    className, 
    /** The element namespace prefix.*/
    prefix) {
        super(nodeName, nodeType, attributes);
        this.className = className;
        this.prefix = prefix;
    }
}
/** Each new instance will initially set its '__htmlTag' property to this value. */
HTMLElement.defaultHTMLTagName = "div";
exports.HTMLElement = HTMLElement;
class CharacterData extends Node {
    constructor(
    /** The node name.*/
    nodeName, 
    /** The node type.*/
    nodeType, data) {
        super(nodeName, nodeType);
        this.data = data;
    }
    get length() { return this.data && this.data.length || 0; }
}
exports.CharacterData = CharacterData;
class Text extends CharacterData {
    constructor(text) { super("#text", NodeTypes.TEXT_NODE, text); }
}
exports.Text = Text;
class Body extends HTMLElement {
    constructor() { super("BODY", NodeTypes.ELEMENT_NODE); }
}
exports.Body = Body;
class Head extends HTMLElement {
    constructor() { super("HEAD", NodeTypes.ELEMENT_NODE); }
}
exports.Head = Head;
class Form extends HTMLElement {
    constructor() { super("FORM", NodeTypes.ELEMENT_NODE); }
}
exports.Form = Form;
class Image extends HTMLElement {
    constructor() { super("IMAGE", NodeTypes.ELEMENT_NODE); }
}
exports.Image = Image;
class Document extends HTMLElement {
    constructor() { super("#document", NodeTypes.DOCUMENT_NODE); }
}
exports.Document = Document;
//# sourceMappingURL=VDOM.js.map