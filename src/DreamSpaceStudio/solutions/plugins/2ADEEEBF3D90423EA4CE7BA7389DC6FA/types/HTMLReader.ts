
// ############################################################################################################################
// Globals type for working with HTML/XML.
// ############################################################################################################################

enum HTMLReaderModes {
    /** There's no more to read (end of HTML). */
    End = -1,
    /** Reading hasn't yet started. */
    NotStarted,
    /** A tag was just read. The 'runningText' property holds the text prior to the tag, and the tag name is in 'tagName'. */
    Tag,
    /** An attribute was just read from the last tag. The name will be placed in 'attributeName' and the value (if value) in 'attributeValue'.*/
    Attribute,
    /** An ending tag bracket was just read (no more attributes). */
    EndOfTag,
    /** A template token in the form '{{...}}' was just read. */
    TemplateToken
}

// ============================================================================================================================

/** Used to parse HTML text.
  * Performance note: Since HTML can be large, it's not efficient to scan the HTML character by character. Instead, the HTML
  * reader uses the native RegEx engine to split up the HTML into chunks of delimiter text, which makes reading it much faster.
  */
class HTMLReader {
    constructor(html: string) {
        // ... using RegEx allows the native browser system to split up the HTML text into parts that can be consumed more quickly ...
        this.html = html;
        this.delimiters = html.match(HTMLReader.__splitRegEx); // (get delimiters [inverse of 'split()'])
        this.nonDelimiters = (<any>this.html).split(HTMLReader.__splitRegEx, void 0, this.delimiters); // (get text parts [inverse of 'match()']; last argument is ignored on newer systems [see related polyfill in DreamSpace.Browser])
    }

    // -------------------------------------------------------------------------------------------------------------------

    private static __splitRegEx: RegExp = /<!(?:--[\S\s]*?--)?[\S\s]*?>|<script\b[\S\s]*?<\/script[\S\s]*?>|<style\b[\S\s]*?<\/style[\S\s]*?>|<\![A-Z0-9]+|<\/[A-Z0-9]+|<[A-Z0-9]+|\/?>|&[A-Z]+;?|&#[0-9]+;?|&#x[A-F0-9]+;?|(?:'[^<>]*?'|"[^<>]*?")|=|\s+|\{\{[^\{\}]*?\}\}/gi;

    // (The RegEx above will identify areas that MAY need to delimited for parsing [not a guarantee].  The area outside of the delimiters is usually
    // defined by the delimiter types, so the delimiters are moved out into their own array for quick parsing [this also allows the host browser's native
    // environment to do much of the parsing instead of JavaScript].)

    partIndex: number = 0;

    /** The start index of the running text. */
    textStartIndex: number = 0;
    /** The end index of the running text. This is also the start index of the next tag, if any (since text runs between tags). */
    textEndIndex: number = 0; // (this advances with every read so text can be quickly extracted from the source HTML instead of adding array items [just faster]).
    __lastTextEndIndex: number = 0; // (for backing up from a read [see '__readNext()' && '__goBack()'])

    /** A list of text parts that correspond to each delimiter (i.e. TDTDT [T=Text, D=Delimiter]). */
    nonDelimiters: string[] = null;
    /** A list of the delimiters that correspond to each of the text parts (i.e. TDTDT [T=Text, D=Delimiter]). */
    delimiters: string[] = null;

    /** The text that was read. */
    text: string = "";
    /** The delimiter that was read. */
    delimiter: string = "";
    /** The text that runs between indexes 'textStartIndex' and 'textEndIndex-1' (inclusive). */
    runningText: string = "";
    /** The bracket sequence before the tag name, such as '<' or '</'. */
    tagBracket: string = "";
    /** The tag name, if a tag was read. */
    tagName: string = "";
    /** The attribute name, if attribute was read. */
    attributeName: string = "";
    /** The attribute value, if attribute was read. */
    attributeValue: string = "";

    readMode: HTMLReaderModes = HTMLReaderModes.NotStarted;

    /** If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
    * This can greatly help identify possible areas of page errors.
    */
    strictMode: boolean = true;

