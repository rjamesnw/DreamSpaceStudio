export declare enum HTMLReaderModes {
    /** There's no more to read (end of HTML). */
    End = -1,
    /** Reading hasn't yet started. */
    NotStarted = 0,
    /** A tag was just read. The 'runningText' property holds the text prior to the tag, and the tag name is in 'tagName'. */
    Tag = 1,
    /** An attribute was just read from the last tag. The name will be placed in 'attributeName' and the value (if value) in 'attributeValue'.*/
    Attribute = 2,
    /** An ending tag bracket was just read (no more attributes). */
    EndOfTag = 3,
    /** A template token in the form '{{...}}' was just read. */
    TemplateToken = 4
}
/** Used to parse HTML text.
* Performance note: Since HTML can be large, it's not efficient to scan the HTML character by character. Instead, the HTML reader uses the native
* RegEx engine to split up the HTML into chunks of delimiter text, which makes reading it much faster.
*/
export default class HTMLReader {
    private html;
    private static __splitRegEx;
    partIndex: number;
    /** The start index of the running text. */
    textStartIndex: number;
    /** The end index of the running text. */
    textEndIndex: number;
    __lastTextEndIndex: number;
    /** A list of text parts that correspond to each delimiter (i.e. TDTDT [T=Text, D=Delimiter]). */
    nonDelimiters: string[];
    /** A list of the delimiters that correspond to each of the text parts (i.e. TDTDT [T=Text, D=Delimiter]). */
    delimiters: string[];
    /** The text that was read. */
    text: string;
    /** The delimiter that was read. */
    delimiter: string;
    /** The text that runs between indexes 'textStartIndex' and 'textEndIndex-1' (inclusive). */
    runningText: string;
    /** The bracket sequence before the tag name, such as '<' or '</'. */
    tagBracket: string;
    /** The tag name, if a tag was read. */
    tagName: string;
    /** The attribute name, if attribute was read. */
    attributeName: string;
    /** The attribute value, if attribute was read. */
    attributeValue: string;
    readMode: HTMLReaderModes;
    /** If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
    * This can greatly help identify possible areas of page errors.
    */
    strictMode: boolean;
    /** Returns true if tag current tag block is a mark-up declaration in the form "<!...>", where '...' is any text EXCEPT the start of a comment ('--'). */
    isMarkupDeclaration(): boolean;
    /** Returns true if tag current tag block is a mark-up declaration representing a comment block in the form "<!--...-->", where '...' is any text. */
    isCommentBlock(): boolean;
    /** Return true if the current tag block represents a script. */
    isScriptBlock(): boolean;
    /** Return true if the current tag block represents a style. */
    isStyleBlock(): boolean;
    /** Returns true if the current position is a tag closure (i.e. '</', or '/>' [self closing allowed for non-nestable tags]). */
    isClosingTag(): boolean;
    /** Returns true if the current delimiter represents a template token in the form '{{....}}'. */
    isTempalteToken(): boolean;
    constructor(html: string);
    getHTML(): string;
    private __readNext;
    private __goBack;
    private __reQueueDelimiter;
    /** If the current delimiter is whitespace, then this advances the reading (note: all whitespace will be grouped into one delimiter).
    * True is returned if whitespace (or an empty string) was found and skipped, otherwise false is returned, and no action was taken.
    * @param {boolean} onlyIfTextIsEmpty If true, advances past the whitespace delimiter ONLY if the preceding text read was also empty.  This can happen
    * if whitespace immediately follows another delimiter (such as space after a tag name).
    */
    private __skipWhiteSpace;
    throwError(msg: string): void;
    /** Reads the next tag or attribute in the underlying html. */
    readNext(): void;
    getCurrentRunningText(): string;
    getCurrentLineNumber(): number;
}
