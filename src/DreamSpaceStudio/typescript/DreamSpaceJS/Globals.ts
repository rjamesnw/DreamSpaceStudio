import { IO } from "./IO";
import { Exception } from "./System/Exception";
import { IResourceRequest } from "./ResourceRequest";

// ###########################################################################################################################
// These are functions for creating global scope variables/references that eliminate/minimize collisions between conflicting scripts.
// Normally, each manifest and module gets its own local-global scope; however, in some cases, 3rd-party libraries do not 
// expect or support dot-delimited object paths, so unfortunately a root global callback reference may be required in such cases.
// DreamSpace.Globals contains functions to help deal with this as it relates to loading modules.
// Note: There's no need to use any of these functions directly from within manifest and module scripts.  Each has a local reference
// using the identifiers 'this', 'manifest', or 'module' (accordingly), which provides functions for local-global scope storage.
// ###########################################################################################################################

/** The default global namespace name if no name is specified when calling 'registerGlobal()'.
 * To get the actual registered name, see the global property 'DreamSpace.globalNamespaceName' exported from this module.
 * Note: A symbol is not used, since callbacks placed into API URLs must be strings. Instead, a static pre-generated GUID is appended.
 */
export const DEFAULT_GLOBAL_NS_NAME = "$__DREAMSPACE_GLBOALS_A756B156811A44E59329E44CAA6AFA98"; // (A static GUID is appended)
 var USER_GIVEN_GLOBAL_NS_NAME: string;

export abstract class DreamSpace {
    static get globalNamespaceName() { return USER_GIVEN_GLOBAL_NS_NAME || DEFAULT_GLOBAL_NS_NAME; }
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
    Object.defineProperty(exports, "version", { writable: false });

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
            window = <any>{};
            (<any>window).document = <any>{ title: "SERVER" }
            navigator = <any>{ userAgent: "Mozilla/5.0 (DreamSpace) like Gecko" };
            location = <any>{
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

    /**
     * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
     */
    export function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
        if (typeof target == 'object')
            Object.seal(target);
        if (typeof (<Object>target).prototype == 'object')
            Object.seal((<Object>target).prototype);
        return target;
    }

    /**
    * A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
    */
    export function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
        if (typeof target == 'object')
            Object.freeze(target);
        if (typeof (<Object>target).prototype == 'object')
            Object.freeze((<Object>target).prototype);
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

    // =======================================================================================================================

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

    // ========================================================================================================================================

    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    export var global: IStaticGlobals = global || (function () { }.constructor("return this"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])

    export var host: IHostBridge = (() => {
        // ... make sure the host object is valid for at least checking client/server/studio states
        if (typeof host !== 'object' || typeof host.isClient == 'undefined' || typeof host.isServer == 'undefined' || typeof host.isStudio == 'undefined')
            return new __NonDreamSpaceHost__();
        else
            return host; // (running in a valid host (or emulator? ;) )
    })();

    // If the host is in debug mode, then this script should try to wait on it.
    // Note: This many only work if the debugger is actually open when this script executes.

    if (typeof host === 'object' && host.isDebugMode && host.isDebugMode())
        debugger;

    /**
     * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
     * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
     * named index based lookups, so no string concatenation is used, which makes the process many times faster. 
     * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
     * property names.  To be safe, make sure to always use the 'DreamSpace.Globals.register()' function.  It can create isolated 
     * global variables, and if necessary, also create a safer unique host global scope name.
     */
    export namespace Globals {
        /** Internal: used when initializing DreamSpace. */
        var _globals: IndexedObject = Globals;

        var _namespaces: { [index: string]: string } = {};
        var _nsCount: number = 1;

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
        export function register<T>(resource: IO.IResourceRequest, name: string, initialValue: T, asHostGlobal?: boolean): string;
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
        export function register<T>(namespace: string, name: string, initialValue: T, asHostGlobal?: boolean): string;
        export function register<T>(namespace: any, name: string, initialValue: T, asHostGlobal: boolean = false): string {
            var nsID: string, nsglobals: { [index: string]: any }, alreadyRegistered: boolean = false;
            if (typeof namespace == 'object' && namespace.url)
                namespace = namespace.url;
            if (!(namespace in _namespaces))
                _namespaces[namespace] = nsID = '_' + _nsCount++;
            else {
                nsID = _namespaces[namespace];
                alreadyRegistered = true;
            }
            nsglobals = _globals[nsID];
            if (!nsglobals)
                _globals[nsID] = nsglobals = {};
            //?if (name in nsglobals)
            //?    throw System.Exception.from("The global variable name '" + name + "' already exists in the global namespace '" + namespace + "'.", namespace);
            if (asHostGlobal) {
                // ... set and return a host global reference ...
                var hostGlobalName = "_" + DEFAULT_GLOBAL_NS_NAME + nsID + "_" + name;
                if (!alreadyRegistered) {
                    nsglobals[name] = { "global": global, "hostGlobalName": hostGlobalName };// (any namespace global value referencing the global [window] scope is a redirect to lookup the value name there instead)
                    global[hostGlobalName] = initialValue;
                }
                return hostGlobalName;
            } else {
                // ... set and return a namespace global reference (only works for routines that support dot-delimited callback references) ...
                if (!alreadyRegistered) nsglobals[name] = initialValue;
                if (/^[A-Z_\$]+[A-Z0-9_\$]*$/gim.test(name)) // (if 'name' contains invalid identifier characters, then it needs to be referenced by index)
                    return DEFAULT_GLOBAL_NS_NAME + ".Globals." + nsID + "." + name;
                else
                    return DEFAULT_GLOBAL_NS_NAME + ".Globals." + nsID + "['" + name.replace(/'/g, "\\'") + "']";
            }
        };

        /**
          * Returns true if the specified global variable name is registered.
          */
        export function exists<T>(resource: IO.IResourceRequest, name: string): boolean;
        /**
          * Returns true if the specified global variable name is registered.
         */
        export function exists<T>(namespace: string, name: string): boolean;
        export function exists<T>(namespace: any, name: string): boolean {
            var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
            nsID = _namespaces[namespace];
            if (!nsID) return false;
            nsglobals = _globals[nsID];
            return name in nsglobals;
        };

        /**
          * Erases the registered global variable (by setting it to 'undefined' - which is faster than deleting it).
          * Returns true if successful.
          */
        export function erase<T>(resource: IO.IResourceRequest, name: string): boolean;
        export function erase<T>(namespace: string, name: string): boolean;
        export function erase<T>(namespace: any, name: string): boolean {
            var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
            nsID = _namespaces[namespace];
            if (!nsID) return false;
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return false;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == global) {
                var hgname = existingValue["hostGlobalName"];
                delete global[hgname];
            }
            return nsglobals[name] === void 0;
        };

