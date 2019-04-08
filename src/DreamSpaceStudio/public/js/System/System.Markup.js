"use strict";
// ############################################################################################################################
// Functions for working with HTML/XML.
// ############################################################################################################################
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains types and functions to deal with HTML markup textual data.
 */
// ========================================================================================================================
namespace(() => DreamSpace.System.Markup);
var HTMLReaderModes;
(function (HTMLReaderModes) {
    /** There's no more to read (end of HTML). */
    HTMLReaderModes[HTMLReaderModes["End"] = -1] = "End";
    /** Reading hasn't yet started. */
    HTMLReaderModes[HTMLReaderModes["NotStarted"] = 0] = "NotStarted";
    /** A tag was just read. The 'runningText' property holds the text prior to the tag, and the tag name is in 'tagName'. */
    HTMLReaderModes[HTMLReaderModes["Tag"] = 1] = "Tag";
    /** An attribute was just read from the last tag. The name will be placed in 'attributeName' and the value (if value) in 'attributeValue'.*/
    HTMLReaderModes[HTMLReaderModes["Attribute"] = 2] = "Attribute";
    /** An ending tag bracket was just read (no more attributes). */
    HTMLReaderModes[HTMLReaderModes["EndOfTag"] = 3] = "EndOfTag";
    /** A template token in the form '{{...}}' was just read. */
    HTMLReaderModes[HTMLReaderModes["TemplateToken"] = 4] = "TemplateToken";
})(HTMLReaderModes = exports.HTMLReaderModes || (exports.HTMLReaderModes = {}));
// ========================================================================================================================
/** Used to parse HTML text.
  * Performance note: Since HTML can be large, it's not efficient to scan the HTML character by character. Instead, the HTML reader uses the native
  * RegEx engine to split up the HTML into chunks of delimiter text, which makes reading it much faster.
  */
