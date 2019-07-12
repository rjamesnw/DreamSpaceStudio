
// =====================================================================================================================================

interface IHTMLParseResult { rootElements: IGraphNode[]; templates: { [id: string]: IDataTemplate; } }

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
function parse(html: string = null, strictMode?: boolean): IHTMLParseResult {
    var log = Diagnostics.log(HTML, "Parsing HTML template ...").beginCapture();
    log.write("Template: " + html);

    if (!html) return null;

    // ... parsing is done by passing each new graph item the current scan position in a recursive pattern, until the end of the HTML text is found ...
    var htmlReader = HTMLReader.new(html);
    if (strictMode !== void 0)
        htmlReader.strictMode = !!strictMode;

    var approotID: string;
    var mode: number = 0; // (0 = app scope not found yet, 1 = app root found, begin parsing application scope elements, 2 = creating objects)
    var classMatch = /^[$.][A-Za-z0-9_$]*(\.[A-Za-z0-9_$]*)*(\s+|$)/;
    var attribName: string;

    var storeRunningText = (parent: IGraphNode) => {
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

    var rootElements: IGraphNode[] = [];
    var globalTemplatesReference: { [id: string]: IDataTemplate; } = {};

    type TNodeFactoryType = { new: (parent: IGraphNode, ...args: any[]) => IHTMLNode };

    var processTags = (parent: IGraphNode): IDataTemplate[] => { // (returns the data templates found for the immediate children only)
        var graphItemType: string, graphItemTypePrefix: string;
        var nodeType: TNodeFactoryType;
        var nodeItem: IHTMLNode;
        var properties: IndexedObject;
        var currentTagName: string;
        var isDataTemplate: boolean = false, dataTemplateID: string, dataTemplateHTML: string;
        var tagStartIndex: number, lastTemplateIndex: number;
        var templateInfo: IDataTemplate;
        var templates: IDataTemplate[] = null;
        var immediateChildTemplates: IDataTemplate[] = null;

        while (htmlReader.readMode != HTMLReaderModes.End) {

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

                    if (htmlReader.readMode == HTMLReaderModes.Attribute) {

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
                        if (mode == 2 && htmlReader.readMode == HTMLReaderModes.Tag && htmlReader.isClosingTag()) { // (this an ending tag (i.e. "</...>"))
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
                                        for (var i = 0, n = immediateChildTemplates.length; i < n; i++)  // TODO: The following can be optimized better (use start/end indexes).
                                            dataTemplateHTML = dataTemplateHTML.replace(immediateChildTemplates[i].originalHTML, "<!--{{" + immediateChildTemplates[i].id + "Items}}-->");
                                    templateInfo.templateHTML = dataTemplateHTML;
                                    globalTemplatesReference[dataTemplateID] = templateInfo; // (all templates are recorded in application scope, so IDs must be unique, otherwise they will override previous ones)
                                    if (!templates) templates = [];
                                    templates.push(templateInfo);
                                    isDataTemplate = false;
                                }

                                if (htmlReader.tagName != nodeItem.tagName)
                                    return templates; // (note: in ill-formatted html [optional feature of the parser], make sure the closing tag name is correct, else perform an "auto close and return")

                                nodeType = null;
                                nodeItem = null;
                                immediateChildTemplates = null;
                            }
                            else return templates; // (return if this closing tag doesn't match the last opening tag read, so let the parent level handle it)
                        }
                        else if (mode == 2 && htmlReader.readMode == HTMLReaderModes.EndOfTag) { // (end of attributes, so create the tag graph item)

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
                                } else
                                    graphItemType = RegExp.lastMatch; // (type is either a full type, or starts with '.' [relative])

                                if (graphItemTypePrefix == '.')
                                    graphItemType = "DreamSpace.System.UI" + graphItemType;

                                //? var graphFactory = GraphNode;
                                nodeType = <TNodeFactoryType>Utilities.dereferencePropertyPath(translateModuleTypeName(graphItemType));

                                if (nodeType === void 0)
                                    throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " was not found.");

                                if (typeof nodeType !== 'function' || typeof HTMLElement.defaultHTMLTagName === void 0)
                                    throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " does not resolve to a GraphItem class type.");
                            }

                            if (nodeType == null) {
                                // ... auto detect the DreamSpace UI GraphNode type based on the tag name (all valid HTML4/5 tags: http://www.w3schools.com/tags/) ...
                                switch (currentTagName) {
                                    // (phrases)
                                    case 'abbr': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Abbreviation; break;
                                    case 'acronym': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Acronym; break;
                                    case 'em': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Emphasis; break;
                                    case 'strong': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Strong; break;
                                    case 'cite': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Cite; break;
                                    case 'dfn': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Defining; break;
                                    case 'code': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Code; break;
                                    case 'samp': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Sample; break;
                                    case 'kbd': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Keyboard; break;
                                    case 'var': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Variable; break;

                                    // (headers)
                                    case 'h1': nodeType = Header; properties[Header.HeaderLevel.name] = 1; break;
                                    case 'h2': nodeType = Header; properties[Header.HeaderLevel.name] = 2; break;
                                    case 'h3': nodeType = Header; properties[Header.HeaderLevel.name] = 3; break;
                                    case 'h4': nodeType = Header; properties[Header.HeaderLevel.name] = 4; break;
                                    case 'h5': nodeType = Header; properties[Header.HeaderLevel.name] = 5; break;
                                    case 'h6': nodeType = Header; properties[Header.HeaderLevel.name] = 6; break;

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
                                case "area": case "base": case "br": case "col": case "command": case "embed": case "hr": case "img": case "input":
                                case "keygen": case "link": case "meta": case "param": case "source": case "track": case "wbr":
                                    nodeItem = null;
                                    nodeType = null;
                            }

                            if (parent === null)
                                rootElements.push(nodeItem);
                        }
                        else if (htmlReader.readMode == HTMLReaderModes.Tag) {
                            if (mode == 1) mode = 2; // (begin creating on this tag that is AFTER the root app tag [i.e. since root is the "application" object itself])

                            if (!nodeItem) {
                                // ... no current 'graphItem' being worked on, so assume start of a new sibling tag (to be placed under the current parent) ...
                                properties = {};
                                tagStartIndex = htmlReader.textEndIndex; // (the text end index is the start of the next tag [html text sits between tags])
                                if (mode == 2)
                                    storeRunningText(parent);
                            } else if (mode == 2) {
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
