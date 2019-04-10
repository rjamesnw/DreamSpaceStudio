/*
 * DreamSpace (DreamSpace.com), (c) Twigate.com
 * License: http://creativecommons.org/licenses/by-nc/4.0/
 * (see DreamSpace.ts for more details)
 *
 * Description: VDOM (Virtual DOM) is, as the name suggests, a virtual DOM used in the web workers and remote servers, which don't usually have UIs.
 *
 * Purpose: To provide a secure way to protected users from malicious applications.  Applications running in a web worker are untrusted by
 *          default (sandboxed). A user may, at their own risk, elevate an application to "trusted", and allow it to run in the core
 *          context.  This is required for most system related modules.
 *          The VDOM also acts as a virtual object graph, like that which is use with some game libraries/frameworks.  It allows remotely tracking
 *          and updating objects.  Any lag between a worker and the UI can be seen as "network lag" (typically in ms).  Developing an application
 *          with VDOM allows one to develop server side logic at the same time - using the same code base!  This basically makes websites act like
 *          "games", where the server side controls the main logic, and the client side simply updates the view and transmits UI events as needed.
 */
var DreamSpace;
(function (DreamSpace) {
    let VDOM;
    (function (VDOM) {
        function defineProperty(obj, name, initialValue, canRead = true, canWrite = true) {
            var desc = {
                configurable: false,
                enumerable: true
            };
            if (initialValue !== void 0)
                desc.value = initialValue;
            if (canRead)
                desc.get = function () {
                };
            if (canWrite)
                desc.set = function () {
                };
            return Object.defineProperty(obj, name, desc);
        }
        VDOM.defineProperty = defineProperty;
        function defineConst(obj, name, value) {
            var desc = {
                configurable: false,
                enumerable: true,
                value: value,
                writable: false
            };
            return Object.defineProperty(obj, name, desc);
        }
        VDOM.defineConst = defineConst;
        let __Operations;
        (function (__Operations) {
            __Operations[__Operations["Get"] = 0] = "Get";
            __Operations[__Operations["Set"] = 1] = "Set";
            __Operations[__Operations["Call"] = 2] = "Call";
        })(__Operations || (__Operations = {}));
        class __Operation {
        }
        var __operationQueue = [];
        function __queueOperation(args) {
        }
        class EventTarget {
            addEventListener(type, listener, useCapture) {
            }
        }
        VDOM.EventTarget = EventTarget;
        // Note: Until object proxies are widely supported, a select number of numbered indexes will be defined to make the
        //       object "live" as per the spec (but only when returned by '{Node}.childNodes').
        class NodeList {
            constructor(owner) {
                if (owner)
                    this.$__owner = owner;
            }
            get length() {
                return -1 - this.$__length; // (-1 == 0, -2 == 1, etc.)
            }
            set length(value) {
                if (this.$__length >= 0)
                    this.$__length = value;
            }
            item(index) {
                return this[index];
            }
            __extendDefNumIndexProps(newVirtualLength) {
                for (var i = NodeList.$__virtualLength; i < newVirtualLength; ++i)
                    (function (i) {
                        Object.defineProperty(NodeList.prototype, i.toString(), {
                            enumerable: true,
                            configurable: false,
                            get: () => {
                                return this[i];
                            }
                        });
                    })(i);
            }
        }
        NodeList.$__virtualLength = 0;
        VDOM.NodeList = NodeList;
        // ... copy the array prototype functions over to the NodeList proto (just to make things easier [used with '__IPrivateNodeList']) ...
        for (var p in Array.prototype)
            if (Array.prototype.hasOwnProperty(p))
                NodeList.prototype[p] = Array.prototype[p];
        class Node extends EventTarget {
            constructor() {
                super(...arguments);
                this.$__index = -1; // (the index of this node among sibling nodes; -1 = no parent [not added to any list])
                // - - - End MS Specific Properties - - -
            }
            get previousSibling() {
                if (this.$__childNodes === void 0 || this.$__index < 1)
                    return null;
                return this.$__siblings[this.$__index - 1];
            }
            get nextSibling() {
                if (this.$__childNodes === void 0 || this.$__index >= this.$__childNodes.length - 1)
                    return null;
                return this.$__siblings[this.$__index + 1];
            }
            get parentNode() {
                return this.$__parent || null;
            }
            appendChild(newChild) {
                // ... remove from existing parent if any ...
                if (newChild.$__parent)
                    newChild.$__parent.removeChild(newChild);
                newChild.$__parent = this;
                newChild.$__index = this.$__childNodes.$__length;
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (unlock)
                this.$__childNodes.push(newChild);
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (lock)
                return newChild;
            }
            removeChild(oldChild) {
                if (typeof oldChild !== 'object')
                    throw new Error("Node value given is null or undefined.");
                if (oldChild.$__parent !== this || oldChild.$__index === void 0 || oldChild.$__index < 0)
                    throw new Error("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
                // (readjust the indexes)
                for (var i = oldChild.$__index, n = this.$__childNodes.length - i; i < n; ++i)
                    this.$__childNodes[i].$__index = i;
                oldChild.$__index = -1;
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (unlock)
                this.$__childNodes.splice(oldChild.$__index);
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (lock)
                return oldChild;
            }
            get childNodes() { return this.$__childNodes; }
            normalize() {
            }
        }
        VDOM.Node = Node;
        defineProperty(Node.prototype, "nodeType");
        defineProperty(Node.prototype, "localName");
        defineProperty(Node.prototype, "namespaceURI");
        defineProperty(Node.prototype, "textContent");
        // Node Type ENums
        defineConst(Node.prototype, "ELEMENT_NODE", 1);
        defineConst(Node.prototype, "ATTRIBUTE_NODE", 2);
        defineConst(Node.prototype, "TEXT_NODE", 3);
        defineConst(Node.prototype, "CDATA_SECTION_NODE", 4);
        defineConst(Node.prototype, "ENTITY_REFERENCE_NODE", 5);
        defineConst(Node.prototype, "ENTITY_NODE", 6);
        defineConst(Node.prototype, "PROCESSING_INSTRUCTION_NODE", 7);
        defineConst(Node.prototype, "COMMENT_NODE", 8);
        defineConst(Node.prototype, "DOCUMENT_NODE", 9);
        defineConst(Node.prototype, "DOCUMENT_TYPE_NODE", 10);
        defineConst(Node.prototype, "DOCUMENT_FRAGMENT_NODE", 11);
        defineConst(Node.prototype, "NOTATION_NODE", 12);
        // Flags
        defineConst(Node.prototype, "DOCUMENT_POSITION_DISCONNECTED", 0x01);
        defineConst(Node.prototype, "DOCUMENT_POSITION_PRECEDING", 0x02);
        defineConst(Node.prototype, "DOCUMENT_POSITION_FOLLOWING", 0x04);
        defineConst(Node.prototype, "DOCUMENT_POSITION_CONTAINS", 0x08);
        defineConst(Node.prototype, "DOCUMENT_POSITION_CONTAINED_BY", 0x010);
        defineConst(Node.prototype, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", 0x20);
        class Element extends Node {
        }
        VDOM.Element = Element;
        class Document extends Node {
        }
        VDOM.Document = Document;
        class Window extends EventTarget {
        }
        VDOM.Window = Window;
        document = new Document();
        window = new Window();
        function updateUI() {
            // ... send all the update requests to the UI if client side, or by WebSocket if server side ...
            if (Environment == Environments.Server) {
            }
            else {
            }
        }
        setTimeout(updateUI, 1000 / 60); // UI Update Timer
    })(VDOM = DreamSpace.VDOM || (DreamSpace.VDOM = {}));
})(DreamSpace || (DreamSpace = {}));
//# sourceMappingURL=VDom.js.map