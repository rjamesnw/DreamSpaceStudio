export declare abstract class VDOM {
}
export declare namespace VDOM {
    abstract class NodeIteratorBase<T> {
        readonly root: Node;
        protected _node: Node;
        abstract next(): {
            value?: T;
            done: boolean;
        };
        constructor(node: Node);
    }
    class NodeIterator extends NodeIteratorBase<Node> {
        readonly root: Node;
        protected _node: Node;
        next(): {
            value: Node;
            done: boolean;
        } | {
            done: boolean;
        };
        constructor(node: Node);
    }
    class NodeKeyIterator extends NodeIteratorBase<number> {
        private _index;
        next(): {
            value: number;
            done: boolean;
        } | {
            done: boolean;
        };
        constructor(node: Node);
    }
    class NodeKeyValueIterator extends NodeIteratorBase<[number, Node]> {
        private _index;
        next(): {
            value: [number, Node];
            done: boolean;
        } | {
            done: boolean;
        };
        constructor(node: Node);
    }
    class NodeList {
        private _owner;
        readonly length: number;
        constructor(owner: Node, firstNode: Node);
        forEach(callback: (currentValue: Node, currentIndex: number, listObj: this) => void, thisArg?: {}): void;
        /** Returns a node at the given index, or null if the index is out of bounds. */
        item(index: number): Node;
        entries(): NodeKeyValueIterator;
        keys(): NodeKeyIterator;
        values(): NodeIterator;
        [Symbol.iterator](): NodeIterator;
    }
    enum NodeTypes {
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
    class Node {
        /** The node name.*/
        readonly nodeName: string;
        /** The node type.*/
        readonly nodeType: NodeTypes;
        readonly childNodes: NodeList;
        readonly firstChild: Node;
        readonly lastChild: Node;
        readonly nextSibling: Node;
        outerText: any;
        parentElement: any;
        previousSibling: any;
        textContent: any;
        nodeValue: string;
        /** Constructs a new node for the Virtual DOM.
         */
        constructor(
        /** The node name.*/
        nodeName: string, 
        /** The node type.*/
        nodeType: NodeTypes);
        appendChild(): void;
        cloneNode(): void;
        contains(): void;
        getRootNode(): void;
        hasChildNodes(): void;
        insertBefore(): void;
        removeChild(): void;
        replaceChild(): void;
    }
    /** Represents a single parsed element. */
    class Element extends Node {
        /** The element attributes.*/
        attributes: {
            [index: string]: string;
        };
        /** The element CSS classes.*/
        className?: string;
        /** The element namespace prefix.*/
        prefix?: string;
        /** Gets or sets the child objects based on a string.  When setting a string, the current children are replaced by the parsed result.
         * Please be mindful that this is done on every read, so if the node hierarchy is large this could slow things down.
         */
        innerHTML: string;
        constructor(
        /** The node name.*/
        nodeName: string, 
        /** The node type.*/
        nodeType: NodeTypes, 
        /** The element attributes.*/
        attributes?: {
            [index: string]: string;
        }, 
        /** The element CSS classes.*/
        className?: string, 
        /** The element namespace prefix.*/
        prefix?: string);
    }
    /** Represents a single parsed HTML element. */
    class HTMLElement extends Element {
        /** The element CSS classes.*/
        className?: string;
        /** The element namespace prefix.*/
        prefix?: string;
        constructor(
        /** The node name.*/
        nodeName: string, 
        /** The node type.*/
        nodeType: NodeTypes, 
        /** The element attributes.*/
        attributes?: {
            [index: string]: string;
        }, 
        /** The element CSS classes.*/
        className?: string, 
        /** The element namespace prefix.*/
        prefix?: string);
    }
    class Text extends HTMLElement {
        constructor();
    }
    class Body extends HTMLElement {
        constructor();
    }
    class Head extends HTMLElement {
        constructor();
    }
    class Form extends HTMLElement {
        constructor();
    }
    class Image extends HTMLElement {
        constructor();
    }
    class Document extends HTMLElement {
        body: Body;
        head: Head;
        forms: Form;
        images: Form;
        constructor();
    }
}
