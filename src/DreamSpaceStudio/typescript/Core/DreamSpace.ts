﻿// ###########################################################################################################################
// These are functions for bootstrapping the core system module load process.  It helps to set up types and functions that will
// be needed, such as DreamSpace.init() to execute callbacks to finalize to loading process (must be called by the end user).
// ###########################################################################################################################

import { IResourceRequest } from "./ResourceRequest";
import { IObject } from "./PrimitiveTypes";

/** The default global namespace name if no name is specified when calling 'registerGlobal()'.
 * To get the actual registered name, see the global property 'DreamSpace.globalNamespaceName' exported from this module.
 * Note: A symbol is not used, since callbacks placed into API URLs must be strings. Instead, a static pre-generated GUID is appended.
 */
export const DEFAULT_GLOBAL_NS_NAME = "$__DREAMSPACE_GLBOALS_A756B156811A44E59329E44CAA6AFA98"; // (A static GUID is appended)
var USER_GIVEN_GLOBAL_NS_NAME: string;

export abstract class DreamSpace { // (abstract classes with namespaces allow for better extensions)
    /** The global DreamSpace namespace name.  Call 'registerGlobal()' to specify a custom name, otherwise the default 'DEFAULT_GLOBAL_NS_NAME' is used. */
    static get globalNamespaceName() { return USER_GIVEN_GLOBAL_NS_NAME || DEFAULT_GLOBAL_NS_NAME; }
    /** The root DreamSpace namespace, which is just DreamSpace.global[DreamSpace.globalNamespaceName] (which is just 'window[DreamSpace.globalNamespaceName]' on browser clients). */
    static get rootns() { return this.global[DreamSpace.globalNamespaceName]; }
}

/** This is a global object used by all other modules in the system for sharing and updating global states. It is registered on the global
 * scope by calling 'registerGlobal(uniqueGlobalVarName)', which uses the NAME+GUID constant value stored in the exported
 * 'DEFAULT_ROOT_NS_NAME' by default.
 */
export namespace DreamSpace {

    /** The current application version (user defined). */
    export var appVersion: string;

    /**
     * The root namespace for the DreamSpace system.
     */
    // ------------------------------------------------------------------------------------------------------------------------

    /** The current version of the DreamSpace system. */
    export var version = "0.0.1";
    Object.defineProperty(DreamSpace, "version", { writable: false });

