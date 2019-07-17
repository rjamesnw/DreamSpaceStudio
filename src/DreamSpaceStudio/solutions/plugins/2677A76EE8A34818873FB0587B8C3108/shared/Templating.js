"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VDOM_1 = require("./VDOM");
// Holds special types used with parsing HTML templates.
/** A list of text mark-up flags for use with phrase based elements. */
var PhraseTypes;
(function (PhraseTypes) {
    /** Indicates emphasis. */
    PhraseTypes[PhraseTypes["Emphasis"] = 1] = "Emphasis";
    /** Indicates stronger emphasis. */
    PhraseTypes[PhraseTypes["Strong"] = 2] = "Strong";
    /** Contains a citation or a reference to other sources. */
    PhraseTypes[PhraseTypes["Cite"] = 4] = "Cite";
    /** Indicates that this is the defining instance of the enclosed term. */
    PhraseTypes[PhraseTypes["Defining"] = 8] = "Defining";
    /** Designates a fragment of computer code. */
    PhraseTypes[PhraseTypes["Code"] = 16] = "Code";
    /** Designates sample output from programs, scripts, etc. */
    PhraseTypes[PhraseTypes["Sample"] = 32] = "Sample";
    /** Indicates text to be entered by the user. */
    PhraseTypes[PhraseTypes["Keyboard"] = 64] = "Keyboard";
    /** Indicates an instance of a variable or program argument. */
    PhraseTypes[PhraseTypes["Variable"] = 128] = "Variable";
    /** Indicates an abbreviated form (Example: WWW, HTTP, URI, AI, e.g., ex., etc., ...). */
    PhraseTypes[PhraseTypes["Abbreviation"] = 256] = "Abbreviation";
    /** Indicates an acronym (Example: WAC, radar, NASA, laser, sonar, ...). */
    PhraseTypes[PhraseTypes["Acronym"] = 512] = "Acronym";
})(PhraseTypes = exports.PhraseTypes || (exports.PhraseTypes = {}));
class TemplateElement extends VDOM_1.HTMLElement {
    constructor(
    /** The node name.*/
    nodeName = VDOM_1.HTMLElement.defaultHTMLTagName, 
    /** The node type.*/
    nodeType = VDOM_1.NodeTypes.ELEMENT_NODE, 
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
    get outerHTML() {
        this.validate();
        return super.outerHTML;
    }
    /** Call this to validate supported element types. */
    assertSupportedNodeTypes(...args) {
        if (this.__disableNodeTypeValidation)
            return;
        this.tagName = (this.tagName || "").toLowerCase();
        //??args = <string[]><any>arguments;
        if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length)
            args = args[0]; // (first parameter is an array of supported type names)
        for (var i = 0; i < args.length; i++)
            if (this.tagName == args[i])
                return true;
        throw DS.Exception.from("The node type name '" + this.tagName + "' is not supported for this template type.");
    }
    /** Call this to validate unsupported element types. */
    assertUnsupportedNodeTypes(...args) {
        if (this.__disableNodeTypeValidation)
            return;
        this.tagName = (this.tagName || "").toLowerCase();
        //??args = <string[]><any>arguments;
        if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length)
            args = args[0]; // (first parameter is an array of unsupported type names)
        for (var i = 0; i < args.length; i++)
            if (this.tagName == args[i])
                throw DS.Exception.from("The node type name '" + this.tagName + "' is not supported for this template type.");
    }
}
exports.TemplateElement = TemplateElement;
class Phrase extends TemplateElement {
    constructor(nodeName) { super(nodeName); }
    validate() {
        this.assertSupportedNodeTypes("em", "strong", "cite", "dfn", "code", "samp", "kbd", "var", "abr", "acronym");
    }
    get outerHTML() {
        this.validate();
        var leftTags = "", rightTags = "", phraseType = this.phraseType;
        if ((phraseType & PhraseTypes.Emphasis) > 0) {
            leftTags = "<em>" + leftTags;
            rightTags += "</em>";
        }
        if ((phraseType & PhraseTypes.Strong) > 0) {
            leftTags = "<strong>" + leftTags;
            rightTags += "</strong>";
        }
        if ((phraseType & PhraseTypes.Cite) > 0) {
            leftTags = "<cite>" + leftTags;
            rightTags += "</cite>";
        }
        if ((phraseType & PhraseTypes.Defining) > 0) {
            leftTags = "<dfn>" + leftTags;
            rightTags += "</dfn>";
        }
        if ((phraseType & PhraseTypes.Code) > 0) {
            leftTags = "<code>" + leftTags;
            rightTags += "</code>";
        }
        if ((phraseType & PhraseTypes.Sample) > 0) {
            leftTags = "<samp>" + leftTags;
            rightTags += "</samp>";
        }
        if ((phraseType & PhraseTypes.Keyboard) > 0) {
            leftTags = "<kbd>" + leftTags;
            rightTags += "</kbd>";
        }
        if ((phraseType & PhraseTypes.Variable) > 0) {
            leftTags = "<var>" + leftTags;
            rightTags += "</var>";
        }
        if ((phraseType & PhraseTypes.Abbreviation) > 0) {
            leftTags = "<abbr>" + leftTags;
            rightTags += "</abbr>";
        }
        if ((phraseType & PhraseTypes.Acronym) > 0) {
            leftTags = "<acronym>" + leftTags;
            rightTags += "</acronym>";
        }
        return leftTags + this.innerHTML + rightTags;
    }
}
exports.Phrase = Phrase;
class HTMLText extends TemplateElement {
    constructor() { super("span"); }
    validate() { this.assertUnsupportedNodeTypes("html", "head", "body", "script", "audio", "canvas", "object"); }
    // ----------------------------------------------------------------------------------------------------------------
    onRedraw(recursive = true) {
        super.onRedraw(recursive);
    }
}
exports.HTMLText = HTMLText;
class Header extends TemplateElement {
    constructor(/**A value from 1-6.*/ headerLevel = 1) {
        super('h' + headerLevel);
        this.headerLevel = headerLevel;
        if (headerLevel < 1 || headerLevel > 6)
            throw DS.Exception.from("HTML only supports header levels 1 through 6.");
    }
    validate() {
        if (this.headerLevel < 1 || this.headerLevel > 6)
            throw DS.Exception.from("HTML only supports header levels 1 through 6.");
        this.assertSupportedElementTypes("h1", "h2", "h3", "h4", "h5", "h6");
    }
    get outerHTML() {
        this.validate();
        this.tagName = "h" + this.headerLevel;
        return super.outerHTML;
    }
    // ----------------------------------------------------------------------------------------------------------------
    onRedraw(recursive = true) {
        super.onRedraw(recursive);
    }
}
exports.Header = Header;
//# sourceMappingURL=Templating.js.map