class HTMLReader extends FactoryBase(DSObject) {
    /**
         * Create a new HTMLReader instance to parse the given HTML text.
         * @param html The HTML text to parse.
         */
    static 'new'(html) { return null; }
    static init(o, isnew, html) { }
}
exports.HTMLReader = HTMLReader;
(function (HTMLReader) {
    class $__type extends FactoryType(DSObject) {
        constructor() {
            // -------------------------------------------------------------------------------------------------------------------
            super(...arguments);
            // (The RegEx above will identify areas that MAY need to delimited for parsing [not a guarantee].  The area outside of the delimiters is usually
            // defined by the delimiter types, so the delimiters are moved out into their own array for quick parsing [this also allows the host browser's native
            // environment to do much of the parsing instead of JavaScript].)
            this.partIndex = 0;
            /** The start index of the running text. */
            this.textStartIndex = 0;
            /** The end index of the running text. This is also the start index of the next tag, if any (since text runs between tags). */
            this.textEndIndex = 0; // (this advances with every read so text can be quickly extracted from the source HTML instead of adding array items [just faster]).
            this.__lastTextEndIndex = 0; // (for backing up from a read [see '__readNext()' && '__goBack()'])
            /** A list of text parts that correspond to each delimiter (i.e. TDTDT [T=Text, D=Delimiter]). */
            this.nonDelimiters = null;
            /** A list of the delimiters that correspond to each of the text parts (i.e. TDTDT [T=Text, D=Delimiter]). */
            this.delimiters = null;
            /** The text that was read. */
            this.text = "";
            /** The delimiter that was read. */
            this.delimiter = "";
            /** The text that runs between indexes 'textStartIndex' and 'textEndIndex-1' (inclusive). */
            this.runningText = "";
            /** The bracket sequence before the tag name, such as '<' or '</'. */
            this.tagBracket = "";
            /** The tag name, if a tag was read. */
            this.tagName = "";
            /** The attribute name, if attribute was read. */
            this.attributeName = "";
            /** The attribute value, if attribute was read. */
            this.attributeValue = "";
            this.readMode = Markup.HTMLReaderModes.NotStarted;
            /** If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
            * This can greatly help identify possible areas of page errors.
            */
            this.strictMode = true;
        }
        /** Returns true if tag current tag block is a mark-up declaration in the form "<!...>", where '...' is any text EXCEPT the start of a comment ('--'). */
        isMarkupDeclaration() {
            return this.readMode == Markup.HTMLReaderModes.Tag
                && this.tagName.length >= 4 && this.tagName.charAt(0) == '!' && this.tagName.charAt(1) != '-';
            //(spec reference and info on dashes: http://weblog.200ok.com.au/2008/01/dashing-into-trouble-why-html-comments.html)
        }
        /** Returns true if tag current tag block is a mark-up declaration representing a comment block in the form "<!--...-->", where '...' is any text. */
        isCommentBlock() {
            return this.readMode == Markup.HTMLReaderModes.Tag
                && this.tagName.length >= 7 && this.tagName.charAt(0) == '!' && this.tagName.charAt(1) == '-';
            ///^!--.*-->$/.test(...) (see http://jsperf.com/test-regex-vs-charat)
            //(spec reference and info on dashes: http://weblog.200ok.com.au/2008/01/dashing-into-trouble-why-html-comments.html)
        }
        /** Return true if the current tag block represents a script. */
        isScriptBlock() {
            return this.readMode == Markup.HTMLReaderModes.Tag
                && this.tagName.length >= 6 && this.tagName.charAt(0) == 's' && this.tagName.charAt(1) == 'c' && this.tagName.charAt(this.tagName.length - 1) == '>';
            // (tag is taken from pre - matched names, so no need to match the whole name)
        }
        /** Return true if the current tag block represents a style. */
        isStyleBlock() {
            return this.readMode == Markup.HTMLReaderModes.Tag
                && this.tagName.length >= 5 && this.tagName.charAt(0) == 's' && this.tagName.charAt(1) == 't' && this.tagName.charAt(this.tagName.length - 1) == '>';
            // (tag is taken from pre-matched names, so no need to match the whole name)
        }
        /** Returns true if the current position is a tag closure (i.e. '</', or '/>' [self-closing allowed for non-nestable tags]). */
        isClosingTag() {
            return this.readMode == Markup.HTMLReaderModes.Tag && this.tagBracket == '</' || this.readMode == Markup.HTMLReaderModes.EndOfTag && this.delimiter == '/>';
            // (match "<tag/>" [no inner html/text] and "</tag> [end of inner html/text])
        }
        /** Returns true if the current delimiter represents a template token in the form '{{....}}'. */
        isTempalteToken() {
            return this.delimiter.length > 2 && this.delimiter.charAt(0) == '{' && this.delimiter.charAt(1) == '{';
        }
        // ----------------------------------------------------------------------------------------------------------------
        getHTML() { return this.html; }
        __readNext() {
            if (this.partIndex >= this.nonDelimiters.length) {
                if (this.readMode != Markup.HTMLReaderModes.End) {
                    this.__lastTextEndIndex = this.textEndIndex;
                    this.textEndIndex += this.delimiter.length;
                    this.text = "";
                    this.delimiter = "";
                    this.readMode = Markup.HTMLReaderModes.End;
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
        __goBack() {
            this.partIndex--;
            this.textEndIndex = this.__lastTextEndIndex;
            this.text = this.nonDelimiters[this.partIndex];
            this.delimiter = this.partIndex < this.delimiters.length ? this.delimiters[this.partIndex] : "";
        }
        __reQueueDelimiter() {
            this.partIndex--;
            this.textEndIndex -= this.delimiter.length;
            this.nonDelimiters[this.partIndex] = ""; // (need to make sure not to read the text next time around on this same index point [may be an attribute, which would cause a cyclical read case])
        }
        /** If the current delimiter is whitespace, then this advances the reading (note: all whitespace will be grouped into one delimiter).
            * True is returned if whitespace (or an empty string) was found and skipped, otherwise false is returned, and no action was taken.
            * @param {boolean} onlyIfTextIsEmpty If true, advances past the whitespace delimiter ONLY if the preceding text read was also empty.  This can happen
            * if whitespace immediately follows another delimiter (such as space after a tag name).
            */
        __skipWhiteSpace(onlyIfTextIsEmpty = false) {
            if (this.readMode != Markup.HTMLReaderModes.End
                && (this.delimiter.length == 0 || this.delimiter.charCodeAt(0) <= 32)
                && (!onlyIfTextIsEmpty || !this.text)) {
                this.__readNext();
                return true;
            }
            else
                return false;
        }
        throwError(msg) {
            this.__readNext(); // (includes the delimiter and next text in the running text)
            throw Exception.from(msg + " on line " + this.getCurrentLineNumber() + ": <br/>\r\n" + this.getCurrentRunningText());
        }
        // -------------------------------------------------------------------------------------------------------------------
        /** Reads the next tag or attribute in the underlying html. */
        readNext() {
            this.textStartIndex = this.textEndIndex + this.delimiter.length;
            this.__readNext();
            if (this.readMode == Markup.HTMLReaderModes.Tag
                && this.tagBracket != '</' && this.tagName.charAt(this.tagName.length - 1) != ">" // (skip entire tag block delimiters, such as "<script></script>", "<style></style>", and "<!-- -->")
                || this.readMode == Markup.HTMLReaderModes.Attribute) {
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
                    this.readMode = Markup.HTMLReaderModes.Attribute;
                    return;
                }
                // ... no attribute found, so expect '/>', '>', or grouped whitespace ...
                this.__skipWhiteSpace(); // (skip any whitespace so end brackets can be verified)
                if (this.delimiter != '/>' && this.delimiter != '>')
                    this.throwError("A closing tag bracket is missing for tag '" + this.tagBracket + this.tagName + "'."); //??A valid attribute format (i.e. a, a=b, or a='b c', etc.) was expected
                this.readMode = Markup.HTMLReaderModes.EndOfTag;
                return;
            }
            this.__skipWhiteSpace(); // (will be ignored if no whitespace exists, otherwise the next non-whitespace delimiter will become available)
            // ... locate a valid tag or token ...
            // (note: 'this.arrayIndex == 0' after reading from the delimiter side)
            while (this.readMode != Markup.HTMLReaderModes.End) {
                if (this.delimiter.charAt(0) == '<') {
                    if (this.delimiter.charAt(1) == '/') {
                        this.tagBracket = this.delimiter.substring(0, 2);
                        this.tagName = this.delimiter.substring(2).toLocaleLowerCase();
                        break;
                    }
                    else {
                        this.tagBracket = this.delimiter.substring(0, 1);
                        this.tagName = this.delimiter.substring(1).toLocaleLowerCase();
                        break;
                    }
                }
                //else if (this.delimiter.length > 2 && this.delimiter.charAt(0) == '{' && this.delimiter.charAt(1) == '{') {
                //    this.readMode = Markup.HTMLReaderModes.TemplateToken;
                //    break;
                //}
                this.__readNext();
            }
            ;
            if (this.readMode != Markup.HTMLReaderModes.End) {
                this.runningText = this.getCurrentRunningText();
                this.readMode = Markup.HTMLReaderModes.Tag;
                // ... do a quick look ahead if on an end tag to verify closure ...
                if (this.tagBracket == '</') {
                    this.__readNext();
                    this.__skipWhiteSpace();
                    if (this.delimiter != '>')
                        this.throwError("Invalid end for tag '" + this.tagBracket + this.tagName + "' ('>' was expected).");
                }
            }
            else
                this.tagName = "";
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
        static [constructor](factory) {
            factory.init = (o, isnew, html) => {
                factory.super.init(o, isnew);
                // ... using RegEx allows the native browser system to split up the HTML text into parts that can be consumed more quickly ...
                o.html = html;
                o.delimiters = html.match($__type.__splitRegEx); // (get delimiters [inverse of 'split()'])
                o.nonDelimiters = o.html.split($__type.__splitRegEx, void 0, o.delimiters); // (get text parts [inverse of 'match()']; last argument is ignored on newer systems [see related polyfill in DreamSpace.Browser])
            };
        }
    }
    $__type.__splitRegEx = /<!(?:--[\S\s]*?--)?[\S\s]*?>|<script\b[\S\s]*?<\/script[\S\s]*?>|<style\b[\S\s]*?<\/style[\S\s]*?>|<\![A-Z0-9]+|<\/[A-Z0-9]+|<[A-Z0-9]+|\/?>|&[A-Z]+;?|&#[0-9]+;?|&#x[A-F0-9]+;?|(?:'[^<>]*?'|"[^<>]*?")|=|\s+|\{\{[^\{\}]*?\}\}/gi;
    HTMLReader.$__type = $__type;
    HTMLReader.$__register(Markup);
})(HTMLReader = exports.HTMLReader || (exports.HTMLReader = {}));
// ========================================================================================================================
//# sourceMappingURL=System.Markup.js.map