import { IResourceRequest } from "./ResourceRequest";
/** The default global namespace name if no name is specified when calling 'registerGlobal()'.
 * To get the actual registered name, see the global property 'DreamSpace.globalNamespaceName' exported from this module.
 * Note: A symbol is not used, since callbacks placed into API URLs must be strings. Instead, a static pre-generated GUID is appended.
 */
export declare const DEFAULT_GLOBAL_NS_NAME = "$__DREAMSPACE_GLBOALS_A756B156811A44E59329E44CAA6AFA98";
export declare abstract class DreamSpace {
    static readonly globalNamespaceName: string;
}
/** This is a global object used by all other modules in the system for sharing and updating global states. It is registered on the global
 * scope by calling 'registerGlobal(uniqueGlobalVarName)', which uses the NAME+GUID constant value stored in the exported
 * 'DEFAULT_ROOT_NS_NAME' by default.
 */
export declare namespace DreamSpace {
    /** The current application version (user defined). */
    var appVersion: string;
    /**
     * The root namespace for the DreamSpace system.
     */
    /** The current version of the DreamSpace system. */
    var version: string;
    /** Returns the current user defined application version, or a default version. */
    var getAppVersion: () => string;
    const constructor: symbol;
    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'DreamSpace.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    function noop(...args: any[]): any;
    /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to keep 'var' declarations, etc., within a function scope.
      * Note: By default, parameter indexes 0-9 are automatically assigned to parameter identifiers 'p0' through 'p9' for easy reference.
      */
    function safeEval(x: string, ...args: any[]): any;
    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
      */
    function globalEval(x: string): any;
    enum Environments {
        /** Represents the DreamSpace client core environment. */
        Browser = 0,
        /** Represents the DreamSpace worker environment (where applications and certain modules reside). */
        Worker = 1,
        /** Represents the DreamSpace server environment. */
        Server = 2
    }
    enum DebugModes {
        /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
        Release = 0,
        /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
        Debug_Run = 1,
        /**
          * Run in debug mode, which loads all un-minified scripts, but does NOT boot the system nor run the application automatically.
          * To manually start the DreamSpace system boot process, call 'DreamSpace.Loader.bootstrap()'.
          * Once the boot process completes, the application will not start automatically. To start the application process, call 'DreamSpace.Scripts.runApp()".
          */
        Debug_Wait = 2
    }
    /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values. The default is 'Debug_Run'. */
    var debugMode: DebugModes;
    /** Returns true if DreamSpace is running in debug mode. */
    function isDebugging(): boolean;
    /** Set to true if ES2015+ (aka ES6+) is supported in the browser environment ('class', 'new.target', etc.). */
    var ES6: boolean;
    /** Set to true if ES2015+ (aka ES6+ - i.e. 'class', 'new.target', etc.) was targeted when this DreamSpace JS code was transpiled. */
    var ES6Targeted: boolean;
    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of DreamSpace runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    var Environment: Environments;
    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
    function isEmpty(obj: any): boolean;
    /**
     * Returns true if the URL contains the specific action and controller names at the end of the URL path.
     * This of course assumes typical routing patterns in the format '/controller/action' or '/area/controller/action'.
     */
    function isPage(action: string, controller?: string, area?: string): boolean;
    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    namespace Time {
        var __millisecondsPerSecond: number;
        var __secondsPerMinute: number;
        var __minsPerHour: number;
        var __hoursPerDay: number;
        var __daysPerYear: number;
        var __actualDaysPerYear: number;
        var __EpochYear: number;
        var __millisecondsPerMinute: number;
        var __millisecondsPerHour: number;
        var __millisecondsPerDay: number;
        var __millisecondsPerYear: number;
        var __ISO8601RegEx: RegExp;
        var __SQLDateTimeRegEx: RegExp;
        var __SQLDateTimeStrictRegEx: RegExp;
        /** The time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        var __localTimeZoneOffset: number;
    }
    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    var global: IStaticGlobals;
    var host: IHostBridge;
    /**
     * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
     * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
     * named index based lookups, so no string concatenation is used, which makes the process many times faster.
     * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
     * property names.  To be safe, make sure to always use the 'DreamSpace.Globals.register()' function.  It can create isolated
     * global variables, and if necessary, also create a safer unique host global scope name.
     */
    namespace Globals {
        /**
        * Registers and initializes a global property for the specified resource, and returns the dot-delimited string reference (see DreamSpace.Globals).
        * Subsequent calls with the same resource and identifier name ignores the 'initialValue' and 'asHostGlobal' arguments, and simply returns the
        * existing property path instead.
        * @param {System.IO.ResourceRequest} resource The resource type object associated with the globals to create.
        * @param {T} initialValue  The initial value to set.
        * @param {boolean} asHostGlobal  If true, a host global scope unique variable name is returned. If false (default), a dot-delimited one is returned
        *                                instead which references the global variable within the DreamSpace namespace related global scope (so as not to
        *                                pollute the host's global scope).
        *                                Some frameworks, such as the Google Maps API, support callbacks with dot-delimited names for nested objects to help
        *                                prevent global scope pollution.
        */
        function register<T>(resource: IResourceRequest, name: string, initialValue: T, asHostGlobal?: boolean): string;
        /**
        * Registers and initializes a global property for the specified namespace, and returns the dot-delimited string reference (see DreamSpace.Globals).
        * Subsequent calls with the same namespace and identifier name ignores the 'initialValue' and 'asHostGlobal' arguments, and simply returns the
        * existing property path instead.
        * @param {string} namespace  Any string that is unique to your application/framework/resource/etc. (usually a URI of some sort), and is used to group globals
        *                            under a single object scope to prevent naming conflicts.  When resources are used, the URL is used as the namespace.
        *                            A windows-style GUID, MD5 hash, or SHA1+ hash is perfectly fine as well (to use as a safe unique namespace for this purpose).
        * @param {T} initialValue  The initial value to set.
        * @param {boolean} asHostGlobal  If true, a host global scope unique variable name is returned. If false (default), a dot-delimited one is returned
        *                                instead which references the global variable within the DreamSpace namespace related global scope (so as not to
        *                                pollute the host's global scope).
        *                                Some frameworks, such as the Google Maps API, support callbacks with dot-delimited names for nested objects to help
        *                                prevent global scope pollution.
        */
        function register<T>(namespace: string, name: string, initialValue: T, asHostGlobal?: boolean): string;
        /**
          * Returns true if the specified global variable name is registered.
          */
        function exists<T>(resource: IResourceRequest, name: string): boolean;
        /**
          * Returns true if the specified global variable name is registered.
         */
        function exists<T>(namespace: string, name: string): boolean;
        /**
          * Erases the registered global variable (by setting it to 'undefined' - which is faster than deleting it).
          * Returns true if successful.
          */
        function erase<T>(resource: IResourceRequest, name: string): boolean;
        function erase<T>(namespace: string, name: string): boolean;
        /**
          * Clears all registered globals by releasing the associated global object for the specified resource's namespace
          * and creating a new object.  Any host globals are deleted first.
          * Return true on success, and false if the namespace doesn't exist.
          */
        function clear<T>(resource: IResourceRequest): boolean;
        /**
          * Clears all registered globals by releasing the associated global object for the specified resource's namespace
          * and creating a new object.  Any host globals are deleted first.
          * Return true on success, and false if the namespace doesn't exist.
          */
        function clear<T>(namespace: string): boolean;
        /**
          * Sets and returns a global property value.
          */
        function setValue<T>(resource: IResourceRequest, name: string, value: T): T;
        /**
          * Sets and returns a global property value.
          */
        function setValue<T>(namespace: string, name: string, value: T): T;
        /**
        * Gets a global property value.
        */
        function getValue<T>(resource: IResourceRequest, name: string): T;
        /**
        * Gets a global property value.
        */
        function getValue<T>(namespace: string, name: string): T;
    }
    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using DreamSpace.JS for
     * .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called before all scripts in the header section of your layout view.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    var baseURL: string;
    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    var baseScriptsURL: string;
    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    var baseCSSURL: string;
}
/**
 * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
 */
export declare function sealed<T extends IType>(target: T): T;
export declare function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
/**
* A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
*/
export declare function frozen<T extends IType>(target: T): T;
export declare function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
/**
 * A decorator used to add DI information for a function parameter.
 * @param args A list of items which are either fully qualified type names, or references to the type functions.
 * The order specified is important.  A new (transient) or existing (singleton) instance of the first matching type found is returned.
 */
export declare function $(...args: (IType<any> | string)[]): (target: any, paramName: string, index: number) => void;
/** Provides a mechanism for object cleanup.
* See also: 'dispose(...)' helper functions. */
export interface IDisposable {
    /** Set to true when the object is being disposed. By default this is undefined.  This is only set to true when 'dispose()' is first call to prevent cyclical calls. */
    $__disposing?: boolean;
    /** Set to true once the object is disposed. By default this is undefined, which means "not disposed".  This is only set to true when disposed, and false when reinitialized. */
    $__disposed?: boolean;
    /**
     * Returns a reference to the DreamSpace system that created the object.  This is set automatically when creating instances from factories.
     * Note: Setting this to null/undefined will prevent an instance from being disposable.
     */
    $__ds?: {};
    /**
    * Releases the object back into the object pool.
    * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
    *                          false to request that child objects remain connected after disposal (not released). This
    *                          can allow quick initialization of a group of objects, instead of having to pull each one
    *                          from the object pool each time.
    */
    dispose(release?: boolean): void;
}
/** Type-cast class references to this interface to access type specific information, where available. */
export interface ITypeInfo {
    /** The parent namespace object that contains the type (function instance).
      * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
      */
    $__parent?: ITypeInfo | INamespaceInfo | IClassInfo | IFunctionInfo;
    /** Returns the name of this type.
      * Note: This is the object type name taken from the constructor (if one exists), and is not the FULL type name (no namespace).
      * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
      */
    $__name?: string;
    /** Returns the full name of this type (includes the namespace).
      * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
      */
    $__fullname?: string;
}
export interface IType<TInstance = object> {
    new (...args: any[]): TInstance;
}
export interface IFunction<ReturnType = any> {
    (...args: any[]): ReturnType;
}
/** Type-cast DreamSpace namespace objects to this interface to access namespace specific type information. */
export interface INamespaceInfo extends ITypeInfo {
    $__namespaces: NativeTypes.IArray<Object>;
}
/** Type-cast function objects to this interface to access type specific information. */
export interface IFunctionInfo extends Function, ITypeInfo {
    (...args: any[]): any;
    /** If specified, defines the expected types to use for injection into the function's parameters.
     * Each entry is for a single parameter, and is a array of items where each item is either a string, naming the fully-qualified type name, or an object reference to the type (function) that is expected.
     * To declare the parameter types for a constructor function (or any function), use the @
     */
    $__argumentTypes?: (IType<any> | string)[][];
}
/** Type-cast DreamSpace classes (functions) to this interface to access class specific type information. */
export interface IClassInfo<TInstance extends object = object> extends ITypeInfo, IType<TInstance> {
    /** Represents the static properties on a factory type. */
    $__factoryType?: IFactoryTypeInfo;
}
export interface NewDelegate<TInstance extends NativeTypes.IObject> {
    (...args: any[]): TInstance;
}
export interface InitDelegate<TInstance extends NativeTypes.IObject> {
    (o: TInstance, isnew: boolean, ...args: any[]): void;
}
/** Represents the static properties on a factory type. */
export interface IFactoryTypeInfo<TClass extends IType = IType> extends IClassInfo<InstanceType<TClass>>, IFactory<TClass> {
    /** The factory from the inherited base type, or null/undefined if this object does not inherit from an object with a factory pattern. */
    $__baseFactoryType: IFactoryTypeInfo;
    /** This is set to true when 'init()' is called. The flag is used to determine if 'super.init()' was called. If not then it is called automatically. */
    $__initCalled?: boolean;
    /** The type that the factory will create when '.new()' is called. If not a class/function, the factory class is assumed to be the instance class as well. */
    $__type?: IType;
}
/** Represents the factory methods of a factory instance. */
export interface IFactory<TClass extends IType = IType, TNew extends NewDelegate<InstanceType<TClass>> = NewDelegate<InstanceType<TClass>>, TInit extends InitDelegate<InstanceType<TClass>> = InitDelegate<InstanceType<TClass>>> {
    /** Used in place of the constructor to create a new instance of the underlying object type for a specific domain.
      * This allows the reuse of disposed objects to prevent garbage collection hits that may cause the application to lag, and
      * also makes sure the object is associated with an application domain.
      * Objects that derive from 'DomainObject' should register the type and supply a custom 'init' function instead of a
      * constructor (in fact, only a default constructor should exist). This is done by creating a static property on the class
      * that uses 'AppDomain.registerCall()' to register the type. See 'NativeTypes.IObject.__register' for more information.
      *
      * Performance note: When creating thousands of objects continually, proper DreamSpace object disposal (and subsequent cache of the
      * instances) means the GC doesn't have to keep engaging to clear up the abandoned objects.  While using the "new" operator may
      * be faster than using "{type}.new()" at first, the application actually becomes very lagged while the GC keeps eventually kicking
      * in. This is why DreamSpace objects are cached and reused as much as possible, and why you should try to refrain from using the 'new',
      * operator, or any other operation that creates objects that the GC has to manage on a blocking thread.
      */
    'new': TNew;
    /** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
      * constructor function to get new instances, and 'dispose()' to release them when done.
      */
    init?: TInit;
}
/** Represents the factory methods of a factory instance, including other protected instance properties used by the factory methods. */
export interface IFactoryInternal<TClass extends IType<object> = IType<object>, TFactory extends {
    new (): IFactory;
} = {
    new (): IFactory;
}> extends IFactory<TClass> {
    /** The underlying type associated with this factory instance. */
    type: TClass;
    /** The immediate base factory type to this factory. */
    super: TFactory;
}
/**
 * Supports Iteration for ES5/ES3. To use, create a new type derived from this one, or implement the IEnumerable<T> interface.
 */
export declare abstract class Enumerable<T> implements Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return(value?: any): IteratorResult<T>;
    throw(e?: any): IteratorResult<T>;
}
/**
* Supports Iteration for ES5/ES3. To use, implement this interface, or create a new type derived from Enumerable<T>.
*/
export interface IEnumerable<T> extends Enumerable<T> {
}
export interface ICallback<TSender> {
    (sender?: TSender): void;
}
/**
 * A handler that is called when a resource is loaded.
 * The data supplied may not be the original data. Each handler can apply transformations to the data. Any data returned replaces the
 * underlying data for the request and gets passed to the next callback in the chain (if any), which is useful for filtering.
 * Another resource request can also be returned, in which case the 'transformedData' value of that request becomes the result (unless that
 * request failed, which would cascade the failure the current request as well).
 */
export interface IResultCallback<TSender> {
    (sender?: TSender, data?: any): any | IResourceRequest;
}
export interface IErrorCallback<TSender> {
    (sender?: TSender, error?: any): any;
}
/** Registers this global module in the global scope. The global 'DreamSpace' namespace is returned, if needed.
 * This helps to support:
 * 1. A single object to store global DreamSpace states, such as the host application version, base paths, etc.
 * 2. A global object to store callback functions for API initialization, such as Google Maps.
 * @param uniqueGlobalVarName The global name to use.  By default this is the constant 'DEFAULT_ROOT_NS_NAME', which uses a NAME + GUID to guarantee no collisions.
 */
export default function registerGlobal(uniqueGlobalVarName?: string): typeof DreamSpace;
