var DreamSpace;
(function (DreamSpace) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            /** Contains a series of core DreamSpace HTML-based UI elements. Each element extends the GraphNode type. */
            let HTML;
            (function (HTML) {
                namespace(() => DreamSpace.System.Platform.HTML);
                // ===================================================================================================================
                /** A context is a container that manages a reference to a global script environment. Each new context creates a new
                  * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
                  * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
                  * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
                  */
                class BrowserContext extends FactoryBase(Context) {
                    static 'new'(context = Contexts.Secure) { return null; }
                    static init(o, isnew, context = Contexts.Secure) {
                        this.super.init(o, isnew, context);
                    }
                }
                HTML.BrowserContext = BrowserContext;
                (function (BrowserContext) {
                    class $__type extends FactoryType(Context) {
                        // -----------------------------------------------------------------------------------------------------------------
                        _setupIFrame() {
                            this._target = this._iframe = document.createElement("iframe");
                            this._iframe.style.display = "none";
                            this._iframe.src = this._url;
                            global.document.body.appendChild(this._iframe);
                            this._global = this._iframe.contentWindow;
                        }
                        _setupWorker() {
                            this._target = this._worker = new Worker(this._url);
                        }
                        _setupWindow() {
                            this._target = this._window = Window.new(null, this._url);
                        }
                        // -----------------------------------------------------------------------------------------------------------------
                        /** Load a resource (usually a script or page) into this context. */
                        load(url) {
                            var contextType = this._contextType;
                            switch (Environment) {
                                case Environments.Browser:
                                    switch (contextType) {
                                        case Contexts.Secure:
                                        case Contexts.Unsecure:
                                            this._setupIFrame();
                                            if (Environment == Environments.Browser) {
                                            }
                                            else if (Environment == Environments.Browser) {
                                            }
                                            else {
                                                this._target = this._worker = new Worker("DreamSpace.js");
                                            }
                                            break;
                                        case Contexts.SecureWindow:
                                        case Contexts.UnsecureWindow:
                                            if (Environment == Environments.Browser) {
                                                this._target = this._iframe = document.createElement("iframe");
                                                this._iframe.style.display = "none";
                                                this._iframe.src = "index.html";
                                                global.document.body.appendChild(this._iframe);
                                                this._global = this._iframe.contentWindow;
                                            }
                                            else if (Environment == Environments.Browser) {
                                            }
                                            else {
                                                this._target = this._worker = new Worker("DreamSpace.js");
                                            }
                                            break;
                                        case Contexts.Local:
                                            this._target = this._global = global;
                                            break;
                                    }
                                    break;
                            }
                            if (this._contextType == Contexts.Unsecure)
                                url = "/";
                            else
                                this._iframe.src = location.protocol + "//ctx" + (Math.random() * 0x7FFFFF | 0) + "." + location.hostname; // (all sub-domains go to the same location)
                        }
                        static [constructor](factory) {
                            factory.init = (o, isnew) => {
                            };
                        }
                    }
                    BrowserContext.$__type = $__type;
                    BrowserContext.$__register(HTML);
                })(BrowserContext = HTML.BrowserContext || (HTML.BrowserContext = {}));
                // ====================================================================================================================
                /** Represents the base of a DreamSpace UI object of various UI types. The default implementation extends this to implement HTML elements. */
                class HTMLNode extends FactoryBase(Platform.GraphNode) {
                    static 'new'(parent, id, name) { return null; }
                    static init(o, isnew, parent, id, name) {
                        this.super.init(o, isnew, parent);
                        if (id !== void 0 && id !== null)
                            o.id = id;
                        if (name !== void 0 && name !== null)
                            o.name = name;
                    }
                }
                HTML.HTMLNode = HTMLNode;
                (function (HTMLNode) {
                    class $__type extends FactoryType(Platform.GraphNode) {
                        constructor() {
                            // --------------------------------------------------------------------------------------------------------------------------
                            super(...arguments);
                            /** Represents the HTML element tag to use for this graph item.  The default value is set when a derived graph item is constructed.
                              * Not all objects support this property, and changing it is only valid BEFORE the layout is updated for the first time.
                              */
                            this.tagName = "NODE";
                            // --------------------------------------------------------------------------------------------------------------------------
                            /** The generated element for this HTMLelement graph node. */
                            this.__element = null;
                        }
                        // --------------------------------------------------------------------------------------------------------------------------
                        /** Detaches this GraphItem from the logical graph tree, but does not remove it from the parent's child list.
                         * Only call this function if you plan to manually remove the child from the parent.
                         */
                        detach() {
                            if (this.__parent && this.__parent.__element && this.__element)
                                this.__parent.__element.removeChild(this.__element);
                            return super.detach();
                        }
                        onRedraw(recursive = true) {
                            super.onRedraw(recursive);
                        }
                        /** Changes the type of element to create (if supported by the derived type), and returns the underlying graph instance.
                           * Changing this after a layout pass has already created elements will cause the existing element for this graph item to be deleted and replaced.
                           * WARNING: This is not supported by all derived types, and calling this AFTER a layout pass has created elements for those unsupported types may have no effect.
                           * For example, the UI 'PlaneText' graph item overrides 'createUIElement()' to return a node created from 'document.createTextNode()',
                           * and calling 'setHTMLTag("span")' will have no effect before OR after the first layout pass (this element will always be a text node).
                           * Some derived types that override 'createUIElement()' my provide special logic to accept only supported types.
                           */
                        setHTMLTag(htmlTag) {
                            this.tagName = htmlTag;
                            // .. if an element already exists, replace it if the tag is different ...
                            if (this.__element != null && this.__element.nodeName != this.tagName) {
                                this.updateLayout();
                            }
                            return this;
                        }
                        /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate supported element types. */
                        assertSupportedElementTypes(...args) {
                            this.tagName = (this.tagName || "").toLowerCase();
                            //??args = <string[]><any>arguments;
                            if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length)
                                args = args[0];
                            for (var i = 0; i < args.length; i++)
                                if (this.tagName == args[i])
                                    return true;
                            throw Exception.from("The element type '" + this.tagName + "' is not supported for this GraphItem type.");
                        }
                        /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate unsupported element types. */
                        assertUnsupportedElementTypes(...args) {
                            this.tagName = (this.tagName || "").toLowerCase();
                            //??args = <string[]><any>arguments;
                            if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length)
                                args = args[0];
                            for (var i = 0; i < args.length; i++)
                                if (this.tagName == args[i])
                                    throw Exception.from("The element type '" + this.tagName + "' is not supported for this GraphItem type.");
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        static [constructor](factory) {
                            //factory.init = (o, isnew) => {
                            //};
                        }
                    }
                    HTMLNode.$__type = $__type;
                    HTMLNode.$__register(HTML);
                })(HTMLNode = HTML.HTMLNode || (HTML.HTMLNode = {}));
                // ===================================================================================================================
                /** Represents an HTML node graph item that renders the content in the 'innerHTML of the default '__htmlTag' element (which is set to 'GraphItem.defaultHTMLTag' [DIV] initially).
                  * This object has no element restrictions, so you can create any element you need by setting the '__htmlTag' tag before the UI element gets created.
                  */
                class HTMLElement extends FactoryBase(HTMLNode) {
                    static 'new'(parent, id, name, tagName = "div", html) { return null; }
                    static init(o, isnew, parent, id, name, tagName = HTMLElement.defaultHTMLTagName, html) {
                        this.super.init(o, isnew, parent, id, name);
                        o.tagName = tagName;
                        o.set("innerHTML", html);
                        o.getProperty(HTMLElement.InnerHTML).registerListener((property, initialValue) => {
                            if (!initialValue || !o.__children.length) {
                                if (o.__children.length)
                                    o.removeAllChildren();
                                try {
                                    o['__htmlElement'].innerHTML = property.getValue();
                                }
                                catch (ex) { /*(setting inner HTML/text is not supported on this element [eg. <img> tags])*/ }
                            }
                        });
                    }
                }
                /** Each new graph item instance will initially set its '__htmlTag' property to this value. */
                HTMLElement.defaultHTMLTagName = "div";
                // ----------------------------------------------------------------------------------------------------------------
                /* When extending 'GraphItem' with additional observable properties, it is considered good practice to create a
                         * static type with a list of possible vales that can be set by end users (to promote code completion mechanisms).
                 */
                HTMLElement.ID = Platform.GraphNode.registerProperty(HTMLElement, "id");
                HTMLElement.Name = Platform.GraphNode.registerProperty(HTMLElement, "name");
                HTMLElement.Class = Platform.GraphNode.registerProperty(HTMLElement, "class", true);
                HTMLElement.Style = Platform.GraphNode.registerProperty(HTMLElement, "style", true);
                HTMLElement.InnerHTML = Platform.GraphNode.registerProperty(HTMLElement, "innerHTML", true);
                HTML.HTMLElement = HTMLElement;
                (function (HTMLElement) {
                    class $__type extends FactoryType(HTMLNode) {
                        get __htmlElement() { return this.__element; }
                        /** Sets a value on this HTML element object and returns the element (to allow chaining calls). If a DOM element is also
                          * associated it's attributes are updated with the specified value.
                          */
                        set(name, value) {
                            return this.setValue(name, value); // (triggers '_onPropertyValueSet()' in this class, which will update the attributes)
                        }
                        /**
                          * Gets a value on this HTML element object. Any associated DOM element is ignored if 'tryElement' is false (the default,
                          * which means only local values are returned). Set 'tryElement' to true to always read from the DOM element first, then
                          * fallback to reading locally.
                          *
                          * Local value reading is always the default because of possible DOM-to-JS bridge performance issues.
                          * For more information you can:
                          *   * See this book: https://goo.gl/DWKhJc (page 36 [Chapter 3])
                          *   * Read this article: https://calendar.perfplanet.com/2009/dom-access-optimization/
                          */
                        get(name, tryElement = false) {
                            if (tryElement && this.__htmlElement) {
                                var attr = this.__htmlElement.attributes.getNamedItem(name);
                                if (attr)
                                    return attr.value;
                            }
                            return this.getValue(name);
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        static [constructor](factory) {
                            //factory.init = (o, isnew) => {
                            //};
                        }
                    }
                    HTMLElement.$__type = $__type;
                    HTMLElement.$__register(HTML);
                })(HTMLElement = HTML.HTMLElement || (HTML.HTMLElement = {}));
                // ===================================================================================================================
                ///** Represents a basic anchor node graph item that renders a link. */
                //class $Anchor extends HTMLElement.$__type<HTMLAnchorElement> {
                //    // ----------------------------------------------------------------------------------------------------------------
                //    static HRef: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "href");
                //    static HRefLang: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "hreflang");
                //    static Type: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "type");
                //    static Rel: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "rel");
                //    //static Rev: IStaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "rev"); (not supported in HTML5)
                //    //static CharSet: IStaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "charset"); (not supported in HTML5)
                //    static Target: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "target");
                //    // ----------------------------------------------------------------------------------------------------------------
                //    href: string;
                //    hreflang: string;
                //    type: string;
                //    rel: string;
                //    //rev: (rev?: string) => string = GraphItem.accessor(Anchor.Rev);
                //    //charset: (charset?: string) => string = GraphItem.accessor(Anchor.CharSet);
                //    target: string;
                //    // ----------------------------------------------------------------------------------------------------------------
                //    protected static readonly '$Anchor Factory' = class Factory extends FactoryBase($Anchor, base['$HTMLElement Factory']) implements IFactory {
                //        'new'(parent: IGraphNode, name: string = "", href: string = "", html: string = ""): InstanceType<typeof Factory.$__type> { return null; }
                //        init(o: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: IGraphNode, name: string = "", href: string = "", html: string = "") {
                //            this.super.init($this, isnew, parent, "a", html);
                //            o.name = name;
                //            o.href = href;
                //            return o;
                //        }
                //    };
                //    // ----------------------------------------------------------------------------------------------------------------
                //    createUIElement(): Node {
                //        this.assertSupportedElementTypes("a");
                //        return super.createUIElement();
                //    }
                //    // ----------------------------------------------------------------------------------------------------------------
                //    onRedraw(recursive: boolean = true) {
                //        super.onRedraw(recursive);
                //    }
                //    // ----------------------------------------------------------------------------------------------------------------
                //}
                //export interface IAnchor extends $Anchor { }
                //export var Anchor = $Anchor['$Anchor Factory'].$__type;
                // ===================================================================================================================
                /**
                  * Represents a basic text node graph item that renders plain text (no HTML). For HTML use 'HTMLText'.
                  * This is inline with the standard which declares that all DOM elements with text should have text-ONLY nodes.
                  */
                class PlainText extends FactoryBase(HTMLNode) {
                    static 'new'(parent, text = "") { return null; }
                    static init(o, isnew, parent, text = "") { }
                }
                // -------------------------------------------------------------------------------------------------------------------------------
                PlainText.Text = Platform.GraphNode.registerProperty(PlainText, "text", true);
                HTML.PlainText = PlainText;
                (function (PlainText) {
                    class $__type extends FactoryType(HTMLNode) {
                        constructor() {
                            // --------------------------------------------------------------------------------------------------------------------------
                            super(...arguments);
                            this.text = Platform.GraphNode.accessor(PlainText.Text);
                        }
                        // --------------------------------------------------------------------------------------------------------------------------
                        createUIElement() {
                            this.assertSupportedElementTypes("", "Text");
                            return document.createTextNode("");
                        }
                        // --------------------------------------------------------------------------------------------------------------------------
                        onRedraw(recursive = true) {
                            super.onRedraw(recursive);
                        }
                        // --------------------------------------------------------------------------------------------------------------------------
                        static [constructor](factory) {
                            factory.init = (o, isnew, parent, text) => {
                                factory.super.init(o, isnew, parent);
                                o.text(text);
                                o.tagName = "";
                                o.getProperty(PlainText.Text).registerListener((property, initialValue) => {
                                    o.__element.data = property.getValue();
                                });
                            };
                        }
                    }
                    PlainText.$__type = $__type;
                    PlainText.$__register(HTML);
                })(PlainText = HTML.PlainText || (HTML.PlainText = {}));
                // ====================================================================================================================================
                /** Represents an HTML text node graph item that renders the content in the 'innerHTML of a SPAN element. For plain text nodes use 'PlainText'.
                  */
                class HTMLText extends FactoryBase(HTMLElement) {
                    static 'new'(parent, html = "") { return null; }
                    static init(o, isnew, parent, html = "") {
                        this.super.init(o, isnew, parent, html, void 0, 'span');
                    }
                }
                HTML.HTMLText = HTMLText;
                (function (HTMLText) {
                    class $__type extends FactoryType(HTMLElement) {
                        // ----------------------------------------------------------------------------------------------------------------
                        createUIElement() {
                            this.assertUnsupportedElementTypes("html", "head", "body", "script", "audio", "canvas", "object");
                            return super.createUIElement();
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        onRedraw(recursive = true) {
                            super.onRedraw(recursive);
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        static [constructor](factory) {
                            //factory.init = (o, isnew) => {
                            //};
                        }
                    }
                    HTMLText.$__type = $__type;
                    HTMLText.$__register(HTML);
                })(HTMLText = HTML.HTMLText || (HTML.HTMLText = {}));
                // ===================================================================================================================
                /** A list of text mark-up flags for use with phrase based elements. */
                let PhraseTypes;
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
                })(PhraseTypes = HTML.PhraseTypes || (HTML.PhraseTypes = {}));
                /** Represents a basic phrase node graph item that renders phrase elements (a term used by w3.org to describe adding
                  * "structural information to text fragments").  This is basically just text formatting in most cases.
                  * It's important to note the word "structural" here, as it is a suggestion on how to process text, but, unlike CSS,
                  * it does not dictate exactly HOW the text will actually look like. For instance, "<STRONG>" tags usually render as
                  * bold text, but someone can decide to color and increase font size instead using CSS for all such elements. This is
                  * actually a good thing, as it allows flexible web design in a way that can allow applying themes at a later time. */
                class Phrase extends FactoryBase(HTMLElement) {
                    static 'new'(parent, phraseTypeFlags = 0, html = "") { return null; }
                    static init(o, isnew, parent, phraseTypeFlags = 0, html = "") {
                        this.super.init(o, isnew, parent, html);
                        o.phraseType(phraseTypeFlags);
                        var pInfo = o.getProperty(HTMLElement.InnerHTML);
                        pInfo.registerFilter(o.createPhrase);
                    }
                }
                Phrase.PhraseType = Platform.GraphNode.registerProperty(Phrase, "phraseType", true);
                HTML.Phrase = Phrase;
                (function (Phrase) {
                    class $__type extends FactoryType(HTMLElement) {
                        constructor() {
                            // ----------------------------------------------------------------------------------------------------------------
                            super(...arguments);
                            this.phraseType = Platform.GraphNode.accessor(Phrase.PhraseType);
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        createUIElement() {
                            return super.createUIElement();
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        createPhrase(property, value) {
                            var leftTags = "", rightTags = "", phraseType = this.phraseType();
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
                            return leftTags + value + rightTags;
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        onRedraw(recursive = true) {
                            super.onRedraw(recursive); // (note: the innerHTML property will have been updated after this call to the 'html' property)
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        static [constructor](factory) {
                            //factory.init = (o, isnew) => {
                            //};
                        }
                    }
                    Phrase.$__type = $__type;
                    Phrase.$__register(HTML);
                })(Phrase = HTML.Phrase || (HTML.Phrase = {}));
                // ===================================================================================================================
                /** Represents an HTML header element.
                  */
                class Header extends FactoryBase(HTMLElement) {
                    static 'new'(parent, headerLevel = 1, html = "") { return null; }
                    static init(o, isnew, parent, headerLevel = 1, html = "") {
                        this.super.init(o, isnew, parent, html);
                        if (headerLevel < 1 || headerLevel > 6)
                            throw Exception.from("HTML only supports header levels 1 through 6.");
                        o.setValue(Header.HeaderLevel, headerLevel);
                    }
                }
                Header.HeaderLevel = Platform.GraphNode.registerProperty(Header, "headerLevel", true);
                HTML.Header = Header;
                (function (Header) {
                    class $__type extends FactoryType(HTMLElement) {
                        constructor() {
                            // ----------------------------------------------------------------------------------------------------------------
                            super(...arguments);
                            this.headerLevel = Platform.GraphNode.accessor(Header.HeaderLevel);
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        createUIElement() {
                            var headerLevel = this.getValue(Header.HeaderLevel);
                            if (headerLevel < 1 || headerLevel > 6)
                                throw Exception.from("HTML only supports header levels 1 through 6.");
                            this.tagName = "h" + headerLevel;
                            this.assertSupportedElementTypes("h1", "h2", "h3", "h4", "h5", "h6");
                            return super.createUIElement();
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        onRedraw(recursive = true) {
                            super.onRedraw(recursive);
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        static [constructor](factory) {
                            factory.init = (o, isnew) => {
                            };
                        }
                    }
                    Header.$__type = $__type;
                    Header.$__register(HTML);
                })(Header = HTML.Header || (HTML.Header = {}));
                // =====================================================================================================================================
                /** Parses HTML to create a graph object tree, and also returns any templates found.
                * This concept is similar to using XAML to load objects in WPF. As such, you have the option to use an HTML template, or dynamically build your
                * graph items directly in code.
                *
                * Warning about inline scripts: Script tags may be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
                * HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side (or client side for that matter) unless you
                * handle/execute the script code yourself.
                * @param {string} html The HTML to parse.
                * @param {boolean} strictMode If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
                * This can greatly help keep your html clean, AND identify possible areas of page errors.  If strict formatting is not important, pass in false.
                */
                function parse(html = null, strictMode) {
                    var log = Diagnostics.log(HTML, "Parsing HTML template ...").beginCapture();
                    log.write("Template: " + html);
                    if (!html)
                        return null;
                    // ... parsing is done by passing each new graph item the current scan position in a recursive pattern, until the end of the HTML text is found ...
                    var htmlReader = Markup.HTMLReader.new(html);
                    if (strictMode !== void 0)
                        htmlReader.strictMode = !!strictMode;
                    var approotID;
                    var mode = 0; // (0 = app scope not found yet, 1 = app root found, begin parsing application scope elements, 2 = creating objects)
                    var classMatch = /^[$.][A-Za-z0-9_$]*(\.[A-Za-z0-9_$]*)*(\s+|$)/;
                    var attribName;
                    var storeRunningText = (parent) => {
                        if (htmlReader.runningText) { // (if there is running text, then create a text node for it under the given parent node)
                            //?if (!host.isClient())
                            //?    HTMLElement.new(parent).setValue((htmlReader.runningText.indexOf('&') < 0 ? "text" : "html"), htmlReader.runningText); // (not for the UI, so doesn't matter)
                            //?else
                            if (htmlReader.runningText.indexOf('&') < 0)
                                PlainText.new(parent, htmlReader.runningText);
                            else
                                HTMLText.new(parent, htmlReader.runningText);
                        }
                    };
                    var rootElements = [];
                    var globalTemplatesReference = {};
                    var processTags = (parent) => {
                        var graphItemType, graphItemTypePrefix;
                        var nodeType;
                        var nodeItem;
                        var properties;
                        var currentTagName;
                        var isDataTemplate = false, dataTemplateID, dataTemplateHTML;
                        var tagStartIndex, lastTemplateIndex;
                        var templateInfo;
                        var templates = null;
                        var immediateChildTemplates = null;
                        while (htmlReader.readMode != Markup.HTMLReaderModes.End) {
                            currentTagName = htmlReader.tagName;
                            if (!htmlReader.isMarkupDeclaration() && !htmlReader.isCommentBlock() && !htmlReader.isScriptBlock() && !htmlReader.isStyleBlock()) {
                                if (currentTagName == "html") {
                                    // (The application root is a specification for the root of the WHOLE application, which is typically the body.  The developer should
                                    // specify the element ID for the root element in the 'data--approot' attribute of the <html> tag. [eg: <html data--approot='main'> ... <body id='main'>...]\
                                    // By default the app root will assume the body tag if not specified.)
                                    if (approotID === void 0)
                                        approotID = null; // (null flags that an HTML tag was found)
                                    if (htmlReader.attributeName == "data-approot" || htmlReader.attributeName == "data--approot") {
                                        approotID = htmlReader.attributeValue;
                                    }
                                }
                                else {
                                    // (note: app root starts at the body by default, unless a root element ID is given in the HTML tag before hand)
                                    if (htmlReader.readMode == Markup.HTMLReaderModes.Attribute) {
                                        // ... templates are stripped out for usage later ...
                                        if (!isDataTemplate && htmlReader.attributeName == "data--template") {
                                            isDataTemplate = true; // (will add to the template list instead of the final result)
                                            dataTemplateID = htmlReader.attributeValue;
                                        }
                                        attribName = (htmlReader.attributeName.substring(0, 6) != "data--") ? htmlReader.attributeName : htmlReader.attributeName.substring(6);
                                        properties[attribName] = htmlReader.attributeValue;
                                        if (htmlReader.attributeName == "id" && htmlReader.attributeValue == approotID && mode == 0)
                                            mode = 1;
                                    }
                                    else {
                                        if (mode == 2 && htmlReader.readMode == Markup.HTMLReaderModes.Tag && htmlReader.isClosingTag()) { // (this an ending tag (i.e. "</...>"))
                                            // (this end tag should be the "closure" to the recently created graph item sibling, which then sets 'graphiItem' to null, but if
                                            // it's already null, the end tag should be handled by the parent level (so if the parent tag finds it's own end tag, then we know
                                            // there's a problem); also, if the closing tag name is different (usually due to ill-formatted HTML [allowed only on parser override],
                                            // or auto-closing tags, like '<img>'), assume closure of the previous tag and let the parent handle it)
                                            if (nodeItem) {
                                                storeRunningText(nodeItem);
                                                if (isDataTemplate) {
                                                    dataTemplateHTML = htmlReader.getHTML().substring(tagStartIndex, htmlReader.textEndIndex) + ">";
                                                    templateInfo = { id: dataTemplateID, originalHTML: dataTemplateHTML, templateHTML: undefined, templateItem: nodeItem, childTemplates: immediateChildTemplates };
                                                    // (note: if there are immediate child templates, remove them from the current template text)
                                                    if (immediateChildTemplates)
                                                        for (var i = 0, n = immediateChildTemplates.length; i < n; i++) // TODO: The following can be optimized better (use start/end indexes).
                                                            dataTemplateHTML = dataTemplateHTML.replace(immediateChildTemplates[i].originalHTML, "<!--{{" + immediateChildTemplates[i].id + "Items}}-->");
                                                    templateInfo.templateHTML = dataTemplateHTML;
                                                    globalTemplatesReference[dataTemplateID] = templateInfo; // (all templates are recorded in application scope, so IDs must be unique, otherwise they will override previous ones)
                                                    if (!templates)
                                                        templates = [];
                                                    templates.push(templateInfo);
                                                    isDataTemplate = false;
                                                }
                                                if (htmlReader.tagName != nodeItem.tagName)
                                                    return templates; // (note: in ill-formatted html [optional feature of the parser], make sure the closing tag name is correct, else perform an "auto close and return")
                                                nodeType = null;
                                                nodeItem = null;
                                                immediateChildTemplates = null;
                                            }
                                            else
                                                return templates; // (return if this closing tag doesn't match the last opening tag read, so let the parent level handle it)
                                        }
                                        else if (mode == 2 && htmlReader.readMode == Markup.HTMLReaderModes.EndOfTag) { // (end of attributes, so create the tag graph item)
                                            // ... this is either the end of the tag with inner html/text, or a self ending tag (XML style) ...
                                            graphItemType = properties['class']; // (this may hold an explicit object type to create [note expected format: module.full.name.classname])
                                            nodeItem = null;
                                            nodeType = null;
                                            if (graphItemType && classMatch.test(graphItemType)) {
                                                graphItemTypePrefix = RegExp.lastMatch.substring(0, 1); // ('$' [DS full type name prefix], or '.' [default UI type name])
                                                if (graphItemTypePrefix == '$') {
                                                    graphItemType = RegExp.lastMatch.substring(1);
                                                    if (graphItemType.charAt(0) == '.') // (just in case there's a '.' after '$', allow this as well)
                                                        graphItemTypePrefix = '.';
                                                }
                                                else
                                                    graphItemType = RegExp.lastMatch; // (type is either a full type, or starts with '.' [relative])
                                                if (graphItemTypePrefix == '.')
                                                    graphItemType = "DreamSpace.System.UI" + graphItemType;
                                                var graphFactory = Platform.GraphNode['GraphNodeFactory'];
                                                nodeType = Utilities.dereferencePropertyPath(DreamSpace.Scripts.translateModuleTypeName(graphItemType), DreamSpace.$__parent);
                                                if (nodeType === void 0)
                                                    throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " was not found.");
                                                if (typeof nodeType !== 'function' || typeof HTMLElement.defaultHTMLTagName === void 0)
                                                    throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " does not resolve to a GraphItem class type.");
                                            }
                                            if (nodeType == null) {
                                                // ... auto detect the DreamSpace UI GraphNode type based on the tag name (all valid HTML4/5 tags: http://www.w3schools.com/tags/) ...
                                                switch (currentTagName) {
                                                    // (phrases)
                                                    case 'abbr':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Abbreviation;
                                                        break;
                                                    case 'acronym':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Acronym;
                                                        break;
                                                    case 'em':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Emphasis;
                                                        break;
                                                    case 'strong':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Strong;
                                                        break;
                                                    case 'cite':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Cite;
                                                        break;
                                                    case 'dfn':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Defining;
                                                        break;
                                                    case 'code':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Code;
                                                        break;
                                                    case 'samp':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Sample;
                                                        break;
                                                    case 'kbd':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Keyboard;
                                                        break;
                                                    case 'var':
                                                        nodeType = Phrase;
                                                        properties[Phrase.PhraseType.name] = PhraseTypes.Variable;
                                                        break;
                                                    // (headers)
                                                    case 'h1':
                                                        nodeType = Header;
                                                        properties[Header.HeaderLevel.name] = 1;
                                                        break;
                                                    case 'h2':
                                                        nodeType = Header;
                                                        properties[Header.HeaderLevel.name] = 2;
                                                        break;
                                                    case 'h3':
                                                        nodeType = Header;
                                                        properties[Header.HeaderLevel.name] = 3;
                                                        break;
                                                    case 'h4':
                                                        nodeType = Header;
                                                        properties[Header.HeaderLevel.name] = 4;
                                                        break;
                                                    case 'h5':
                                                        nodeType = Header;
                                                        properties[Header.HeaderLevel.name] = 5;
                                                        break;
                                                    case 'h6':
                                                        nodeType = Header;
                                                        properties[Header.HeaderLevel.name] = 6;
                                                        break;
                                                    default: nodeType = HTMLElement; // (just create a basic object to use with htmlReader.tagName)
                                                }
                                            }
                                            if (!nodeItem) { // (only create if not explicitly created)
                                                nodeItem = nodeType.new(isDataTemplate ? null : parent);
                                            }
                                            for (var pname in properties)
                                                nodeItem.setValue(pname, properties[pname], true);
                                            nodeItem.tagName = currentTagName;
                                            // ... some tags are not allowed to have children (and don't have to have closing tags, so null the graph item and type now)...
                                            switch (currentTagName) {
                                                case "area":
                                                case "base":
                                                case "br":
                                                case "col":
                                                case "command":
                                                case "embed":
                                                case "hr":
                                                case "img":
                                                case "input":
                                                case "keygen":
                                                case "link":
                                                case "meta":
                                                case "param":
                                                case "source":
                                                case "track":
                                                case "wbr":
                                                    nodeItem = null;
                                                    nodeType = null;
                                            }
                                            if (parent === null)
                                                rootElements.push(nodeItem);
                                        }
                                        else if (htmlReader.readMode == Markup.HTMLReaderModes.Tag) {
                                            if (mode == 1)
                                                mode = 2; // (begin creating on this tag that is AFTER the root app tag [i.e. since root is the "application" object itself])
                                            if (!nodeItem) {
                                                // ... no current 'graphItem' being worked on, so assume start of a new sibling tag (to be placed under the current parent) ...
                                                properties = {};
                                                tagStartIndex = htmlReader.textEndIndex; // (the text end index is the start of the next tag [html text sits between tags])
                                                if (mode == 2)
                                                    storeRunningText(parent);
                                            }
                                            else if (mode == 2) {
                                                // (note: each function call deals with a single nested level, and if a tag is not closed upon reading another, 'processTag' is called again because there may be many other nested tags before it can be closed)
                                                immediateChildTemplates = processTags(nodeItem); // ('graphItem' was just created for the last tag read, but the end tag is still yet to be read)
                                                // (the previous call will continue until an end tag is found, in which case it returns that tag to be handled by this parent level)
                                                if (htmlReader.tagName != nodeItem.tagName) // (the previous level should be parsed now, and the current tag should be an end tag that doesn't match anything in the immediate nested level, which should be the end tag for this parent tag)
                                                    throw Exception.from("The closing tag '</" + htmlReader.tagName + ">' was unexpected for current tag '<" + nodeItem.tagName + ">' on line " + htmlReader.getCurrentLineNumber() + ".");
                                                continue; // (need to continue on the last item read before returning)
                                            }
                                            if (currentTagName == "body" && !approotID)
                                                mode = 1; // (body was found, and the 'approotid' attribute was not specified, so assume body as the application's root element)
                                        }
                                    }
                                }
                            }
                            htmlReader.readNext();
                        }
                        return templates;
                    };
                    htmlReader.readNext(); // (move to the first item)
                    processTags(null);
                    log.write("HTML template parsing complete.").endCapture();
                    return { rootElements: rootElements, templates: globalTemplatesReference };
                }
                HTML.parse = parse;
                // ===================================================================================================================
            })(HTML = Platform.HTML || (Platform.HTML = {}));
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = DreamSpace.System || (DreamSpace.System = {}));
})(DreamSpace || (DreamSpace = {}));
//# sourceMappingURL=System.Platform.HTML.js.map