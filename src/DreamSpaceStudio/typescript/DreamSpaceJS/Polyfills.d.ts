interface Function {
    [index: string]: any;
}
interface Object {
    [index: string]: any;
}
interface Array<T> {
    [index: string]: any;
}
interface SymbolConstructor {
    [index: string]: any;
}
interface IndexedObject {
    [name: string]: any;
}
declare type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
declare namespace NativeTypes {
    interface IFunction extends Function {
    }
    interface IObject extends Object, IndexedObject {
    }
    interface IArray<T> extends Array<T> {
    }
    interface IString extends String {
    }
    interface INumber extends Number {
    }
    interface IBoolean extends Boolean {
    }
    interface IRegExp extends RegExp {
    }
    interface IDate extends Date {
    }
    interface IIMath extends Math {
    }
    interface IError extends Error {
    }
    interface IXMLHttpRequest extends XMLHttpRequest {
    }
    interface IHTMLElement extends HTMLElement {
    }
    interface IWindow extends Window {
    }
}
interface IStaticGlobals extends Window {
    [index: string]: any;
    Function: FunctionConstructor;
    Object: ObjectConstructor;
    Array: ArrayConstructor;
    String: StringConstructor;
    Number: NumberConstructor;
    Boolean: BooleanConstructor;
    RegExp: RegExpConstructor;
    Date: DateConstructor;
    Math: Math;
    Error: ErrorConstructor;
    XMLHttpRequest: typeof XMLHttpRequest;
    Node: typeof Node;
    Element: typeof Element;
    HTMLElement: typeof HTMLElement;
    Text: typeof Text;
    Window: typeof Window;
    DreamSpace: typeof DreamSpace;
    /**
    * This is set by default when '@RenderDreamSpaceJSConfigurations()' is called at the top of the layout page and a debugger is attached. It is
    * used to resolve source maps delivered through XHR while debugging.
    * Typically the server side web root file path matches the same root as the http root path in 'baseURL'.
    */
    serverWebRoot: string;
    /** An optional site root URL if the main site root path is in a virtual path. */
    siteBaseURL: string;
    /** Root location of the application scripts, which by default is {site URL}+"/js/". */
    scriptsBaseURL: string;
    /** Root location of the CSS files, which by default is {site URL}+"/css/". */
    cssBaseURL: string;
}
declare type KeyOf<T> = keyof Required<T>;
interface Array<T> {
    last: () => T;
    first: () => T;
    append: (items: Array<T>) => Array<T>;
    select: <T2>(selector: {
        (item: T): T2;
    }) => Array<T2>;
    where: (selector: {
        (item: T): boolean;
    }) => Array<T>;
}