    /** Returns true if tag current tag block is a mark-up declaration in the form "<!...>", where '...' is any text EXCEPT the start of a comment ('--'). */
    isMarkupDeclaration() {
        return this.readMode == HTMLReaderModes.Tag
            && this.tagName.length >= 4 && this.tagName.charAt(0) == '!' && this.tagName.charAt(1) != '-';
        //(spec reference and info on dashes: http://weblog.200ok.com.au/2008/01/dashing-into-trouble-why-html-comments.html)
    }

    /** Returns true if tag current tag block is a mark-up declaration representing a comment block in the form "<!--...-->", where '...' is any text. */
    isCommentBlock() {
        return this.readMode == HTMLReaderModes.Tag
            && this.tagName.length >= 7 && this.tagName.charAt(0) == '!' && this.tagName.charAt(1) == '-';
        ///^!--.*-->$/.test(...) (see http://jsperf.com/test-regex-vs-charat)
        //(spec reference and info on dashes: http://weblog.200ok.com.au/2008/01/dashing-into-trouble-why-html-comments.html)
    }

    /** Return true if the current tag block represents a script. */
    isScriptBlock() {
        return this.readMode == HTMLReaderModes.Tag
            && this.tagName.length >= 6 && this.tagName.charAt(0) == 's' && this.tagName.charAt(1) == 'c' && this.tagName.charAt(this.tagName.length - 1) == '>';
        // (tag is taken from pre - matched names, so no need to match the whole name)
    }

    /** Return true if the current tag block represents a style. */
    isStyleBlock() {
        return this.readMode == HTMLReaderModes.Tag
            && this.tagName.length >= 5 && this.tagName.charAt(0) == 's' && this.tagName.charAt(1) == 't' && this.tagName.charAt(this.tagName.length - 1) == '>';
        // (tag is taken from pre-matched names, so no need to match the whole name)
    }

    /** Returns true if the current position is a tag closure (i.e. '</', or '/>' [self-closing allowed for non-nestable tags]). */
    isClosingTag() {
        return this.readMode == HTMLReaderModes.Tag && this.tagBracket == '</' || this.readMode == HTMLReaderModes.EndOfTag && this.delimiter == '/>';
        // (match "<tag/>" [no inner html/text] and "</tag> [end of inner html/text])
    }

    /** Returns true if the current delimiter represents a template token in the form '{{....}}'. */
    isTempalteToken() {
        return this.delimiter.length > 2 && this.delimiter.charAt(0) == '{' && this.delimiter.charAt(1) == '{';
    }

    // ----------------------------------------------------------------------------------------------------------------

    private html: string;

    // ----------------------------------------------------------------------------------------------------------------

    getHTML(): string { return this.html; }

    private __readNext() { // (if peek is true, the part index doesn't update upon return)
        if (this.partIndex >= this.nonDelimiters.length) {
            if (this.readMode != HTMLReaderModes.End) {
                this.__lastTextEndIndex = this.textEndIndex;
                this.textEndIndex += this.delimiter.length;
                this.text = "";
                this.delimiter = "";
                this.readMode = HTMLReaderModes.End;
            }
        }
        else {
            this.text = this.nonDelimiters[this.partIndex];
            this.__lastTextEndIndex = this.textEndIndex;
            this.textEndIndex += this.delimiter.length + this.text.length; // (add last delimiter length and the current text length)
            this.delimiter = this.partIndex < this.delimiters.length ? this.delimiters[this.partIndex] : "";
            this.partIndex++;
        }
    }

    private __goBack() {
        this.partIndex--;
        this.textEndIndex = this.__lastTextEndIndex;
        this.text = this.nonDelimiters[this.partIndex];
        this.delimiter = this.partIndex < this.delimiters.length ? this.delimiters[this.partIndex] : "";
    }

    private __reQueueDelimiter() { // (used to keep the current text and delimiter, but re-read the same part index position again on next pass)
        this.partIndex--;
        this.textEndIndex -= this.delimiter.length;
        this.nonDelimiters[this.partIndex] = ""; // (need to make sure not to read the text next time around on this same index point [may be an attribute, which would cause a cyclical read case])
    }

