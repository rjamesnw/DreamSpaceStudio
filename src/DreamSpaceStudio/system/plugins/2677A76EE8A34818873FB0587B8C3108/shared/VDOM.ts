export abstract class NodeIteratorBase<T> {
    readonly root: Node;
    protected _node: Node;
    abstract next(): { value?: T, done: boolean }
    constructor(node: Node) { this._node = this.root = node; }
};

export class NodeIterator extends NodeIteratorBase<Node> {
    readonly root: Node;
    protected _node: Node;
    next() {
        if (this._node) {
            var result = { value: this._node, done: false };
            this._node = this._node.nextSibling;
            return result;
        }
        else return { done: true };
    }
    constructor(node: Node) { super(node); }
};

export class NodeKeyIterator extends NodeIteratorBase<number> {
    private _index: number = 0;
    next() {
        if (this._node) {
            var result = { value: this._index++, done: false };
            this._node = this._node.nextSibling;
            return result;
        }
        else return { done: true };
    }
    constructor(node: Node) { super(node); }
};

export class NodeKeyValueIterator extends NodeIteratorBase<[number, Node]> {
    private _index: number = 0;
    next() {
        if (this._node) {
            var result = { value: <[number, Node]>[this._index++, this._node], done: false };
            this._node = this._node.nextSibling;
            return result;
        }
        else return { done: true };
    }
    constructor(node: Node) { super(node); }
};

export class NodeList {
    private _owner: Node;
    //private _firstNode: Node;
    //private _lastNode: Node;

    get length() { var count = 0, node = this._owner.firstChild; while (node) { node = node.nextSibling; ++count; } return count; }

    constructor(owner: Node, firstNode: Node) { this._owner = owner; (<Writeable<Node>>this._owner).firstChild = firstNode; }

    forEach(callback: (currentValue: Node, currentIndex: number, listObj: this) => void, thisArg?: {}): void {
        var index = 0;
        if (callback) {
            var node = this._owner.firstChild;
            if (typeof thisArg != 'object')
                while (node) {
                    callback(node, index++, this);
                    node = node.nextSibling;
                }
            else while (node) {
                callback.call(thisArg, node, index++, this);
                node = node.nextSibling;
            }
        }
    }

    /** Returns a node at the given index, or null if the index is out of bounds. */
    item(index: number): Node {
        var node = this._owner.firstChild, i = 0;
        while (node) {
            if (i++ == index) return node;
            node = node.nextSibling;
        }
        return null;
    }

    entries() { return new NodeKeyValueIterator(this._owner.firstChild); }

    keys() { return new NodeKeyIterator(this._owner.firstChild); }

    values() { return this[Symbol.iterator](); }

    [Symbol.iterator]() { return new NodeIterator(this._owner.firstChild); }
}

export enum NodeTypes {
    ELEMENT_NODE = 1,
    ATTRIBUTE_NODE = 2,
    TEXT_NODE = 3,
    CDATA_SECTION_NODE = 4,
    ENTITY_REFERENCE_NODE = 5,
    ENTITY_NODE = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9,
    DOCUMENT_TYPE_NODE = 10,
    DOCUMENT_FRAGMENT_NODE = 11,
    NOTATION_NODE = 12
}

/** Performs a deep-copy on a given object.
 * This deep-copy assumes constructor parameters are not required, and just copies over primitive property values while cloning nested object references.
 * References are properly preserved by using a WeakMap to maintain a list of the new instances.
 */
function deepClone(v: any, cloneWeakMap?: WeakMap<{}, {}>) {
    cloneWeakMap = cloneWeakMap || new WeakMap();
    if (typeof v == 'string' || typeof v == 'number' || typeof v == 'boolean') return v;
    var o = v as IndexedObject;
    var clone: IndexedObject = cloneWeakMap.get(v);
    if (clone) return clone; // (the object to be cloned was already cloned, so we will use the cloned instance)
    try {
        clone = new (<any>o.constructor)();
    }
    catch (err) { throw new Error(`deepClone(): Could not create instance for constructor '${DS.getFunctionName(o.constructor)}' (parameters may be required).\r\n${err}`); }
    cloneWeakMap.set(v, clone);
    for (var p in o)
        if (Object.prototype.hasOwnProperty.call(o, p))
            clone[p] = deepClone(o[p], cloneWeakMap);
    return clone;

}

