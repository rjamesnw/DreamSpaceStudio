import { IGraphNode, GraphNode } from "./Platform.Graph";
import { DreamSpace as DS } from "../Globals";
import { Contexts, Context } from "./Platform";
import { IProperty, IStaticProperty } from "./Properties";
/** A context is a container that manages a reference to a global script environment. Each new context creates a new
  * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
  * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
  * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
  */
export declare class BrowserContext extends Context {
    static 'new'(context?: Contexts): IBrowserContext;
    static init(o: IBrowserContext, isnew: boolean, context?: Contexts): void;
    private _target;
    private _iframe;
    private _worker;
    private _window;
    private _global;
    _setupIFrame(): void;
    _setupWorker(): void;
    _setupWindow(): void;
    /** Load a resource (usually a script or page) into this context. */
    load(url: string): void;
}
export interface IBrowserContext extends BrowserContext {
}
declare const HTMLNode_base: {
    new (): GraphNode;
    super: typeof GraphNode;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: GraphNode;
    getTypeName: typeof import("../PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("../PrimitiveTypes").Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    super: typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
};
/** Represents the base of a DreamSpace UI object of various UI types. The default implementation extends this to implement HTML elements. */
export declare class HTMLNode extends HTMLNode_base {
    static 'new'(parent: IGraphNode, id?: string, name?: string): IHTMLNode;
    static init(o: IHTMLNode, isnew: boolean, parent: IGraphNode, id?: string, name?: string): void;
    id: string;
    name: string;
    /** Represents the HTML element tag to use for this graph item.  The default value is set when a derived graph item is constructed.
      * Not all objects support this property, and changing it is only valid BEFORE the layout is updated for the first time.
      */
    tagName: string;
    /** The generated element for this HTMLelement graph node. */
    protected __element: Node;
    /** Detaches this GraphItem from the logical graph tree, but does not remove it from the parent's child list.
     * Only call this function if you plan to manually remove the child from the parent.
     */
    detach(): this;
    onRedraw(recursive?: boolean): void;
    /** Changes the type of element to create (if supported by the derived type), and returns the underlying graph instance.
       * Changing this after a layout pass has already created elements will cause the existing element for this graph item to be deleted and replaced.
       * WARNING: This is not supported by all derived types, and calling this AFTER a layout pass has created elements for those unsupported types may have no effect.
       * For example, the UI 'PlaneText' graph item overrides 'createUIElement()' to return a node created from 'document.createTextNode()',
       * and calling 'setHTMLTag("span")' will have no effect before OR after the first layout pass (this element will always be a text node).
       * Some derived types that override 'createUIElement()' my provide special logic to accept only supported types.
       */
    setHTMLTag(htmlTag: string): this;
    /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate supported element types. */
    assertSupportedElementTypes(...args: string[]): boolean;
    /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate unsupported element types. */
    assertUnsupportedElementTypes(...args: string[]): void;
}
export interface IHTMLNode extends HTMLNode {
}
declare const HTMLElement_base: {
    new (): HTMLNode;
    super: typeof HTMLNode;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: HTMLNode;
    getTypeName: typeof import("../PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("../PrimitiveTypes").Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    super: typeof GraphNode & typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
};
/** Represents an HTML node graph item that renders the content in the 'innerHTML of the default '__htmlTag' element (which is set to 'GraphItem.defaultHTMLTag' [DIV] initially).
  * This object has no element restrictions, so you can create any element you need by setting the '__htmlTag' tag before the UI element gets created.
  */
export declare class HTMLElement<TElement extends NativeTypes.IHTMLElement = NativeTypes.IHTMLElement> extends HTMLElement_base {
    static 'new'<TName extends keyof HTMLElementTagNameMap = 'div', TElement extends HTMLElementTagNameMap[TName] = HTMLDivElement>(parent: IGraphNode, id?: string, name?: string, tagName?: TName, html?: string): IHTMLElement<TElement>;
    /** Each new graph item instance will initially set its '__htmlTag' property to this value. */
    static defaultHTMLTagName: string;
    static init<TName extends keyof HTMLElementTagNameMap = 'div', TElement extends HTMLElementTagNameMap[TName] = HTMLDivElement>(o: HTMLElement<TElement>, isnew: boolean, parent: IGraphNode, id?: string, name?: string, tagName?: TName, html?: string): void;
    static ID: IStaticProperty;
    static Name: IStaticProperty;
    static Class: IStaticProperty;
    static Style: IStaticProperty;
    static InnerHTML: IStaticProperty;
    class: string;
    style: string;
    innerHTML: string;
    protected readonly __htmlElement: TElement;
    /** Sets a value on this HTML element object and returns the element (to allow chaining calls). If a DOM element is also
      * associated it's attributes are updated with the specified value.
      */
    set<N extends keyof TElement, V extends TElement[N]>(name: N, value: V): this;
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
    get<N extends keyof TElement, V extends TElement[N]>(name: N, tryElement?: boolean): V;
    /** Apply the configurations of this element to the specified element, optionally ignoring some by name.
     * Properties are applied to the element directly first (such as "id", "name", etc. [case sensitive]) Any missing properties are applied as attributes instead. */
    applyTo(el: NativeTypes.IHTMLElement, ignore?: string[]): void;
    createUIElement(): Node;
    doPropertyChanged(name: string, oldValue: any): void;
    onRedraw(recursive?: boolean): void;
}
export interface IHTMLElement<TElement extends InstanceType<typeof DS.global.HTMLElement> = InstanceType<typeof DS.global.HTMLElement>> extends HTMLElement<TElement> {
}
declare const PlainText_base: {
    new (): HTMLNode;
    super: typeof HTMLNode;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: HTMLNode;
    getTypeName: typeof import("../PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("../PrimitiveTypes").Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    super: typeof GraphNode & typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
};
/**
  * Represents a basic text node graph item that renders plain text (no HTML). For HTML use 'HTMLText'.
  * This is inline with the standard which declares that all DOM elements with text should have text-ONLY nodes.
  */
export declare class PlainText extends PlainText_base {
    static 'new'(parent: IGraphNode, text?: string): IPlainText;
    static init(o: PlainText, isnew: boolean, parent: IGraphNode, text?: string): void;
    static Text: IStaticProperty;
    text: (text?: string) => string;
    createUIElement(): Node;
    onRedraw(recursive?: boolean): void;
}
export interface IPlainText extends PlainText {
}
declare const HTMLText_base: {
    new (): HTMLElement<NativeTypes.IHTMLElement>;
    super: typeof HTMLElement;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: HTMLElement<any>;
    getTypeName: typeof import("../PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("../PrimitiveTypes").Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    super: typeof HTMLNode & typeof GraphNode & typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
    defaultHTMLTagName: string;
    ID: IStaticProperty;
    Name: IStaticProperty;
    Class: IStaticProperty;
    Style: IStaticProperty;
    InnerHTML: IStaticProperty;
};
/** Represents an HTML text node graph item that renders the content in the 'innerHTML of a SPAN element. For plain text nodes use 'PlainText'.
  */
export declare class HTMLText extends HTMLText_base {
    static 'new'(parent: IGraphNode, html?: string): IHTMLText;
    static init(o: IHTMLText, isnew: boolean, parent: IGraphNode, html?: string): void;
    createUIElement(): Node;
    onRedraw(recursive?: boolean): void;
}
export interface IHTMLText extends HTMLText {
}
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
declare const Phrase_base: {
    new (): HTMLElement<NativeTypes.IHTMLElement>;
    super: typeof HTMLElement;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: HTMLElement<any>;
    getTypeName: typeof import("../PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("../PrimitiveTypes").Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    super: typeof HTMLNode & typeof GraphNode & typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
    defaultHTMLTagName: string;
    ID: IStaticProperty;
    Name: IStaticProperty;
    Class: IStaticProperty;
    Style: IStaticProperty;
    InnerHTML: IStaticProperty;
};
/** Represents a basic phrase node graph item that renders phrase elements (a term used by w3.org to describe adding
  * "structural information to text fragments").  This is basically just text formatting in most cases.
  * It's important to note the word "structural" here, as it is a suggestion on how to process text, but, unlike CSS,
  * it does not dictate exactly HOW the text will actually look like. For instance, "<STRONG>" tags usually render as
  * bold text, but someone can decide to color and increase font size instead using CSS for all such elements. This is
  * actually a good thing, as it allows flexible web design in a way that can allow applying themes at a later time. */
export declare class Phrase extends Phrase_base {
    static 'new'(parent: IGraphNode, phraseTypeFlags?: PhraseTypes, html?: string): IPhrase;
    static init(o: Phrase, isnew: boolean, parent: IGraphNode, phraseTypeFlags?: PhraseTypes, html?: string): void;
    static PhraseType: IStaticProperty;
    phraseType: (phraseType?: PhraseTypes) => PhraseTypes;
    createUIElement(): Node;
    createPhrase(property: IProperty, value: any): any;
    onRedraw(recursive?: boolean): void;
}
export interface IPhrase extends Phrase {
}
declare const Header_base: {
    new (): HTMLElement<NativeTypes.IHTMLElement>;
    super: typeof HTMLElement;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: HTMLElement<any>;
    getTypeName: typeof import("../PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("../PrimitiveTypes").Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    super: typeof HTMLNode & typeof GraphNode & typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
    defaultHTMLTagName: string;
    ID: IStaticProperty;
    Name: IStaticProperty;
    Class: IStaticProperty;
    Style: IStaticProperty;
    InnerHTML: IStaticProperty;
};
/** Represents an HTML header element.
  */
export declare class Header extends Header_base {
    static 'new'(parent: IGraphNode, headerLevel?: number, html?: string): IHeader;
    static init(o: IHeader, isnew: boolean, parent: IGraphNode, headerLevel?: number, html?: string): void;
    static HeaderLevel: IStaticProperty;
    headerLevel: (headerLevel?: number) => number;
    createUIElement(): Node;
    onRedraw(recursive?: boolean): void;
}
export interface IHeader extends Header {
}
declare const Body_base: {
    new (): HTMLElement<NativeTypes.IHTMLElement>;
    super: typeof HTMLElement;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: HTMLElement<any>;
    getTypeName: typeof import("../PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("../PrimitiveTypes").Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    super: typeof HTMLNode & typeof GraphNode & typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
    defaultHTMLTagName: string;
    ID: IStaticProperty;
    Name: IStaticProperty;
    Class: IStaticProperty;
    Style: IStaticProperty;
    InnerHTML: IStaticProperty;
};
/** Represents an HTML body element.
  */
export declare class Body extends Body_base {
    static 'new'(parent: IGraphNode, bodyLevel?: number, html?: string): IBody;
    static init(o: IBody, isnew: boolean, parent: IGraphNode, html?: string): void;
    createUIElement(): Node;
    onRedraw(recursive?: boolean): void;
}
export interface IBody extends Body {
}
/** Data template information as extracted from HTML template text. */
export interface IDataTemplate {
    id: string;
    originalHTML: string;
    templateHTML: string;
    templateItem: IGraphNode;
    childTemplates: IDataTemplate[];
}
export declare abstract class HTML {
}
export declare namespace HTML {
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
    function parse(html?: string, strictMode?: boolean): {
        rootElements: IGraphNode[];
        templates: {
            [id: string]: IDataTemplate;
        };
    };
}
export {};
