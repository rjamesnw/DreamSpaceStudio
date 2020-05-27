// ###########################################################################################################################
// These are functions for bootstrapping the core system.  It helps to set up common types and functions that will be needed,
// such as DS.init() to execute callbacks to finalize to loading process (must be called by the end user).
// ###########################################################################################################################

type char = string;

interface Array<T> {
    /** Removes the specified item and returns true if removed, or false if not found. */
    remove(item: T): boolean;
    /** Removes an item at the specified index and returns true if removed, or false if the index is out of bounds. */
    removeAt(index: number): boolean;
    /** 
     * Returns the maximum value found using comparison function, or default primitive comparison if not supplied. Undefined items are ignored. 
     * The predicate function should return -1 if 'a' is less than 'b', 0 if equal, and 1 if 'a' is greater than 'b'.
     * @returns The result as an array, where the first item is the maximum value found, and the second is the index where it was found (or -1 if not found).
     */
    max(predicate?: (a: T, b: T, aIndex: number, bIndex: number) => number): [T, number];
}
if (!Array.prototype.remove) // Primarily to help support conversions from C# - also, this should exist anyhow!
    Array.prototype.remove = function (this: Array<any>, item: any) {
        var i = this.indexOf(this);
        return i > -1 ? (this.splice(i, 1), true) : false;
    };
if (!Array.prototype.removeAt) // Primarily to help support conversions from C# - also, this should exist anyhow!
    Array.prototype.removeAt = function (this: Array<any>, index: number) {
        return index >= 0 && index < this.length ? (this.splice(index, 1), true) : false;
    };
if (!Array.prototype.max) // Primarily to help support conversions from C# - also, this should exist anyhow!
    Array.prototype.max = function (this: Array<any>, predicate?: (a: any, b: any, aIndex: number, bIndex: number) => number) {
        var maxValue: any = void 0, lastIndex = -1;
        for (var i = 0, n = this.length; i < n; ++i)
            var v = this[i];
        if (v !== void 0) {
            var result = maxValue === void 0 ? 1 // (if max value is undefined, it is greater by default since it exists)
                : typeof predicate == 'function' ? predicate(maxValue, v, lastIndex, i) : v < maxValue ? -1 : v > maxValue ? 1 : 0;
            if (result > 0) {
                maxValue = v;
                lastIndex = i;
            }
        }
        return [maxValue, lastIndex];
    };

interface String {
    /** Trims the given character from the start of the string and returns the new string. */
    trimLeftChar(char: char): string; // Primarily to help support conversions from C# - also, this should exist anyhow!

    /** Trims the given character from the end of the string and returns the new string. */
    trimRightChar(char: char): string; // Primarily to help support conversions from C# - also, this should exist anyhow!

    /**
     * Returns true if the specified string is at the start of this string.
     */
    startsWith(str: string): boolean; // Primarily to help support conversions from C# - also, this should exist anyhow!

    /**
     * Returns true if the specified string is at the end of this string.
     */
    endsWith(str: string): boolean; // Primarily to help support conversions from C# - also, this should exist anyhow!
}
if (!String.prototype.trimLeftChar)
    String.prototype.trimLeftChar = function (this: string, char: char) {
        var s = this;
        while (s.length && s[0] === char)
            s = s.substr(1);
        return s;
    };
if (!String.prototype.trimRightChar)
    String.prototype.trimRightChar = function (this: string, char: char) {
        var s = this;
        while (s.length && s[s.length - 1] === char)
            s = s.substr(0, this.length - 1);
        return s;
    };
if (!String.prototype.startsWith)
    String.prototype.startsWith = function (this: string, str: string) {
        if (str === void 0 || str === null) return false;
        if (typeof str != 'string') str = '' + str;
        return this.substr(0, str.length) === str;
    };
if (!String.prototype.endsWith)
    String.prototype.endsWith = function (this: string, str: string) {
        if (str === void 0 || str === null) return false;
        if (typeof str != 'string') str = '' + str;
        return this.substr(-str.length) === str;
    };


interface IndexedObject<T = any> {
    [name: string]: T;
}

type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

interface Promise<T = void> { }

type Action2<T, T2> = (a: T, b: T2) => T;
type Action<T = void> = (a: T) => void;

type Func2<T, T2, R> = (a: T, b: T2) => R;
type Func1<T, R> = (a: T) => R;
type Func<R = any> = () => R;

