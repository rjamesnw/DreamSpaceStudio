import { IGraphNode, GraphNode } from "./Platform.Graph";
import { EventObject } from "./Events";
export interface PropertyChangedHandler {
    (item: IGraphNode, property: IProperty): void;
}
/** Called BEFORE a property changes.
* This is called if there's a need to modify property values as they are set.  This is similar to a filter function, except
* the resulting value is persisted.
* Note: The interceptor function MUST return either the new value passed in, or something else.
*/
export interface InterceptorCallback {
    (property: IProperty, newValue: any): any;
}
/** Called AFTER a property changes.
* This is called if there's a need to be notified when properties have changed.
* The parameter 'initialValue' is true when a graph item is being initialized for the first time. Use this to prevent
* updating the UI in special cases (such as in UI.HTML, which initially prevents updating 'innerHTML',
* which would destroy the child nodes).
*/
export interface ListenerCallback {
    (property: IProperty, initialValue: boolean): void;
}
/** Called when a property is being read from.
* When properties are read from, any associated filters are executed to modify the underlying value before it gets returned
* to the caller (such as when formatting data - example: converting 'M' to 'Male', '20131006' to 'October 6th, 2013', or
* trimming spaces/formatting text, etc.).
* Note: The filter function MUST return either the value passed in, or a new value.
*/
export interface FilterCallback {
    (property: IProperty, value: any): any;
}
declare const PropertyEventBase_base: {
    new (): EventObject;
    super: typeof EventObject;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: EventObject;
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
    super: typeof import("../PrimitiveTypes").Object;
};
export declare class PropertyEventBase extends PropertyEventBase_base {
    /**
       * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
       * layout that can render a view, or partial view.
       * @param parent If specified, the value will be wrapped in the created object.
       */
    static 'new'(): IPropertyEventBase;
    static init(o: IPropertyEventBase, isnew: boolean): void;
    /** A list of callbacks to execute BEFORE a value changes. */
    interceptors: InterceptorCallback[];
    /** A list of callbacks to execute AFTER a value changes. */
    listeners: ListenerCallback[];
    /** A series of callbacks to pass a value through when a property is read.  This allows derived types to convert
    * or translate inherited property values into new values as they are passed down the inheritance hierarchy chain. */
    filters: FilterCallback[];
    /**
    * @param {Property} property The source of this event.
    */
    __DoOnPropertyChanging(owner: IPropertyEventBase, property: IProperty, newValue: any): any;
    /**
    * @param {Property} property The source of this event.
    */
    __DoOnPropertyChanged(owner: IPropertyEventBase, property: IProperty, initialValue: boolean): void;
    /**
    * @param {Property} property The source of this event.
    * @param {any} value The result of each filter call is passed into this parameter for each successive call (in filter creation order).
    */
    __FilerValue(owner: IPropertyEventBase, property: IProperty, value: any): void;
    /** A list of callbacks to execute BEFORE this value changes. */
    registerInterceptor(interceptor: InterceptorCallback): void;
    unregisterInterceptor(interceptor: InterceptorCallback): void;
    /** A list of callbacks to execute AFTER this value changes. */
    registerListener(listener: ListenerCallback): void;
    unregisterListener(listener: ListenerCallback): void;
    /** Filters are called when a property is being read from.
    * Derived types should create filters if there's a need to notify a stored value before use (such as when formatting data,
    * such as converting 'M' to 'Male', '20131006' to 'October 6th, 2013', or trimming spaces/formatting text, etc.).
    */
    registerFilter(filter: FilterCallback): void;
    unregisterFilter(filter: FilterCallback): void;
}
export interface IPropertyEventBase extends PropertyEventBase {
}
declare const StaticProperty_base: {
    new (): PropertyEventBase;
    super: typeof PropertyEventBase;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: PropertyEventBase;
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
    super: typeof EventObject & typeof import("../PrimitiveTypes").Object;
};
export declare class StaticProperty extends StaticProperty_base {
    /**
       * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
       * layout that can render a view, or partial view.
       * @param parent If specified, the value will be wrapped in the created object.
       */
    static 'new'(name: string, isVisual: boolean): IStaticProperty;
    static init(o: IStaticProperty, isnew: boolean, name: string, isVisual: boolean): void;
    owner: typeof GraphNode;
    /** An internal name for the property.  This will also be the attribute set on the underlying UI element (so a name
    * of 'id' would set the 'id' attribute of the element). */
    name: string;
    /** The default value for new related instance properties. */
    defaultValue: any;
    /** If true (false by default), then 'onRedraw()' will be called when this property is updated. */
    isVisual: boolean;
    createPropertyInstance(owner: IGraphNode, value?: any): IProperty;
    toString(): string;
    toLocaleString(): string;
    valueOf(): any;
}
export interface IStaticProperty extends StaticProperty {
}
declare const Property_base: {
    new (): PropertyEventBase;
    super: typeof PropertyEventBase;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: PropertyEventBase;
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
    super: typeof EventObject & typeof import("../PrimitiveTypes").Object;
};
/** Represents a GraphItem instance property which holds a reference to the related static property information, and also stores the current instance value. */
export declare class Property extends Property_base {
    static 'new'(owner: IPropertyEventBase, staticProperty: IStaticProperty, value: any): IProperty;
    static init(o: IProperty, isnew: boolean, owner: IPropertyEventBase, staticProperty: IStaticProperty, value: any): void;
    /** The 'GraphItem' instance that this property belongs to. */
    owner: IPropertyEventBase;
    /** A reference to the static property information for the property instance. */
    staticProperty: IStaticProperty;
    /** The current instance value for the property.
        * Note: You shouldn't read this directly unless you wish to bypass the filters.  Call 'getValue()' instead.
        * If you MUST access this value, you'll have to use the "(<any>property).value" format.
        */
    private __value;
    private __valueIsProperty;
    private __timeoutHandle;
    setValue(value: any, triggerChangeEvents?: boolean): void;
    getValue(): any;
    hasValue(): boolean;
    /** Trigger a 'changed' event - useful for reverting state changes made directly on UI elements. Also called initially
    * on new UI elements during the initial layout phase.  */
    triggerChangedEvent(initialValue?: boolean): boolean;
    toString(): string;
    toLocaleString(): string;
    valueOf(): any;
    /** Creates a deep copy of this graph item property instance via a call to 'Utilities.clone()'. */
    clone(): IProperty;
}
export interface IProperty extends Property {
}
export interface IProperties {
    [index: string]: IProperty;
}
export {};