/** Represents a single parsed DOM node (this is the base type to all other element types, since server-side processing does not handle events). */
export class Node {
    [index: string]: any;

    /** A convenient function that simply allows using call-chaining to set properties without having to write multiple lines of code within a code block. 
     * It also helps to prevent the need for constructors, since deep-cloning requires "default" constructors.
     */
    $__set<T extends keyof this>(name: T, value: this[T]): this { this[name] = value; return this; }

    /** The node name.*/
    readonly nodeName: string;
    /** The node type.*/
    readonly nodeType: NodeTypes;

    readonly childNodes: NodeList = new NodeList(this, null);
    readonly firstChild: Node;
    readonly lastChild: Node;
    readonly nextSibling: Node;
    readonly previousSibling: Node;
    readonly parentElement: Node;
    outerText: any;
    textContent: any;

    get nodeValue(): string { // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue
        switch (this.nodeType) {
            case NodeTypes.CDATA_SECTION_NODE: /* Content of the CDATA section */ return null; // TODO: ...
            case NodeTypes.COMMENT_NODE: /* Content of the comment */ return null; // TODO: ...
            case NodeTypes.PROCESSING_INSTRUCTION_NODE: /* Entire content excluding the target */ return null;  // TODO: ...
            case NodeTypes.TEXT_NODE: /* Content of the text node */ return null; // TODO: ...
        }
        return null; // (all other types return null)
    }
    set nodeValue(value) { // (Note: When nodeValue is defined to be null, setting it has no effect.)
        switch (this.nodeType) {
            case NodeTypes.CDATA_SECTION_NODE: /* Content of the CDATA section */ break; // TODO: ...
            case NodeTypes.COMMENT_NODE: /* Content of the comment */ break; // TODO: ...
            case NodeTypes.PROCESSING_INSTRUCTION_NODE: /* Entire content excluding the target */ break; // TODO: ...
            case NodeTypes.TEXT_NODE: /* Content of the text node */ break; // TODO: ...
        }
    }

    /** Constructs a new node for the Virtual DOM.
     */
    constructor(
        /** The node name.*/
        nodeName: string,
        /** The node type.*/
        nodeType: NodeTypes
    ) {
        nodeName = ('' + nodeName).trim();
        if (!nodeName) throw "A node name is required.";
        if (typeof nodeType != 'number' || nodeType < 0) throw "'nodeType' is not valid.";
        this.nodeName = nodeName.charAt(0) != '#' ? nodeName.toUpperCase() : nodeName;
        this.nodeType = nodeType;
    }

    appendChild(child: Node) {
        if (child.parentElement)
            child.parentElement.removeChild(child);
        var lastNode = this.lastChild || this.firstChild;
        if (lastNode) {
            (<Writeable<Node>>lastNode).nextSibling = child;
            (<Writeable<Node>>child).previousSibling = lastNode;
            (<Writeable<Node>>this).lastChild = child;
        }
        if (!this.firstChild)
            (<Writeable<Node>>this).firstChild = child;
    }