    /** If the current delimiter is whitespace, then this advances the reading (note: all whitespace will be grouped into one delimiter).
        * True is returned if whitespace (or an empty string) was found and skipped, otherwise false is returned, and no action was taken.
        * @param {boolean} onlyIfTextIsEmpty If true, advances past the whitespace delimiter ONLY if the preceding text read was also empty.  This can happen
        * if whitespace immediately follows another delimiter (such as space after a tag name).
        */
    private __skipWhiteSpace(onlyIfTextIsEmpty: boolean = false): boolean {
        if (this.readMode != HTMLReaderModes.End
            && (this.delimiter.length == 0 || this.delimiter.charCodeAt(0) <= 32)
            && (!onlyIfTextIsEmpty || !this.text)) {
            this.__readNext();
            return true;
        }
        else return false;
    }

    throwError(msg: string) {
        this.__readNext(); // (includes the delimiter and next text in the running text)
        throw Exception.from(msg + " on line " + this.getCurrentLineNumber() + ": <br/>\r\n" + this.getCurrentRunningText());
    }

    // -------------------------------------------------------------------------------------------------------------------

    /** Reads the next tag or attribute in the underlying html. */
    readNext() {
        this.textStartIndex = this.textEndIndex + this.delimiter.length;
        this.__readNext();

        if (this.readMode == HTMLReaderModes.Tag
            && this.tagBracket != '</' && this.tagName.charAt(this.tagName.length - 1) != ">" // (skip entire tag block delimiters, such as "<script></script>", "<style></style>", and "<!-- -->")
            || this.readMode == HTMLReaderModes.Attribute) {

            this.__skipWhiteSpace(true);

            // Valid formats supported: <TAG A 'B' C=D E='F' 'G'=H 'I'='J' K.L = MNO P.Q="RS" />
            // (note: user will be notified of invalid formatting)
            this.attributeName = this.text.toLocaleLowerCase();

            var isAttributeValueQuoted = false;

            if (this.attributeName) {
                // (and attribute exists, so '=', '/>', '>', or whitespace should follow)
                if (this.delimiter == '=') {
                    // ('=' exists, so a valid value should exist)
                    this.__readNext(); // (advance to the next part)
                    this.__skipWhiteSpace(true); // (skip ahead one more if on whitespace AND empty text ['a= b', where the space delimiter has empty text, vs 'a=b ', where the space delimiter as text 'b'])

                    isAttributeValueQuoted = this.delimiter.charAt(0) == '"' || this.delimiter.charAt(0) == "'";
                    this.attributeValue = isAttributeValueQuoted ? this.delimiter : this.text;
                    // (if quotes are used, the delimiter will contain the value, otherwise the value is the text)

                    if (this.strictMode && this.attributeValue == "")
                        this.throwError("Attribute '" + this.attributeName + "' is missing a value (use =\"\" to denote empty attribute values).");
                    // .. strip any quotes to get the value ...
                    if (this.attributeValue.length >= 2 && (this.attributeValue.charAt(0) == "'" || this.attributeValue.charAt(0) == '"'))
                        this.attributeValue = this.attributeValue.substring(1, this.attributeValue.length - 1);
                }

                // ... only an end bracket sequence ('>' or '/>') or whitespace should exist next at this point (white space if there's more attributes to follow)...
                // (note: quoted attribute values are delimiters, so there's no need to check the delimiter if so at this point)
                if (!isAttributeValueQuoted) {
                    if (this.delimiter != '/>' && this.delimiter != '>' && this.delimiter.charCodeAt(0) > 32)
                        this.throwError("A closing tag bracket or whitespace is missing after the attribute '" + this.attributeName + (this.attributeValue ? "=" + this.attributeValue : "") + "'");

                    this.__reQueueDelimiter(); // (clears the text part and backs up the parts index for another read to properly close off the tag on the next read)
                }

                this.readMode = HTMLReaderModes.Attribute;

                return;
            }

            // ... no attribute found, so expect '/>', '>', or grouped whitespace ...

            this.__skipWhiteSpace(); // (skip any whitespace so end brackets can be verified)

            if (this.delimiter != '/>' && this.delimiter != '>')
                this.throwError("A closing tag bracket is missing for tag '" + this.tagBracket + this.tagName + "'."); //??A valid attribute format (i.e. a, a=b, or a='b c', etc.) was expected

            this.readMode = HTMLReaderModes.EndOfTag;
            return;
        }

        this.__skipWhiteSpace(); // (will be ignored if no whitespace exists, otherwise the next non-whitespace delimiter will become available)

        // ... locate a valid tag or token ...
        // (note: 'this.arrayIndex == 0' after reading from the delimiter side)
        while (this.readMode != HTMLReaderModes.End) {
            if (this.delimiter.charAt(0) == '<') {
                if (this.delimiter.charAt(1) == '/') { this.tagBracket = this.delimiter.substring(0, 2); this.tagName = this.delimiter.substring(2).toLocaleLowerCase(); break; }
                else { this.tagBracket = this.delimiter.substring(0, 1); this.tagName = this.delimiter.substring(1).toLocaleLowerCase(); break; }
            }
            //else if (this.delimiter.length > 2 && this.delimiter.charAt(0) == '{' && this.delimiter.charAt(1) == '{') {
            //    this.readMode = Markup.HTMLReaderModes.TemplateToken;
            //    break;
            //}
            this.__readNext();
        };

        if (this.readMode != HTMLReaderModes.End) {
            this.runningText = this.getCurrentRunningText();
            this.readMode = HTMLReaderModes.Tag;

            // ... do a quick look ahead if on an end tag to verify closure ...

            if (this.tagBracket == '</') {
                this.__readNext();
                this.__skipWhiteSpace();
                if (this.delimiter != '>')
                    this.throwError("Invalid end for tag '" + this.tagBracket + this.tagName + "' ('>' was expected).");
            }
        }
        else this.tagName = "";
    }

