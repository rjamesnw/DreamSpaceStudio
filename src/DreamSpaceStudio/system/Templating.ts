namespace DS {
    export namespace VDOM {
        /** Holds special types used with parsing HTML templates. */
        export namespace Templating {

            /** A list of text mark-up flags for use with phrase based elements. */
            export enum PhraseTypes {
                /** Indicates emphasis. */
                Emphasis = 1,
                /** Indicates stronger emphasis. */
                Strong = 2,
                /** Contains a citation or a reference to other sources. */
                Cite = 4,
                /** Indicates that this is the defining instance of the enclosed term. */
                Defining = 8,
                /** Designates a fragment of computer code. */
                Code = 16,
                /** Designates sample output from programs, scripts, etc. */
                Sample = 32,
                /** Indicates text to be entered by the user. */
                Keyboard = 64,
                /** Indicates an instance of a variable or program argument. */
                Variable = 128,
                /** Indicates an abbreviated form (Example: WWW, HTTP, URI, AI, e.g., ex., etc., ...). */
                Abbreviation = 256,
                /** Indicates an acronym (Example: WAC, radar, NASA, laser, sonar, ...). */
                Acronym = 512
            }

            export abstract class TemplateElement extends HTMLElement {
                constructor(
                    /** The node name.*/
                    nodeName = HTMLElement.defaultHTMLTagName,
                    /** The node type.*/
                    nodeType = NodeTypes.ELEMENT_NODE,
                    /** The element attributes.*/
                    attributes?: { [index: string]: string },
                    /** The element CSS classes.*/
                    public className?: string,
                    /** The element namespace prefix.*/
                    public prefix?: string
                ) { super(nodeName, nodeType, attributes); }

                /** Validates that the settings for the template object are correct. If not correct, an exception is thrown.
                 * When validating tag names use either 'assertSupportedElementTypes()' or 'assertUnsupportedElementTypes()'.
                 * The correct process is to validate tags names, including any other necessary properties, by overriding and
                 * calling 'validate()' prior to rendering output when overriding 'get outerHTML()'.
                 */
                abstract validate(): void;

                get outerHTML() {
                    this.validate();
                    return super.outerHTML;
                }

                /** If this is true, then 'assertSupportedNodeTypes()' and 'assertUnsupportedNodeTypes()' always succeeds. */
                __disableNodeTypeValidation: boolean;

                /** Call this to validate supported element types. */
                assertSupportedNodeTypes(...args: string[]) {
                    if (this.__disableNodeTypeValidation) return;
                    this.tagName = (this.tagName || "").toLowerCase();
                    //??args = <string[]><any>arguments;
                    if (args.length == 1 && args[0] && Array.isArray(args[0]) && args[0].length)
                        args = <string[]><any>args[0]; // (first parameter is an array of supported type names)
                    for (var i = 0; i < args.length; i++)
                        if (this.tagName == args[i]) return true;
                    throw new DS.Exception("The node type name '" + this.tagName + "' is not supported for this template type.");
                }

                /** Call this to validate unsupported element types. */
                assertUnsupportedNodeTypes(...args: string[]) {
                    if (this.__disableNodeTypeValidation) return;
                    this.tagName = (this.tagName || "").toLowerCase();
                    //??args = <string[]><any>arguments;
                    if (args.length == 1 && args[0] && Array.isArray(args[0]) && args[0].length)
                        args = <string[]><any>args[0]; // (first parameter is an array of unsupported type names)
                    for (var i = 0; i < args.length; i++)
                        if (this.tagName == args[i])
                            throw new DS.Exception("The node type name '" + this.tagName + "' is not supported for this template type.");
                }
            }

            export class Phrase extends TemplateElement {
                phraseType: PhraseTypes;

                constructor(nodeName?: string) { super(nodeName); }

                validate() {
                    this.assertSupportedNodeTypes("em", "strong", "cite", "dfn", "code", "samp", "kbd", "var", "abr", "acronym");
                }

                get outerHTML(): string {
                    this.validate();
                    var leftTags = "", rightTags = "", phraseType = this.phraseType;
                    if ((phraseType & PhraseTypes.Emphasis) > 0) { leftTags = "<em>" + leftTags; rightTags += "</em>"; }
                    if ((phraseType & PhraseTypes.Strong) > 0) { leftTags = "<strong>" + leftTags; rightTags += "</strong>"; }
                    if ((phraseType & PhraseTypes.Cite) > 0) { leftTags = "<cite>" + leftTags; rightTags += "</cite>"; }
                    if ((phraseType & PhraseTypes.Defining) > 0) { leftTags = "<dfn>" + leftTags; rightTags += "</dfn>"; }
                    if ((phraseType & PhraseTypes.Code) > 0) { leftTags = "<code>" + leftTags; rightTags += "</code>"; }
                    if ((phraseType & PhraseTypes.Sample) > 0) { leftTags = "<samp>" + leftTags; rightTags += "</samp>"; }
                    if ((phraseType & PhraseTypes.Keyboard) > 0) { leftTags = "<kbd>" + leftTags; rightTags += "</kbd>"; }
                    if ((phraseType & PhraseTypes.Variable) > 0) { leftTags = "<var>" + leftTags; rightTags += "</var>"; }
                    if ((phraseType & PhraseTypes.Abbreviation) > 0) { leftTags = "<abbr>" + leftTags; rightTags += "</abbr>"; }
                    if ((phraseType & PhraseTypes.Acronym) > 0) { leftTags = "<acronym>" + leftTags; rightTags += "</acronym>"; }
                    return leftTags + this.innerHTML + rightTags;
                }
            }

            export class HTMLText extends TemplateElement {
                constructor() { super("span"); }

                validate() { this.assertUnsupportedNodeTypes("html", "head", "body", "script", "audio", "canvas", "object"); }

                // ----------------------------------------------------------------------------------------------------------------

                onRedraw(recursive: boolean = true) {
                    super.onRedraw(recursive);
                }

                // ----------------------------------------------------------------------------------------------------------------
            }

            export class Header extends TemplateElement {
                constructor(/**A value from 1-6.*/public headerLevel = 1) {
                    super('h' + headerLevel);
                    if (headerLevel < 1 || headerLevel > 6)
                        throw new DS.Exception("HTML only supports header levels 1 through 6.");
                }

                validate() {
                    if (this.headerLevel < 1 || this.headerLevel > 6)
                        throw new DS.Exception("HTML only supports header levels 1 through 6.");
                    this.assertSupportedElementTypes("h1", "h2", "h3", "h4", "h5", "h6");
                }

                get outerHTML() {
                    this.validate();
                    this.tagName = "h" + this.headerLevel;
                    return super.outerHTML;
                }

                // ----------------------------------------------------------------------------------------------------------------

                onRedraw(recursive: boolean = true) {
                    super.onRedraw(recursive);
                }

                // ----------------------------------------------------------------------------------------------------------------
            }
        }
    }
}