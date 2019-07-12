define("plugins/2677A76EE8A34818873FB0587B8C3108/types/VDOM", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class VDOM {
    }
    exports.VDOM = VDOM;
    (function (VDOM) {
        class NodeIteratorBase {
            constructor(node) { this._node = this.root = node; }
        }
        VDOM.NodeIteratorBase = NodeIteratorBase;
        ;
        class NodeIterator extends NodeIteratorBase {
            constructor(node) { super(node); }
            next() {
                if (this._node) {
                    var result = { value: this._node, done: false };
                    this._node = this._node.nextSibling;
                    return result;
                }
                else
                    return { done: true };
            }
        }
        VDOM.NodeIterator = NodeIterator;
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
        VDOM.NodeKeyIterator = NodeKeyIterator;
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
        VDOM.NodeKeyValueIterator = NodeKeyValueIterator;
        ;
        class NodeList {
            constructor(owner, firstNode) { this._owner = owner; this._owner.firstChild = firstNode; }
            //private _firstNode: Node;
            //private _lastNode: Node;
            get length() { var count = 0, node = this._owner.firstChild; while (node) {
                node = node.nextSibling;
                ++count;
            } return count; }
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
        VDOM.NodeList = NodeList;
        let NodeTypes;
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
        })(NodeTypes = VDOM.NodeTypes || (VDOM.NodeTypes = {}));
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
        VDOM.Node = Node;
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
        }
        VDOM.Element = Element;
        /** Represents a single parsed HTML element. */
        class HTMLElement extends Element {
            constructor(
            /** The node name.*/
            nodeName, 
            /** The node type.*/
            nodeType, 
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
        VDOM.HTMLElement = HTMLElement;
        class Text extends HTMLElement {
            constructor() { super("#text", NodeTypes.TEXT_NODE); }
        }
        VDOM.Text = Text;
        class Body extends HTMLElement {
            constructor() { super("BODY", NodeTypes.ELEMENT_NODE); }
        }
        VDOM.Body = Body;
        class Head extends HTMLElement {
            constructor() { super("HEAD", NodeTypes.ELEMENT_NODE); }
        }
        VDOM.Head = Head;
        class Form extends HTMLElement {
            constructor() { super("FORM", NodeTypes.ELEMENT_NODE); }
        }
        VDOM.Form = Form;
        class Image extends HTMLElement {
            constructor() { super("IMAGE", NodeTypes.ELEMENT_NODE); }
        }
        VDOM.Image = Image;
        class Document extends HTMLElement {
            constructor() { super("#document", NodeTypes.DOCUMENT_NODE); }
        }
        VDOM.Document = Document;
    })(VDOM = exports.VDOM || (exports.VDOM = {}));
});
//# sourceMappingURL=index.js.map