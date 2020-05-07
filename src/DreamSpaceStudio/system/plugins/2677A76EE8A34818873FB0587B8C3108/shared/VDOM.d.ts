export declare abstract class NodeIteratorBase<T> {
    readonly root: Node;
    protected _node: Node;
    abstract next(): {
        value?: T;
        done: boolean;
    };
    constructor(node: Node);
}
export declare class NodeIterator extends NodeIteratorBase<Node> {
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
export declare class NodeKeyIterator extends NodeIteratorBase<number> {
    private _index;
    next(): {
        value: number;
        done: boolean;
    } | {
        done: boolean;
    };
    constructor(node: Node);
}
export declare class NodeKeyValueIterator extends NodeIteratorBase<[number, Node]> {
    private _index;
    next(): {
        value: [number, Node];
        done: boolean;
    } | {
        done: boolean;
    };
    constructor(node: Node);
}
export declare class NodeList {
    private _owner;
    get length(): number;
    constructor(owner: Node, firstNode: Node);
    forEach(callback: (currentValue: Node, currentIndex: number, listObj: this) => void, thisArg?: {}): void;
    /** Returns a node at the given index, or null if the index is out of bounds. */
    item(index: number): Node;
    entries(): NodeKeyValueIterator;
    keys(): NodeKeyIterator;
    values(): NodeIterator;
    [Symbol.iterator](): NodeIterator;
}
export declare enum NodeTypes {
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
export declare class Node {
    [index: string]: any;
    /** A convenient function that simply allows using call-chaining to set properties without having to write multiple lines of code within a code block.
     * It also helps to prevent the need for constructors, since deep-cloning requires "default" constructors.
     */
    $__set<T extends keyof this>(name: T, value: this[T]): this;
    /** The node name.*/
    readonly nodeName: string;
    /** The node type.*/
    readonly nodeType: NodeTypes;
    readonly childNodes: NodeList;
    readonly firstChild: Node;
    readonly lastChild: Node;
    readonly nextSibling: Node;
    readonly previousSibling: Node;
    readonly parentElement: Node;
    outerText: any;
    textContent: any;
    get nodeValue(): string;
    set nodeValue(value: string);
    /** Constructs a new node for the Virtual DOM.
     */
    constructor(
    /** The node name.*/
    nodeName: string, 
    /** The node type.*/
    nodeType: NodeTypes);
    appendChild(child: Node): void;
    removeChild(child: Node): void;
    contains(node: Node): boolean;
    cloneNode(): string | number | boolean | IndexedObject<any>;
    getRootNode(): Node;
    hasChildNodes(): boolean;
    insertBefore(sibling: Node, child: Node): void;
    replaceChild(childToReplace: Node, childToAdd: Node): void;
}
/** Represents a single parsed element. */
export declare class Element extends Node {
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
    get innerHTML(): string;
    set innerHTML(value: string);
    get outerHTML(): string;
    toString(): string;
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
export declare class HTMLElement extends Element {
    /** The element CSS classes.*/
    className?: string;
    /** The element namespace prefix.*/
    prefix?: string;
    /** Each new instance will initially set its '__htmlTag' property to this value. */
    static defaultHTMLTagName: string;
    constructor(
    /** The node name.*/
    nodeName?: string, 
    /** The node type.*/
    nodeType?: NodeTypes, 
    /** The element attributes.*/
    attributes?: {
        [index: string]: string;
    }, 
    /** The element CSS classes.*/
    className?: string, 
    /** The element namespace prefix.*/
    prefix?: string);
}
export declare abstract class CharacterData extends Node {
    data?: string;
    get length(): number;
    constructor(
    /** The node name.*/
    nodeName: string, 
    /** The node type.*/
    nodeType: NodeTypes, data?: string);
}
export declare class Text extends CharacterData {
    constructor(text: string);
}
export declare class Body extends HTMLElement {
    constructor();
}
export declare class Head extends HTMLElement {
    constructor();
}
export declare class Form extends HTMLElement {
    constructor();
}
export declare class Image extends HTMLElement {
    constructor();
}
export declare class Document extends HTMLElement {
    body: Body;
    head: Head;
    forms: Form;
    images: Form;
    constructor();
}