        /**
          * Clears all registered globals by releasing the associated global object for the specified resource's namespace
          * and creating a new object.  Any host globals are deleted first.
          * Return true on success, and false if the namespace doesn't exist.
          */
        export function clear<T>(resource: IO.IResourceRequest): boolean;
        /**
          * Clears all registered globals by releasing the associated global object for the specified resource's namespace
          * and creating a new object.  Any host globals are deleted first.
          * Return true on success, and false if the namespace doesn't exist.
          */
        export function clear<T>(namespace: string): boolean;
        export function clear<T>(namespace: any): boolean {
            var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
            nsID = _namespaces[namespace];
            if (!nsID) return false;
            nsglobals = _globals[nsID];
            for (var name in nsglobals) { // (clear any root globals first before resetting the namespace global instance)
                var existingValue = nsglobals[name];
                if (existingValue && existingValue["global"] == global)
                    delete global[existingValue["hostGlobalName"]];
            }
            _globals[nsID] = {};
            return true;
        };

        /**
          * Sets and returns a global property value.
          */
        export function setValue<T>(resource: IO.IResourceRequest, name: string, value: T): T;
        /**
          * Sets and returns a global property value.
          */
        export function setValue<T>(namespace: string, name: string, value: T): T;
        export function setValue<T>(namespace: any, name: string, value: T): T {
            var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
            nsID = _namespaces[namespace];
            if (!nsID) {
                //?throw System.Exception.from("The namespace '" + namespace + "' does not exist - did you remember to call 'DreamSpace.Globals.register()' first?", namespace);
                register(namespace, name, value); // (implicitly register the namespace as a local global)
                nsID = _namespaces[namespace];
            }
            nsglobals = _globals[nsID];
            //?if (!(name in nsglobals))
            //?    throw System.Exception.from("The global variable name '" + name + "' was not found in the global namespace '" + namespace + "' - did you remember to call 'DreamSpace.Globals.register()' first?", namespace);
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == global) {
                return global[existingValue["hostGlobalName"]] = value;
            }
            else return nsglobals[name] = value;
        };

        /**
        * Gets a global property value.
        */
        export function getValue<T>(resource: IO.IResourceRequest, name: string): T;
        /**
        * Gets a global property value.
        */
        export function getValue<T>(namespace: string, name: string): T;
        export function getValue<T>(namespace: any, name: string): T {
            var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
            nsID = _namespaces[namespace];
            if (!nsID)
                throw "The namespace '" + namespace + "' does not exist - did you remember to call 'DreamSpace.Globals.register()' first?";
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return void 0;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == global) {
                return global[existingValue["hostGlobalName"]];
            }
            else return nsglobals[name];
        };
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

    /** Returns the full name of this type (includes the namespace).
      * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
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


// ===================================================================================================================

/**
 * Supports Iteration for ES5/ES3. To use, create a new type derived from this one, or implement the IEnumerable<T> interface.
 */
export abstract class Enumerable<T> implements Iterator<T>
{
    next(value?: any): IteratorResult<T> {
        throw Exception.notImplemented('next', this);
    }

    return(value?: any): IteratorResult<T> {
        throw Exception.notImplemented('return', this);
    }

    throw(e?: any): IteratorResult<T> {
        throw Exception.notImplemented('throw', this);
    }
}

/**
* Supports Iteration for ES5/ES3. To use, implement this interface, or create a new type derived from Enumerable<T>.
*/
export interface IEnumerable<T> extends Enumerable<T> { }

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

// ###########################################################################################################################

/** Registers this global module in the global scope. The global 'DreamSpace' namespace is returned, if needed.
 * This helps to support:
 * 1. A single object to store global DreamSpace states, such as the host application version, base paths, etc.
 * 2. A global object to store callback functions for API initialization, such as Google Maps.
 * @param uniqueGlobalVarName The global name to use.  By default this is the constant 'DEFAULT_ROOT_NS_NAME', which uses a NAME + GUID to guarantee no collisions.
 */
export default function registerGlobal(uniqueGlobalVarName?: string) {
    if (uniqueGlobalVarName)
        USER_GIVEN_GLOBAL_NS_NAME = uniqueGlobalVarName;
    Object.defineProperty(DreamSpace.global, DreamSpace.globalNamespaceName, { enumerable: false, writable: false, configurable: false, value: DreamSpace });
    // (this locked down, as global paths might be used by APIs after future initialization)
    return DreamSpace;
}

// ###########################################################################################################################

