// ###########################################################################################################################
// These are functions for creating global scope variables/references that eliminate/minimize collisions between conflicting scripts.
// Normally, each manifest and module gets its own local-global scope; however, in some cases, 3rd-party libraries do not 
// expect or support dot-delimited object paths, so unfortunately a root global callback reference may be required in such cases.
// DreamSpace.Globals contains functions to help deal with this as it relates to loading modules.
// Note: There's no need to use any of these functions directly from within manifest and module scripts.  Each has a local reference
// using the identifiers 'this', 'manifest', or 'module' (accordingly), which provides functions for local-global scope storage.
// ###########################################################################################################################

/** The root namespace name as a string constant. */
const $__ROOT_DREAMSPACE_NAMESPACE_NAME = "DreamSpace";

/**
 * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
 * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
 * named index based lookups, so no string concatenation is used, which makes the process many times faster. 
 * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
 * property names.  To be safe, make sure to always use the 'DreamSpace.Globals.register()' function.  It can create isolated 
 * global variables, and if necessary, also create a safer unique host global scope name.
 */
namespace DreamSpace {
    /** The current application version (user defined). */
    var appVersion: string;

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

    export var constructor = Symbol("static constructor");

    // ------------------------------------------------------------------------------------------------------------------------

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

    var $ICE: IHostBridge_ICE = null;
    // TODO: $ICE loads as a module, and should do this differently.
    //??else
    //??    $ICE = <IHostBridge_ICE>host;

    // =======================================================================================================================
    // If the host is in debug mode, then this script should try to wait on it.
    // Note: This many only work if the debugger is actually open when this script executes.

    if (typeof host === 'object' && host.isDebugMode && host.isDebugMode())
        debugger;

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

    // ========================================================================================================================================

    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    export var global: IStaticGlobals = (function () { }.constructor("return this"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])

    export var host: IHostBridge = (() => {
        // ... make sure the host object is valid for at least checking client/server/studio states
        if (typeof host !== 'object' || typeof host.isClient == 'undefined' || typeof host.isServer == 'undefined' || typeof host.isStudio == 'undefined')
            return new __NonDreamSpaceHost__();
        else
            return host; // (running in a valid host (or emulator? ;) )
    })();

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
        export function register<T>(resource: System.IO.IResourceRequest, name: string, initialValue: T, asHostGlobal?: boolean): string;
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
                var hostGlobalName = "_" + $__ROOT_DREAMSPACE_NAMESPACE_NAME + nsID + "_" + name;
                if (!alreadyRegistered) {
                    nsglobals[name] = { "global": DreamSpace.global, "hostGlobalName": hostGlobalName };// (any namespace global value referencing the global [window] scope is a redirect to lookup the value name there instead)
                    DreamSpace.global[hostGlobalName] = initialValue;
                }
                return hostGlobalName;
            } else {
                // ... set and return a namespace global reference (only works for routines that support dot-delimited callback references) ...
                if (!alreadyRegistered) nsglobals[name] = initialValue;
                if (/^[A-Z_\$]+[A-Z0-9_\$]*$/gim.test(name)) // (if 'name' contains invalid identifier characters, then it needs to be referenced by index)
                    return $__ROOT_DREAMSPACE_NAMESPACE_NAME + ".Globals." + nsID + "." + name;
                else
                    return $__ROOT_DREAMSPACE_NAMESPACE_NAME + ".Globals." + nsID + "['" + name.replace(/'/g, "\\'") + "']";
            }
        };

        /**
          * Returns true if the specified global variable name is registered.
          */
        export function exists<T>(resource: System.IO.IResourceRequest, name: string): boolean;
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
        export function erase<T>(resource: System.IO.IResourceRequest, name: string): boolean;
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
        export function clear<T>(resource: System.IO.IResourceRequest): boolean;
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
        export function setValue<T>(resource: System.IO.IResourceRequest, name: string, value: T): T;
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
                return DreamSpace.global[existingValue["hostGlobalName"]] = value;
            }
            else return nsglobals[name] = value;
        };

        /**
        * Gets a global property value.
        */
        export function getValue<T>(resource: System.IO.IResourceRequest, name: string): T;
        /**
        * Gets a global property value.
        */
        export function getValue<T>(namespace: string, name: string): T;
        export function getValue<T>(namespace: any, name: string): T {
            var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
            nsID = _namespaces[namespace];
            if (!nsID)
                throw System.Exception.from("The namespace '" + namespace + "' does not exist - did you remember to call 'DreamSpace.Globals.register()' first?", namespace);
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return void 0;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == global) {
                return DreamSpace.global[existingValue["hostGlobalName"]];
            }
            else return nsglobals[name];
        };
    }
}

// ###########################################################################################################################
