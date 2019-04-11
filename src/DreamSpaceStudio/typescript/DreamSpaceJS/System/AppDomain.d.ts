import { IDisposable, IFactory, IType } from "../Globals";
import { DSObject } from "./PrimitiveTypes";
import { IIndexedObjectCollection } from "./Collections.IndexedObjectCollection";
/** Domain information for every DreamSpace 'Object' instance. */
export interface IDomainObjectInfo extends IDisposable {
    /** A reference to the application domain that this object belongs to. */
    $__appDomain?: IAppDomain;
    /**
     * The Application that this object instance belongs to. By default, this is always the current global application. In special cases, this may
     * refer to objects created do to communications with a child application.  When a child app closes, the related local objects will become
     * disposed as well.
     */
    $__app?: IApplication;
    /**
     * The ID of this object, which is only useful for tracking objects within the local DreamSpace client.
     * If setting this yourself, call 'Types.getNextObjectId()' for the next valid value.
     */
    $__id?: number;
    /**
      * The ID of this object within an application domain instance, if used, otherwise this is undefined.
      */
    $__appDomainId?: number;
    /**
     * The globally unique ID (GUID) of this object, which is useful for synchronizing across networks (among other things).
     * Internally, all objects have a numbered ID in '$__id', which is unique only within the local client. If a '$__globalId' ID exists,
     * it is trackable across the entire client/server side environment.  This is set usually by calling 'Utilities.createGUID()'.
     * Note: This value is only set automatically for tracked objects. If objects are not tracked by default you have to set this yourself.
     */
    $__globalId?: string;
}
/** AppDomain Bridge, for use with 'AppDomain.with()' when selecting a different application domain when operating on DreamSpace class types. */
export interface IADBridge extends IDomainObjectInfo {
}
declare const AppDomain_base: {
    new (): DSObject;
    super: typeof DSObject;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: DSObject;
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
    getTypeName: typeof DSObject.getTypeName;
    isEmpty: typeof DSObject.isEmpty;
    super: {
        new (...args: any[]): {
            dispose(release?: boolean): void;
        };
    } & ObjectConstructor & IFactory<{
        new (...args: any[]): {
            dispose(release?: boolean): void;
        };
    } & ObjectConstructor, import("../Globals").NewDelegate<{
        dispose(release?: boolean): void;
    } & Object>, import("../Globals").InitDelegate<{
        dispose(release?: boolean): void;
    } & Object>>;
};
/**
 * Application domains encapsulate applications and confine them to a root working space.  When application scripts are
 * loaded, they are isolated and run in the context of a new global scope.  This protects the main window UI, and also
 * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
 * logins, payment details, etc.
 * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
 */