interface IStaticGlobals {
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
    JSON: JSON;

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

var isNode = typeof global == 'object' && !!global.process && !!global.process.versions && !!global.process.versions.node;

/** The default global namespace name if no name is specified when calling 'registerGlobal()'.
 * To get the actual registered name, see the global property 'DreamSpace.globalNamespaceName' exported from this module.
 * Note: A symbol is not used, since callbacks placed into API URLs must be strings. Instead, a static pre-generated GUID is appended.
 */
const DEFAULT_GLOBAL_NS_NAME = "$__DREAMSPACE_GLBOALS_A756B156811A44E59329E44CAA6AFA98"; // (A static GUID is appended)
var USER_GIVEN_GLOBAL_NS_NAME: string;

/** This is a global object used by all other modules in the system for sharing and updating global states. It is registered on the global
 * scope by calling 'registerGlobal(uniqueGlobalVarName)', which uses the NAME+GUID constant value stored in the exported
 * 'DEFAULT_ROOT_NS_NAME' by default.
 */
namespace DS {
    /** The global DreamSpace namespace name.  Call 'registerGlobal()' to specify a custom name, otherwise the default 'DEFAULT_GLOBAL_NS_NAME' is used. */
    export var globalNamespaceName: string;
    Object.defineProperty(DS, "globalNamespaceName", { configurable: false, enumerable: true, get: () => { return USER_GIVEN_GLOBAL_NS_NAME || DEFAULT_GLOBAL_NS_NAME; } });

    /** The root DreamSpace namespace, which is just DreamSpace.global[DreamSpace.globalNamespaceName] (which is just 'window[DreamSpace.globalNamespaceName]' on browser clients). */
    export var rootns: string;
    Object.defineProperty(DS, "rootns", { configurable: false, enumerable: true, get: () => { return global[globalNamespaceName]; } });

    /** The current application version (user defined). */
    export var appVersion: string;

    /** The platform-specific end of line character. 
     *  For browsers, the internet standard is \r\n.
     *  For NodeJS on Windows, the standard is \r\n.
     *  For NodeJS on all others this defaults to \n.
     */
    export var EOL = "\r\n"; // The internet standard.  The server side code will update this to the platform standard.

    /**
     * The root namespace for the DreamSpace system.
     */
    // ------------------------------------------------------------------------------------------------------------------------

    /** The current version of the DreamSpace system. */
    export var version = "0.0.1";
    Object.defineProperty(DS, "version", { writable: false });