    /** Returns the current user defined application version, or a default version. */
    export var getAppVersion = () => appVersion || "0.0.0";

    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< DreamSpace Client OS - v" + version + " >=- ");
        else
            console.log("%c -=< %cDreamSpace Client OS - v" + version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");

    // ------------------------------------------------------------------------------------------------------------------------

    export const constructor: symbol = Symbol("static constructor");

    // ------------------------------------------------------------------------------------------------------------------------

    // ===========================================================================================================================
    // Setup some preliminary settings before the core scope, including the "safe" and "global" 'eval()' functions.

    // =======================================================================================================================

    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'DreamSpace.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    export function noop(...args: any[]): any { }

    /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to keep 'var' declarations, etc., within a function scope.
      * Note: By default, parameter indexes 0-9 are automatically assigned to parameter identifiers 'p0' through 'p9' for easy reference.
      */
    export function safeEval(x: string, ...args: any[]) {
        var params: string[] = [];
        for (var i = 0; i <= 9 && i < args.length; ++i)
            params.push("p" + i + " = args[" + i + "]");
        return eval("var " + params.join(', ') + ";\r\n" + x);
    };
    // (note: this allows executing 'eval' outside the private DreamSpace scope, but still within a function scope to prevent polluting the global scope,
    //  and also allows passing arguments scoped only to the request).

    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
      */
    export function globalEval(x: string) { return (<any>0, eval)(x); };
    // (note: indirect 'eval' calls are always globally scoped; see more: http://perfectionkills.com/global-eval-what-are-the-options/#windoweval)

    export enum Environments {
        /** Represents the DreamSpace client core environment. */
        Browser, // Trusted
        /** Represents the DreamSpace worker environment (where applications and certain modules reside). */
        Worker, // Secure "Sandbox"
        /** Represents the DreamSpace server environment. */
        Server
    }

    // ------------------------------------------------------------------------------------------------------------------------

    export enum DebugModes {
        /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
        Release,
        /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
        Debug_Run,
        /** 
          * Run in debug mode, which loads all un-minified scripts, but does NOT boot the system nor run the application automatically.
          * To manually start the DreamSpace system boot process, call 'DreamSpace.Loader.bootstrap()'.
          * Once the boot process completes, the application will not start automatically. To start the application process, call 'DreamSpace.Scripts.runApp()".
          */
        Debug_Wait
    }

    /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values. The default is 'Debug_Run'. */
    export var debugMode: DebugModes = typeof debugMode != 'number' ? DebugModes.Debug_Run : debugMode;

    /** Returns true if DreamSpace is running in debug mode. */
    export function isDebugging() { return debugMode != DebugModes.Release; }

    // ========================================================================================================================================

    /** Set to true if ES2015+ (aka ES6+) is supported in the browser environment ('class', 'new.target', etc.). */
    export var ES6: boolean = (() => { try { return <boolean>globalEval("(function () { return new.target; }, true)"); } catch (e) { return false; } })();

    /** Set to true if ES2015+ (aka ES6+ - i.e. 'class', 'new.target', etc.) was targeted when this DreamSpace JS code was transpiled. */
    export var ES6Targeted: boolean = (() => {
        return (class { }).toString() == "class { }"; // (if targeting ES6 in the configuration, 'class' will be output as a function instead)
    })();

    // =======================================================================================================================

    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
    export function isEmpty(obj: any): boolean {
        if (obj === void 0 || obj === null) return true;
        // (note 'DontEnum flag' enumeration bug in IE<9 [on toString, valueOf, etc.])
        if (typeof obj == 'string' || Array.isArray(obj)) return !obj.length;
        if (typeof obj != 'object') return isNaN(obj);
        for (var key in obj)
            if (global.Object.prototype.hasOwnProperty.call(obj, key)) return false;
        return true;
    }

    // ========================================================================================================================================

    /** 
     * Returns true if the URL contains the specific action and controller names at the end of the URL path. 
     * This of course assumes typical routing patterns in the format '/controller/action' or '/area/controller/action'.
     */
    export function isPage(action: string, controller = "home", area = "") {
        var regexStr = "\/" + action + "(?:\/?[?&#]|$)";
        if (controller) regexStr = "\/" + controller + regexStr;
        if (area) regexStr = "\/" + area + regexStr;
        return new RegExp(regexStr, "gi").test(location.pathname);
    }

    // ========================================================================================================================================

    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    export namespace Time {
        // =======================================================================================================================

        export var __millisecondsPerSecond = 1000;
        export var __secondsPerMinute = 60;
        export var __minsPerHour = 60;
        export var __hoursPerDay = 24;
        export var __daysPerYear = 365;
        export var __actualDaysPerYear = 365.2425;
        export var __EpochYear = 1970;
        export var __millisecondsPerMinute = __secondsPerMinute * __millisecondsPerSecond;
        export var __millisecondsPerHour = __minsPerHour * __millisecondsPerMinute;
        export var __millisecondsPerDay = __hoursPerDay * __millisecondsPerHour;
        export var __millisecondsPerYear = __daysPerYear * __millisecondsPerDay;

        export var __ISO8601RegEx = /^\d{4}-\d\d-\d\d(?:[Tt]\d\d:\d\d(?::\d\d(?:\.\d+?(?:[+-]\d\d?(?::\d\d(?::\d\d(?:.\d+)?)?)?)?)?)?[Zz]?)?$/;
        export var __SQLDateTimeRegEx = /^\d{4}-\d\d-\d\d(?: \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?)?$/; // (Standard SQL Date/Time Format)
        export var __SQLDateTimeStrictRegEx = /^\d{4}-\d\d-\d\d \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?$/; // (Standard SQL Date/Time Format)

        /** The time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        export var __localTimeZoneOffset = (new Date()).getTimezoneOffset() * __millisecondsPerMinute; // ('getTimezoneOffset()' returns minutes, which is converted to ms for '__localTimeZoneOffset')
    }

    // ========================================================================================================================

    /** The "fake" host object is only used when there is no .NET host wrapper integration available.
    * In this case, the environment is running as a simple web application.
    */
    class __NonDreamSpaceHost__ implements IHostBridge {

        constructor() { }

        getCurrentDir(): string { return document.location.href; }

        isStudio(): boolean { return false; }
        isServer(): boolean { return false; }
        isClient(): boolean { return !this.isServer() && !this.isStudio(); }

        setTitle(title: string) { document.title = title; }
        getTitle(): string { return document.title; }

        isDebugMode(): boolean { return false; }
    }

    //var $ICE: IHostBridge_ICE = null;
    // TODO: $ICE loads as a module, and should do this differently.
    //??else
    //??    $ICE = <IHostBridge_ICE>host;

    // ========================================================================================================================

    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    export var global: IStaticGlobals = (function () { }.constructor("return this || global"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])

    export var host: IHostBridge = (() => {
        // ... make sure the host object is valid for at least checking client/server/studio states
        if (typeof host !== 'object' || typeof host.isClient == 'undefined' || typeof host.isServer == 'undefined' || typeof host.isStudio == 'undefined')
            return new __NonDreamSpaceHost__();
        else
            return host; // (running in a valid host (or emulator? ;) )
    })();

    // ========================================================================================================================

    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
    * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
    * 'Environments.Worker'.
    * The core of DreamSpace runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since 
    * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
    * For scripts running on the serve side, this will be set to 'Environments.Server'.
    */
    export var Environment = (function (): Environments {
        if (typeof navigator !== 'object') {
            // On the server side, create a basic "shell" to maintain some compatibility with some system functions.
            (<any>global).window = <any>{
                document: <any>{ title: "SERVER" }
            };
            (<any>global).navigator = <any>{ userAgent: "Mozilla/5.0 (DreamSpace) like Gecko" };
            (<any>global).location = <any>{
                hash: "",
                host: "DreamSpace.org",
                hostname: "DreamSpace.org",
                href: "https://DreamSpace.org/",
                origin: "https://DreamSpace.org",
                pathname: "/",
                port: "",
                protocol: "https:"
            };
            return Environments.Server;
        } else if (typeof window == 'object' && window.document)
            return Environments.Browser;
        else
            return Environments.Worker;
    })();

    // ========================================================================================================================

    // If the host is in debug mode, then this script should try to wait on it.
    // Note: This many only work if the debugger is actually open when this script executes.

    if (typeof host === 'object' && host.isDebugMode && host.isDebugMode())
        debugger;

    // ========================================================================================================================

    var __onInitCallbacks: { (...args: any[]): void | Promise<void> }[] = [];
    /** Used internally to add callbacks to finalize the boot-up process. Functions added using this will be called when the end user calls DreamSpace.init(); */
    export function __onInit(callback: (...args: any[]) => void | Promise<void>) {
        if (typeof callback == 'function')
            if (__onInitCallbacks)
                __onInitCallbacks.push(callback);
            else {
                (console.warn || console.log)("__onInit(callback) warning: called AFTER system is already initialized; callback was: " + callback, callback);
                callback(); // (system already initialized; just execute this now [just in case])
            }
    }

    var initCalled: boolean;

    /** Initialize the DreamSpace system. This MUST be called before the system can be used. 
     * NOTE: This is an ASYNC operation.  This allows any dynamic modules and/or files to
     * complete loading before the system is officially ready to be used.
     * Example usage: "await init();" or "init().then(()=>{...});"
     */
    export async function init(): Promise<DreamSpace> {
        return new Promise<DreamSpace>(async (initCompleted) => {
            if (initCalled) throw "DreamSpace.init() can only be called once.";
            initCalled = true;
            var cbs = __onInitCallbacks;

            for (var i = 0, n = cbs.length; i < n; ++i)
                await (cbs[i]() || Promise.resolve());

            __onInitCallbacks = null; // (make sure init() is not called again)

            (await import("./Logging")).log("DreamSpace.init()", "Initialized and ready.");

            initCompleted();
        });
    }

    // ========================================================================================================================

    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using DreamSpace.JS for
     * .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called before all scripts in the header section of your layout view.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseURL: string;

    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseScriptsURL: string;

    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseCSSURL: string;

    __onInit(async () => {
        var logging = await import("./Logging");
        var path = await import("./Path");
        var log = logging.log, Path = path.Path;

        // ========================================================================================================================================
        // *** At this point the core type system, error handling, and console-based logging are now available. ***
        // ========================================================================================================================================

        log("DreamSpace", "Initializing the DreamSpace system ...");

        baseURL = Path.fix(global.siteBaseURL || baseURL || location.origin); // (example: "https://calendar.google.com/")
        baseScriptsURL = global.scriptsBaseURL ? Path.fix(global.scriptsBaseURL || baseScriptsURL) : baseURL + "js/";
        baseCSSURL = global.cssBaseURL ? Path.fix(global.cssBaseURL || baseCSSURL) : baseURL + "css/";

        log("DreamSpace.baseURL", baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using DreamSpace.JS for .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
        log("DreamSpace.baseScriptsURL", baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");

        if (global.serverWebRoot)
            log("DreamSpace.serverWebRoot", global.serverWebRoot + " (typically set server side within the layout view only while debugging to help resolve script source maps)");

        log("DreamSpace", "Core system loaded.");

        // ========================================================================================================================================
    });
}

// ###########################################################################################################################

/**
 * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
 */
export function sealed<T extends IType>(target: T): T;
export function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
export function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
    if (typeof target == 'object')
        Object.seal(target);
    if (typeof (<any>target).prototype == 'object')
        Object.seal((<any>target).prototype);
    return target;
}

/**
* A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
*/
export function frozen<T extends IType>(target: T): T;
export function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
export function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
    if (typeof target == 'object')
        Object.freeze(target);
    if (typeof (<any>target).prototype == 'object')
        Object.freeze((<any>target).prototype);
    return target;
}

// =======================================================================================================================
// Function Parameter Dependency Injection Support
// TODO: Consider DI support at some point.

/**
 * A decorator used to add DI information for a function parameter.
 * @param args A list of items which are either fully qualified type names, or references to the type functions.
 * The order specified is important.  A new (transient) or existing (singleton) instance of the first matching type found is returned.
 */
export function $(...args: (IType<any> | string)[]) { // this is the decorator factory
    return function (target: any, paramName: string, index: number) { // this is the decorator
        var _target = <IFunctionInfo>target;
        _target.$__argumentTypes[index] = args;
    }
}

// ########################################################################################################################
// Some core basic interfaces to begin with (interfaces don't contribute to the resulting JS size).

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

    /** The path to the module that the type exists in. */
    $_modulePath?: string;

    /** Returns the full name of this type (from the module root).
      * Note: This value is only set as types get registered in the system.
      */
    $__fullname?: string;
}

export interface IType<TInstance = object> {
    new(...args: any[]): TInstance;
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
    ///** This is a reference to the underlying class type for this factory type. */
    //$__type: IType<TInstance>

