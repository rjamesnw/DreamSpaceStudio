import { HTMLElement, NodeTypes } from "./VDOM";
/** A list of text mark-up flags for use with phrase based elements. */
export declare enum PhraseTypes {
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
export declare abstract class TemplateElement extends HTMLElement {
    /** The element CSS classes.*/
    className?: string;
    /** The element namespace prefix.*/
    prefix?: string;
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
    /** Validates that the settings for the template object are correct. If not correct, an exception is thrown.
     * When validating tag names use either 'assertSupportedElementTypes()' or 'assertUnsupportedElementTypes()'.
     * The correct process is to validate tags names, including any other necessary properties, by overriding and
     * calling 'validate()' prior to rendering output when overriding 'get outerHTML()'.
     */
    abstract validate(): void;
    readonly outerHTML: string;
    /** If this is true, then 'assertSupportedNodeTypes()' and 'assertUnsupportedNodeTypes()' always succeeds. */
    __disableNodeTypeValidation: boolean;
    /** Call this to validate supported element types. */
    assertSupportedNodeTypes(...args: string[]): boolean;
    /** Call this to validate unsupported element types. */
    assertUnsupportedNodeTypes(...args: string[]): void;
}
export declare class Phrase extends TemplateElement {
    phraseType: PhraseTypes;
    constructor(nodeName?: string);
    validate(): void;
    readonly outerHTML: string;
}
export declare class HTMLText extends TemplateElement {
    constructor();
    validate(): void;
    onRedraw(recursive?: boolean): void;
}
export declare class Header extends TemplateElement {
    headerLevel: number;
    constructor(/**A value from 1-6.*/ headerLevel?: number);
    validate(): void;
    readonly outerHTML: string;
    onRedraw(recursive?: boolean): void;
}
