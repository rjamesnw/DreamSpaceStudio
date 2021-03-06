import { IStaticProperty } from "./Properties";
import { GraphNode } from "./Platform.Graph";
import { HTMLElement, IDataTemplate } from "./Platform.HTML";
declare const ApplicationElement_base: {
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
    super: typeof import("./Platform.HTML").HTMLNode & typeof GraphNode & typeof import("./Properties").PropertyEventBase & typeof import("./Events").EventObject & typeof import("../PrimitiveTypes").Object;
    registerProperty: typeof GraphNode.registerProperty;
    uiElementMap: WeakMap<object, import("./Platform.Graph").IGraphNode>;
    accessor: (registeredProperty: IStaticProperty) => any;
    defaultHTMLTagName: string;
    ID: IStaticProperty;
    Name: IStaticProperty;
    Class: IStaticProperty;
    Style: IStaticProperty;
    InnerHTML: IStaticProperty;
};
/** An ApplicationElement object is the root object of the graph tree that relates one UIApplication instance. */
export declare class ApplicationElement extends ApplicationElement_base {
    static 'new'(title: string, description: string, targetElement?: NativeTypes.IHTMLElement): ApplicationElement;
    static init(o: ApplicationElement, isnew: boolean, title: string, description: string, targetElement?: NativeTypes.IHTMLElement): void;
    static Title: IStaticProperty;
    static Description: IStaticProperty;
    static Version: IStaticProperty;
    /** A title for the application (required). */
    title: (title?: string) => string;
    /** A short application description (optional). */
    description: (description?: string) => string;
    /** The application version number (i.e. '#.#.#...') in string form. */
    version: (version?: string) => string;
    /** This is the target element that the application will render to when updateLayout() is called. */
    private _targetElement;
    getTargetElement(): NativeTypes.IHTMLElement;
    /** Holds a list of data templates found in the parsed HTML page template.
    * Templates are based on elements within the page which are marked by the 'data--template="someID"' attribute. These
    * elements are stripped out and are not part of the resulting page.
    */
    dataTemplates: {
        [id: string]: IDataTemplate;
    };
    /** This generates/updates the HTML elements required to display the application. */
    updateLayout(recursive?: boolean): void;
    /** Imports an HTML template starting at the given DOM element (a basic DOM system is required for traversing the elements).  Any existing graph items
    * will be merged or replaced.
    * If 'DreamSpace.isServer()' returns true, then you should call 'parseTemplate()'
    * @param {HTMLElement} element HTML root element to traverse.
    */
    applyTemplate(element: HTMLElement): void;
    /** Parses HTML text to build the visual graph tree.
    * This concept is similar to using XAML to load objects in Silverlight or WPF. You have the option to use an HTML file, or dynamically build your application
    * directly in code (just like with Silverlight/WPF using XAML/C#/VB/etc.).
    *
    * Warning about inline scripts: Script tags will be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
    * HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side. "Business" logic should always be in your script
    * files and NOT inline within the HTML.
    */
    parseTemplate(html?: string): void;
    /** Loads the 'htmlFile' file and calls 'parseTemplate()' with the contents.
    * The call is synchronous, and only returns when completed.
    * @param {string} htmlFileURI The URI to the HTML template file. If empty or undefined, then the HTML is pulled from the loaded DOM (see 'parseTemplate()').
    * @param {boolean} fallbackToDOM If true (the default), then the HTML template will be extracted from the currently loaded DOM as a fallback (i.e. if the
    * URI is invalid, or access fails due to a sudden connection failure).
    */
    loadTemplate(htmlFileURI?: string, fallbackToDOM?: boolean): string;
    /** Returns a template with the specified ID.  Returns null if nothing was found. */
    getDataTemplate(id: string): IDataTemplate;
    /** Return the application, and all child graph items, as a single JSON string.  The values are all graph objects and related REGISTERED properties
    * only - direct instance properties are not all persisted, if any.
    * JavaScript 1.7 implements the 'JSON.stringify()' function to convert values into the JSON format.  The implementation looks for a 'toJSON()'
    * function on an object and calls it if found.
    */
    toJSON(): string;
}
export interface IApplicationElement extends ApplicationElement {
}
export {};
