/// <reference types="node" />
import { Object } from "../PrimitiveTypes";
import { Application, IAppDomain } from "./AppDomain";
import { IGraphNode } from "./Platform.Graph";
import { IWindow } from "./Platform.Windows";
export declare enum Contexts {
    /** Creates a new isolated global script environment in the current window for scripts to run in.  An 'IFrame' is used
      * on the client side, and a 'Worker' is used server side. (default) */
    Secure = 0,
    /** Creates a non-isolated global script environment in the current window for scripts to run in.  These script will
      * have access to the host environment. An IFrame is used on the client side, and a new executing context is used
      * server side. */
    Unsecure = 1,
    /** Creates a new isolated global script environment in a new window for scripts to run in. On the server side, this
      * is always interpreted as a 'Worker' instance. */
    SecureWindow = 2,
    /** Creates a new isolated global script environment in a new window for scripts to run in.  These script will
      * have access to the host environment. A new executing context is used server side. */
    UnsecureWindow = 3,
    /** The local executing context is the target. All scripts loaded into this context become merged with current application. */
    Local = 4
}
declare const Context_base: {
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
/**
 * A context is a container that manages a reference to a global script environment. Each new context creates a new
 * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
 * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
 * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
 */
export declare abstract class Context extends Context_base {
    /** Abstract: Cannot create instances of this abstract class. */
    static 'new'(): Context;
    static init(o: IContext, isnew: boolean, context?: Contexts): void;
    protected _contextType: Contexts;
    protected _url: string;
    private x;
    /** Load a resource (usually a script or page) into this context. */
    load(url: string): void;
}
export interface IContext extends Context {
}
declare const UIApplication_base: {
    new (): Application;
    super: typeof Application;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: Application;
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
    super: typeof Object;
    default: import("./AppDomain").IApplication;
    current: import("./AppDomain").IApplication;
    applications: import("./AppDomain").IApplication[];
    focused: import("./AppDomain").IApplication;
};
/**
  * Where the Application object represents the base application properties for an AppDomain instance, the UIApplication
  * type, which inherits from Application, represents the UI side.
  * UIApplications encapsulate graph nodes, typically representing HTML, scripts, and modules, and confines them to a root working space.
  * Applications also reference script execution contexts. When application scripts are
  * loaded, they are isolated and run in the context of a new global scope.  This protects the host environment, and also
  * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
  * logins, private information, etc.
  * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
  */
export declare class UIApplication extends UIApplication_base {
    static 'new'(title: string, appID: number): IUIApplication;
    static init(o: IUIApplication, isnew: boolean, title: string, description: string, appID: number): void;
    /** Returns the global context reference for the nested application. Each application gets their own virtual global scope. */
    readonly global: typeof global;
    /** The root graph node that represents this UIApplication; typically an ApplicationElement instance. */
    protected _RootGraphNode: IGraphNode;
    protected _Context: IContext;
    protected _windows: IWindow[];
    protected _onAddToAppDomain(appDomain: IAppDomain): void;
    /** Disposes this UIApplication instance. */
    dispose(release?: boolean): void;
    /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
      * 'ITypeInfo' details will be updated for the object.  This is useful when
      * See also: {AppDomain}.registerType()
      * @param {T} object The object to add to this app domain.
      * @param {{}} parentModule The parent module or scope in which the type exists.
      * @param {{}} parentModule The parent module or scope in which the type exists.
      */
    attachObject<T extends {}>(object: T): T;
    /** Try to bring the window for this application to the front. */
    focus(): void;
}
export interface IUIApplication extends UIApplication {
}
export {};
