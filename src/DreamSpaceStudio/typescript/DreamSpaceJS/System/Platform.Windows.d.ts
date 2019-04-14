import { Object } from "../PrimitiveTypes";
declare const Window_base: {
    new (): Object;
    super: typeof Object;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: Object;
    getTypeName: typeof Object.getTypeName;
    isEmpty: typeof Object.isEmpty;
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
};
export declare class Window extends Window_base {
    /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
    static 'new'(rootElement?: HTMLElement, url?: string): IWindow;
    static init(o: IWindow, isnew: boolean, rootElement?: HTMLElement, url?: string): void;
    private _guid;
    private _target;
    private _header;
    private _body;
    private _url;
    show(): void;
    moveTo(x: number, y: number): void;
    moveby(deltaX: number, deltaY: number): void;
}
export interface IWindow extends Window {
}
export {};