export declare class AppDomain extends AppDomain_base {
    /** Get a new app domain instance.
    * @param application An optional application to add to the new domain.
    */
    static 'new': (application?: IApplication) => IAppDomain;
    /** Constructs an application domain for the specific application instance. */
    static init(o: IAppDomain, isnew: boolean, application?: IApplication): void;
    /** The default system wide application domain.
    * See 'System.Platform.AppDomain' for more details.
    */
    static default: IAppDomain;
    private static _default;
    /** A list of all application domains in the system. */
    static readonly appDomains: IAppDomain[];
    private _applications;
    private _modules;
    /** A type bridge is a object instance who's prototype points to the actual static function object.
      * Each time "{AppDomain}.with()" is used, a bridge is created and cached here under the type name for reuse.
      */
    private readonly __typeBridges;
    /** Automatically tracks new objects created under this app domain. The default is undefined, in which case the global 'Types.autoTrackInstances' is used instead. */
    autoTrackInstances: boolean;
    private __objects;
    /**
     * A collection of all objects tracked by this application domain instance (see the 'autoTrackInstances' property).
     * Each object is given an ID value that is unique for this specific AppDomain instance only.
     */
    readonly objects: IIndexedObjectCollection<IDomainObjectInfo>;
    /** Returns the default (first) application for this domain. */
    application(): IApplication;
    /** Holds a list of all applications on this domain.
      * Do not add applications directly to this array.  Use the 'createApplication()' function.
      * To remove an application, just dispose it.
      */
    applications: IApplication[];
    /** Disposes this AppDomain instance. */
    dispose(): void;
    /** Disposes a specific object in this AppDomain instance.
      * When creating thousands of objects continually, object disposal (and subsequent cache of the instances) means the GC doesn't have
      * to keep engaging to clear up the abandoned objects.  While using the "new" operator may be faster than using "{type}.new()" at
      * first, the application actually becomes very lagged while the GC keeps eventually kicking in.  This is why DreamSpace objects are
      * cached and reused as much as possible.
      * @param {object} object The object to dispose and release back into the "disposed objects" pool.
      * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
      *                          false to request that child objects remain connected after disposal (not released). This
      *                          can allow quick initialization of a group of objects, instead of having to pull each one
      *                          from the object pool each time.
      */
    dispose(object: IDisposable, release?: boolean): void;
    /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
      * 'ITypeInfo' details will be updated for the object.  This is useful when
      * See also: {AppDomain}.registerType()
      * @param {T} object The object to add to this app domain.
      * @param {{}} parentModule The parent module or scope in which the type exists.
      * @param {{}} parentModule The parent module or scope in which the type exists.
      */
    attachObject<T extends object>(object: T): T;
    /** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
      * as a chain method for getting a new instance from a type.
      * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
      */
    with<TFactory extends IFactory>(type: TFactory): TFactory;
    createApplication<TApp extends IType<IApplication>>(factory?: IFactory<TApp>, title?: string, description?: string): TApp;
}
export interface IAppDomain extends AppDomain {
}
declare const Application_base: {
    new (): DSObject;
    super: typeof DSObject;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: DSObject;
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
    getTypeName: typeof DSObject.getTypeName;
    isEmpty: typeof DSObject.isEmpty;
    super: {
        new (...args: any[]): {
            dispose(release?: boolean): void;
        };
    } & ObjectConstructor & IFactory<{
        new (...args: any[]): {
            dispose(release?: boolean): void;
        };
    } & ObjectConstructor, import("../Globals").NewDelegate<{
        dispose(release?: boolean): void;
    } & Object>, import("../Globals").InitDelegate<{
        dispose(release?: boolean): void;
    } & Object>>;
};
/** Applications wrap window reference targets, and any specified HTML for configuration and display. There can be many
  * applications in a single AppDomain.
  */
export declare class Application extends Application_base {
    static 'new': (title: string, description: string, appID: number) => IApplication;
    static init: (o: IApplication, isnew: boolean, title: string, description: string, appID: number) => void;
    /** The default system wide application domain.
      * See 'System.Platform.AppDomain' for more details.
      */
    static default: IApplication;
    private static _default;
    /** References the current running application that owns the current running environment. */
    static readonly current: IApplication;
    private static _current;
    /** A list of all applications in the system. */
    static applications: IApplication[];
    /** References the application who's window currently has user focus. You can also set this property to change window focus. */
    static focused: IApplication;
    private static _focused;
    /** Returns true if this application is focused. */
    readonly isFocused: boolean;
    private _isFocused;
    readonly appID: number;
    private _appID;
    readonly title: string;
    private _title;
    readonly description: string;
    private _description;
    readonly appDomains: IAppDomain[];
    private _appDomains;
    private _applications;
    private _modules;
    /** Returns the default (first) application for this domain. */
    application(): Application;
    /** Holds a list of all applications on this domain.
      * Do not add applications directly to this array.  Use the 'createApplication()' function.
      * To remove an application, just dispose it.
      */
    applications: Application[];
    protected _onAddToAppDomain(appDomain: IAppDomain, app: IApplication): void;
    /** Try to bring the window for this application to the front. */
    focus(): void;
    /** Closes the application by disposing all owned AppDomain instances, which also closes any opened windows, including the application's own window as well. */
    close(): void;
}
export interface IApplication extends Application {
}
export {};