    removeChild(child: Node) {
        if (!child || !(child instanceof Node))
            throw new Error("Failed to execute 'removeChild' on 'Node': parameter 1 is not of type 'Node'.");
        if ((<Writeable<Node>>child).parentElement != this)
            throw new Error("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
        if (child.previousSibling)
            (<Writeable<Node>>child.previousSibling).nextSibling = child.nextSibling;
        if (child.nextSibling)
            (<Writeable<Node>>child.nextSibling).previousSibling = child.previousSibling;
        (<Writeable<Node>>child).parentElement = null;
        if (this.lastChild == child)
            (<Writeable<Node>>this).lastChild = null;
        if (this.firstChild == child)
            (<Writeable<Node>>this).firstChild = null;
    }

    contains(node: Node) {
        var n = this.firstChild;
        do {
            if (n == node) return true;
        } while (n = n.nextSibling);
        return false;
    }

    cloneNode() { return deepClone(this); }

    getRootNode() { return this.parentElement; /* Returning a shadow root is not supported at this time. */ }

    hasChildNodes() { return !!this.firstChild }

    insertBefore(sibling: Node, child: Node) {
        if (!sibling || !(sibling instanceof Node))
            throw new Error("Failed to execute 'insertBefore' on 'Node': parameter 1 is not of type 'Node'.");
        if (sibling.parentElement != this)
            throw new Error("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.");
        if (child.parentElement)
            child.parentElement.removeChild(child);
        var firstNode = sibling || this.firstChild || this.lastChild;
        if (firstNode) {
            (<Writeable<Node>>firstNode).previousSibling = child;
            (<Writeable<Node>>child).nextSibling = firstNode;
            (<Writeable<Node>>this).firstChild = child;
        }
        if (!this.lastChild)
            (<Writeable<Node>>this).lastChild = child;
    }

    replaceChild(childToReplace: Node, childToAdd: Node) {
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

/** Represents a single parsed element. */
export class Element extends Node {

    /** Gets or sets the child objects based on a string.  When setting a string, the current children are replaced by the parsed result.
     * Please be mindful that this is done on every read, so if the node hierarchy is large this could slow things down.
     */
    get innerHTML(): string {
        return this.toString();
    }
    set innerHTML(value: string) {
    }

    get outerHTML() { return `<${this.nodeName}>${this.innerHTML}</${this.nodeName}>`; }
    // TODO: Support setting the outer HTML - just parse it as normal.

    toString(): string { return this.outerHTML; }

    constructor(
        /** The node name.*/
        nodeName: string,
        /** The node type.*/
        nodeType: NodeTypes,
        /** The element attributes.*/
        public attributes: { [index: string]: string } = {},
        /** The element CSS classes.*/
        public className?: string,
        /** The element namespace prefix.*/
        public prefix?: string
    ) { super(nodeName, nodeType); }
}

/** Represents a single parsed HTML element. */
export class HTMLElement extends Element {
    /** Each new instance will initially set its '__htmlTag' property to this value. */
    static defaultHTMLTagName: string = "div";

    constructor(
        /** The node name.*/
        nodeName = HTMLElement.defaultHTMLTagName,
        /** The node type.*/
        nodeType = NodeTypes.ELEMENT_NODE,
        /** The element attributes.*/
        attributes?: { [index: string]: string },
        /** The element CSS classes.*/
        public className?: string,
        /** The element namespace prefix.*/
        public prefix?: string
    ) { super(nodeName, nodeType, attributes); }
}

export abstract class CharacterData extends Node {
    get length() { return this.data && this.data.length || 0; }
    constructor(
        /** The node name.*/
        nodeName: string,
        /** The node type.*/
        nodeType: NodeTypes,
        public data?: string) { super(nodeName, nodeType); }
}

export class Text extends CharacterData {
    constructor(text: string) { super("#text", NodeTypes.TEXT_NODE, text); }
}

export class Body extends HTMLElement {
    constructor() { super("BODY", NodeTypes.ELEMENT_NODE); }
}

export class Head extends HTMLElement {
    constructor() { super("HEAD", NodeTypes.ELEMENT_NODE); }
}

export class Form extends HTMLElement {
    constructor() { super("FORM", NodeTypes.ELEMENT_NODE); }
}

export class Image extends HTMLElement {
    constructor() { super("IMAGE", NodeTypes.ELEMENT_NODE); }
}

export class Document extends HTMLElement {
    body: Body;
    head: Head;
    forms: Form;
    images: Form;
    constructor() { super("#document", NodeTypes.DOCUMENT_NODE); }
}