    /** Returns the current user defined application version, or a default version. */
    export var getAppVersion = () => appVersion || "0.0.0";

    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< DreamSpace Client OS - v" + version + " >=- ");
        else
            console.log("%c -=< %cDreamSpace Client OS - v" + version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");

    // ------------------------------------------------------------------------------------------------------------------------

    export const staticConstructor: unique symbol = Symbol("static constructor");

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

    /** Returns true if the given value is null or undefined. 
     * Note: In NodeJS you can use the native 'isNullOrUndefined()' function instead.
     */
    export function isNullOrUndefined(value: any) { return value === void 0 || value === null; }

    /** Null or undefined to default. Returns the given value if it is NOT undefined or null, otherwise the default value is returned. 
     * @description Side-note: Name was inspired from the VBA function 'NZ()' (Null to Zero; see https://support.office.com/en-us/article/Nz-Function-8ef85549-cc9c-438b-860a-7fd9f4c69b6c).
     * @param value Value to check.
     * @param defaultVal New value if "value" is undefined or null.
     */
    export function nud(value: any, defaultVal: any) { return value === void 0 || value === null ? defaultVal : value; }

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

    //var $ICE: IHostBridge_ICE = null;
    // TODO: $ICE loads as a module, and should do this differently.
    //??else
    //??    $ICE = <IHostBridge_ICE>host;

    // ========================================================================================================================

    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    export var global: IStaticGlobals = typeof globalThis != 'undefined' ? globalThis : (function () { }.constructor("return this || global"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])

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
    export async function init(): Promise<typeof DS> {
        return new Promise<typeof DS>(async (initCompleted) => {
            if (initCalled) throw "DreamSpace.init() can only be called once.";
            initCalled = true;
            var cbs = __onInitCallbacks;

            for (var i = 0, n = cbs.length; i < n; ++i)
                await (cbs[i]() || Promise.resolve());

            __onInitCallbacks = null; // (make sure init() is not called again)

            log("DreamSpace.init()", "Initialized and ready.");

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

    __onInit(() => {
        // ====================================================================================================================
        // *** At this point the core type system, error handling, and console-based logging are now available. ***
        // ====================================================================================================================

        log("DreamSpace", "Initializing the DreamSpace system ...");

        baseURL = Path.fix(global.siteBaseURL || baseURL || location.origin); // (example: "https://calendar.google.com/")
        baseScriptsURL = global.scriptsBaseURL ? Path.fix(global.scriptsBaseURL || baseScriptsURL) : baseURL + "js/";
        baseCSSURL = global.cssBaseURL ? Path.fix(global.cssBaseURL || baseCSSURL) : baseURL + "css/";

        log("DreamSpace.baseURL", baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using DreamSpace.JS for .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
        log("DreamSpace.baseScriptsURL", baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");

        if (global.serverWebRoot)
            log("DreamSpace.serverWebRoot", global.serverWebRoot + " (typically set server side within the layout view only while debugging to help resolve script source maps)");

        log("DreamSpace", "Core system loaded.");

        // ====================================================================================================================
    });

    // ========================================================================================================================

    /** Returns true if the given type (function) represents a primitive JavaScript type constructor. */
    export function isPrimitiveType(o: object) { //?
        var symbol = typeof Symbol != 'undefined' ? Symbol : DS.global.Object; // (not supported in IE11)
        return (<object>o == DS.global.Object || <object>o == Array || <object>o == Boolean || <object>o == String
            || <object>o == Number || <object>o == symbol || <object>o == Function || <object>o == Date
            || <object>o == RegExp || <object>o == Error);
    }

    // ========================================================================================================================

    /** Registers this global module in the global scope. The global 'DS' namespace is returned, if needed.
     * This helps to support:
     * 1. A single object to store global DreamSpace states, such as the host application version, base paths, etc.
     * 2. A global object to store callback functions for API initialization, such as Google Maps, etc.
     * @param uniqueGlobalVarName The global name to use.  By default this is the constant 'DEFAULT_ROOT_NS_NAME', which uses a NAME + GUID to guarantee no collisions.
     */
    export function registerGlobal(uniqueGlobalVarName?: string) {
        if (uniqueGlobalVarName)
            USER_GIVEN_GLOBAL_NS_NAME = uniqueGlobalVarName;
        Object.defineProperty(DS.global, DS.globalNamespaceName, { enumerable: false, writable: false, configurable: false, value: DS });
        // (this locked down, as global paths might be used by APIs after future initialization)
        return DS;
    }

    // ========================================================================================================================

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

    // =======================================================================================================================

    /** Must be used to load a module before it can be used.
     * This call returns a reference to the loaded module. 
     * See 'modules$()' for loading multiple modules. */
    export async function module<T extends {}>(ns: T): Promise<T> { return ns instanceof Promise ? await ns : ns; }

    /** Can be used to load multiple modules. You can also use 'module()' to load and return a single module. */
    export async function modules(...ns: {}[]): Promise<void> { for (var i = 0, n = ns.length; i < n; ++i) await module(ns[i]); }

    /** Must be used to load a type before it can be used. */
    export var type = module;

    /** Can be used to load multiple types. You can also use 'type()' to load and return a single type. */
    export var types = modules;

    // =======================================================================================================================

    /** The 'Abstracts' namespace holds functions, properties, and types that are shared between the server and client sides. Each side
     * then extends the behaviors for the environment. Most types in the 'Abstracts' namespace are abstract types and need to be implemented.
     */
    export namespace Abstracts { }

    // =======================================================================================================================
}

if (isNode && exports)
    eval("exports.DS = DS;"); // (when require('api') is used we need to export the DS namespace, which will contain the whole DS global API)

// ########################################################################################################################
// Some core basic interfaces to begin with (interfaces don't contribute to the resulting JS size).

/** Provides a mechanism for object cleanup.
* See also: 'dispose(...)' helper functions. */
interface IDisposable {
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
interface ITypeInfo {
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

interface IType<TInstance = object> {
    new(...args: any[]): TInstance;
}

interface IFunction<ReturnType = any> {
    (...args: any[]): ReturnType;
}


/** Type-cast function objects to this interface to access type specific information. */
interface IFunctionInfo extends Function, ITypeInfo {
    (...args: any[]): any;

    /** If specified, defines the expected types to use for injection into the function's parameters.
     * Each entry is for a single parameter, and is a array of items where each item is either a string, naming the fully-qualified type name, or an object reference to the type (function) that is expected.
     * To declare the parameter types for a constructor function (or any function), use the @
     */
    $__argumentTypes?: (IType<any> | string)[][];
}

// ############################################################################################################################

interface ICallback<TSender> { (sender?: TSender): void }
/** 
 * A handler that is called when a resource is loaded. 
 * The data supplied may not be the original data. Each handler can apply transformations to the data. Any data returned replaces the
 * underlying data for the request and gets passed to the next callback in the chain (if any), which is useful for filtering.
 * Another resource request can also be returned, in which case the 'transformedData' value of that request becomes the result (unless that
 * request failed, which would cascade the failure the current request as well).
 */
interface IResultCallback<TSender> { (sender?: TSender, data?: any): any | DS.IResourceRequest }
interface IErrorCallback<TSender> { (sender?: TSender, error?: any): any }

// ###########################################################################################################################