    /** Represents the static properties on a factory type. */
    $__factoryType?: IFactoryTypeInfo;

    ///** The base factory type of the factory in '$__factory'. This is provided to maintain a factory inheritance chain. */
    //$__baseFactoryType?: { new(): IFactory } & ITypeInfo;
}

export interface NewDelegate<TInstance extends NativeTypes.IObject> { (...args: any[]): TInstance }

export interface InitDelegate<TInstance extends NativeTypes.IObject> { (o: TInstance, isnew: boolean, ...args: any[]): void }

/** Represents the static properties on a factory type. */
export interface IFactoryTypeInfo<TClass extends IType = IType/*, TFactory extends IFactory = IFactory*/> extends IClassInfo<InstanceType<TClass>>, IFactory<TClass> {
    //x /** A factory instance created from this factory type which serves as a singleton for creating instances of the underlying 'TClass' type. */
    //x $__factory?: TFactory;

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
    init?: TInit
}

/** Represents the factory methods of a factory instance, including other protected instance properties used by the factory methods. */
export interface IFactoryInternal<TClass extends IType<object> = IType<object>, TFactory extends { new(): IFactory } = { new(): IFactory }>
    extends IFactory<TClass> {
    /** The underlying type associated with this factory instance. */
    type: TClass; //x & InstanceType<TFactory> & { $__type: TClass }
    //x /** The factory instance containing the methods for creating instances of the underlying type '$__type'. */
    //x factory?: InstanceType<TFactory>;
    /** The immediate base factory type to this factory. */
    super: TFactory;
}

///** Represents a static property on a class module. */
//? export interface IStaticProperty<TDataType> { }

///** Stores static property registration details. */
//?export interface IStaticPropertyInfo<TDataType> {
//    parent: IStaticPropertyInfo<any>; // References the parent static property list (if any).  This is null on most base type.
//    owner: IClassInfo<{}>; // The class type that owns this static property list.
//    namedIndex: { [index: string]: IStaticProperty<any> }; // A named hash table used to quickly lookup a static property by name (shared by all type levels).
//}

export type ExcludeNewInit<T extends { new(...args: any[]): any }> = { [P in Exclude<keyof T, 'new' | 'init'>]: T[P] };
export type FactoryBaseType<T extends IType> =
    {
        new(): InstanceType<T>;
        /** A reference to the parent type derived from for convenience. */
        super: T;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
    }
    & ExcludeNewInit<T>;
//function Factory<T extends IType, K extends keyof T>(base: T): FactoryBaseType<T> { return <any>base; }

// ############################################################################################################################

export interface ICallback<TSender> { (sender?: TSender): void }
/** 
 * A handler that is called when a resource is loaded. 
 * The data supplied may not be the original data. Each handler can apply transformations to the data. Any data returned replaces the
 * underlying data for the request and gets passed to the next callback in the chain (if any), which is useful for filtering.
 * Another resource request can also be returned, in which case the 'transformedData' value of that request becomes the result (unless that
 * request failed, which would cascade the failure the current request as well).
 */
export interface IResultCallback<TSender> { (sender?: TSender, data?: any): any | IResourceRequest }
export interface IErrorCallback<TSender> { (sender?: TSender, error?: any): any }

// ############################################################################################################################

/** Returns true if the specified object can be disposed using this DreamSpace system. */
export function isDisposable(instance: IDisposable) {
    if (instance.$__ds != DreamSpace) return false;
    return typeof instance.dispose == 'function';
}

/** Returns true if the given type (function) represents a primitive JavaScript type constructor. */
export function isPrimitiveType(o: object) {
    var symbol = typeof Symbol != 'undefined' ? Symbol : DreamSpace.global.Object; // (not supported in IE11)
    return (<object>o == DreamSpace.global.Object || <object>o == Array || <object>o == Boolean || <object>o == String
        || <object>o == Number || <object>o == symbol || <object>o == Function || <object>o == Date
        || <object>o == RegExp || <object>o == Error);
}

/**
 * Creates a 'Disposable' type from another base type. This is primarily used to extend primitive types for use as base types to DreamSpace
 * primitives.  This is because Array and String types cannot inherit from the custom 'Object' type AND be instances of the respective primary types.
 * Note: These types are NOT instances of 'DreamSpace.Disposable', since they must have prototype chains that link to other base types.
 * @param {TBaseClass} baseClass The base class to inherit from.
 * @param {boolean} isPrimitiveOrHostBase Set this to true when inheriting from primitive types. This is normally auto-detected, but can be forced in cases
 * where 'new.target' (ES6) prevents proper inheritance from host system base types that are not primitive types.
 * This is only valid if compiling your .ts source for ES5 while also enabling support for ES6 environments. 
 * If you compile your .ts source for ES6 then the 'class' syntax will be used and this value has no affect.
 */
//? * Note 2: 'new' and 'init' functions are NOT implemented. To implement proper defaults, call 'Types.makeFactory()'.
export function makeDisposable<TBaseClass extends IType = ObjectConstructor>(baseClass: TBaseClass, isPrimitiveOrHostBase?: boolean) {
    if (!baseClass) {
        baseClass = <any>DreamSpace.global.Object;
        isPrimitiveOrHostBase = true;
    }
    else if (typeof isPrimitiveOrHostBase == 'undefined') isPrimitiveOrHostBase = isPrimitiveType(baseClass);

    var cls = class Disposable extends baseClass implements IDisposable {
        ///**
        //* Create a new basic object type.
        //* @param value If specified, the value will be wrapped in the created object.
        //* @param makeValuePrivate If true, the value will not be exposed, making the value immutable. Default is false.
        //*/
        //static 'new': (value?: any, makeValuePrivate?: boolean) => IObject;

        ///** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
        //* constructor function to get new instances, and 'dispose()' to release them when done.
        //*/
        //static init: (o: IObject, isnew: boolean, value?: any, makeValuePrivate?: boolean) => void;

        /**
        * Don't create objects using the 'new' operator. Use '{NameSpaces...ClassType}.new()' static methods instead.
        */
        constructor(...args: any[]) {
            if (!DreamSpace.ES6Targeted && isPrimitiveOrHostBase)
                eval("var _super = function() { return null; };"); // (ES6 fix for extending built-in types [calling constructor not supported prior] when compiling for ES5; more details on it here: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work)
            super(...args);
        }
        /** 
        * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
        * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
        * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        *                          false to request that child objects remain connected after disposal (not released). This
        *                          can allow quick initialization of a group of objects, instead of having to pull each one
        *                          from the object pool each time.
        */
        dispose(release?: boolean): void { }
    }

    for (var p in Object.prototype)
        if (Object.prototype.hasOwnProperty(p))
            cls.prototype[p] = Object.prototype[p]; // (make these functions both the same function reference by default)

    return <typeof cls & IObject><any>cls;
}

// ############################################################################################################################

/** Registers this global module in the global scope. The global 'DreamSpace' namespace is returned, if needed.
 * This helps to support:
 * 1. A single object to store global DreamSpace states, such as the host application version, base paths, etc.
 * 2. A global object to store callback functions for API initialization, such as Google Maps, etc.
 * @param uniqueGlobalVarName The global name to use.  By default this is the constant 'DEFAULT_ROOT_NS_NAME', which uses a NAME + GUID to guarantee no collisions.
 */
export function registerGlobal(uniqueGlobalVarName?: string) {
    if (uniqueGlobalVarName)
        USER_GIVEN_GLOBAL_NS_NAME = uniqueGlobalVarName;
    Object.defineProperty(DreamSpace.global, DreamSpace.globalNamespaceName, { enumerable: false, writable: false, configurable: false, value: DreamSpace });
    // (this locked down, as global paths might be used by APIs after future initialization)
    return DreamSpace;
}

// ###########################################################################################################################