    // -------------------------------------------------------------------------------------------------------------------

    getCurrentRunningText() {
        return this.html.substring(this.textStartIndex, this.textEndIndex);
    }

    getCurrentLineNumber() {
        for (var ln = 1, i = this.textEndIndex - 1; i >= 0; --i)
            if (this.html.charCodeAt(i) == 10) // (LF at the very least; see https://en.wikipedia.org/wiki/Newline#Representations)
                ++ln;
        return ln;
    }

    // -------------------------------------------------------------------------------------------------------------------
}

interface IHTMLReader extends HTMLReader { }

namespace DS {
    export namespace HTML {
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
        export function parse(html: string = null, strictMode?: boolean): { rootElements: IGraphNode[]; templates: { [id: string]: IDataTemplate; } } {
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
                var nodeType: { new(...args: any[]): any };
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

                                        if (typeof nodeType !== 'function' || typeof VDOM.HTMLElement.defaultHTMLTagName === void 0)
                                            throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " does not resolve to a GraphItem class type.");
                                    }

                                    if (nodeType == null) {
                                        // ... auto detect the DreamSpace UI GraphNode type based on the tag name (all valid HTML4/5 tags: http://www.w3schools.com/tags/) ...
                                        switch (currentTagName) {
                                            // (phrases)
                                            case 'abbr': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Abbreviation; break;
                                            case 'acronym': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Acronym; break;
                                            case 'em': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Emphasis; break;
                                            case 'strong': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Strong; break;
                                            case 'cite': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Cite; break;
                                            case 'dfn': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Defining; break;
                                            case 'code': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Code; break;
                                            case 'samp': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Sample; break;
                                            case 'kbd': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Keyboard; break;
                                            case 'var': nodeType = VDOM.HTMLElement; properties[Phrase.PhraseType.name] = PhraseTypes.Variable; break;

                                            // (headers)
                                            case 'h1': nodeType = VDOM.HTMLElement; properties[Header.HeaderLevel.name] = 1; break;
                                            case 'h2': nodeType = VDOM.HTMLElement; properties[Header.HeaderLevel.name] = 2; break;
                                            case 'h3': nodeType = VDOM.HTMLElement; properties[Header.HeaderLevel.name] = 3; break;
                                            case 'h4': nodeType = VDOM.HTMLElement; properties[Header.HeaderLevel.name] = 4; break;
                                            case 'h5': nodeType = VDOM.HTMLElement; properties[Header.HeaderLevel.name] = 5; break;
                                            case 'h6': nodeType = VDOM.HTMLElement; properties[Header.HeaderLevel.name] = 6; break;

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

        // ===================================================================================================================
    }
}