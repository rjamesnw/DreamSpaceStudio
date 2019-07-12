namespace VDOM {
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

        constructor(owner: Node, firstNode: Node) { this._owner = owner; this._owner.firstChild = firstNode; }

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

    /** Represents a single parsed DOM node (this is the base type to all other element types, since server-side processing does not handle events). */
    export class Node {

        /** The node name.*/
        readonly nodeName: string;
        /** The node type.*/
        readonly nodeType: NodeTypes;

        readonly childNodes: NodeList = new NodeList(this, null);
        readonly firstChild: Node;
        readonly lastChild: Node;
        readonly nextSibling: Node;
        outerText: any;
        parentElement: any;
        previousSibling: any;
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

        appendChild() {
        }
        cloneNode() { }
        contains() { }
        getRootNode() { }
        hasChildNodes() { }
        insertBefore() { }
        removeChild() { }
        replaceChild() { }
    }

    /** Represents a single parsed element. */
    export class Element extends Node {

        /** Gets or sets the child objects based on a string.  When setting a string, the current children are replaced by the parsed result.
         * Please be mindful that this is done on every read, so if the node hierarchy is large this could slow things down.
         */
        get innerHTML(): string {
            return this.toString();
        }
        set innerHTML(value) {
        }

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
        constructor(
            /** The node name.*/
            nodeName: string,
            /** The node type.*/
            nodeType: NodeTypes,
            /** The element attributes.*/
            attributes?: { [index: string]: string },
            /** The element CSS classes.*/
            public className?: string,
            /** The element namespace prefix.*/
            public prefix?: string
        ) { super(nodeName, nodeType, attributes); }
    }

    export class Text extends HTMLElement {
        constructor() { super("#text", NodeTypes.TEXT_NODE); }
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
}