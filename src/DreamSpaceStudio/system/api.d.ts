interface Array<T> {
    /** Removes the specified item and returns true if removed, or false if not found. */
    remove(item: T): boolean;
}
interface IndexedObject<T = any> {
    [name: string]: T;
}
declare type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
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
declare var isNode: boolean;
/** The default global namespace name if no name is specified when calling 'registerGlobal()'.
 * To get the actual registered name, see the global property 'DreamSpace.globalNamespaceName' exported from this module.
 * Note: A symbol is not used, since callbacks placed into API URLs must be strings. Instead, a static pre-generated GUID is appended.
 */
declare const DEFAULT_GLOBAL_NS_NAME = "$__DREAMSPACE_GLBOALS_A756B156811A44E59329E44CAA6AFA98";
declare var USER_GIVEN_GLOBAL_NS_NAME: string;
/** This is a global object used by all other modules in the system for sharing and updating global states. It is registered on the global
 * scope by calling 'registerGlobal(uniqueGlobalVarName)', which uses the NAME+GUID constant value stored in the exported
 * 'DEFAULT_ROOT_NS_NAME' by default.
 */
declare namespace DS {
    /** The global DreamSpace namespace name.  Call 'registerGlobal()' to specify a custom name, otherwise the default 'DEFAULT_GLOBAL_NS_NAME' is used. */
    var globalNamespaceName: string;
    /** The root DreamSpace namespace, which is just DreamSpace.global[DreamSpace.globalNamespaceName] (which is just 'window[DreamSpace.globalNamespaceName]' on browser clients). */
    var rootns: string;
    /** The current application version (user defined). */
    var appVersion: string;
    /** The platform-specific end of line character.
     *  For browsers, the internet standard is \r\n.
     *  For NodeJS on Windows, the standard is \r\n.
     *  For NodeJS on all others this defaults to \n.
     */
    var EOL: string;
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
    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
    function isEmpty(obj: any): boolean;
    /** Returns true if the given value is null or undefined.
     * Note: In NodeJS you can use the native 'isNullOrUndefined()' function instead.
     */
    function isNullOrUndefined(value: any): boolean;
    /** Null or undefined to default. Returns the given value if it is NOT undefined or null, otherwise the default value is returned.
     * @description Side-note: Name was inspired from the VBA function 'NZ()' (Null to Zero; see https://support.office.com/en-us/article/Nz-Function-8ef85549-cc9c-438b-860a-7fd9f4c69b6c).
     * @param value Value to check.
     * @param defaultVal New value if "value" is undefined or null.
     */
    function nud(value: any, defaultVal: any): any;
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
    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
    * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
    * 'Environments.Worker'.
    * The core of DreamSpace runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
    * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
    * For scripts running on the serve side, this will be set to 'Environments.Server'.
    */
    var Environment: Environments;
    /** Used internally to add callbacks to finalize the boot-up process. Functions added using this will be called when the end user calls DreamSpace.init(); */
    function __onInit(callback: (...args: any[]) => void | Promise<void>): void;
    /** Initialize the DreamSpace system. This MUST be called before the system can be used.
     * NOTE: This is an ASYNC operation.  This allows any dynamic modules and/or files to
     * complete loading before the system is officially ready to be used.
     * Example usage: "await init();" or "init().then(()=>{...});"
     */
    function init(): Promise<typeof DS>;
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
    /** Returns true if the given type (function) represents a primitive JavaScript type constructor. */
    function isPrimitiveType(o: object): boolean;
    /** Registers this global module in the global scope. The global 'DS' namespace is returned, if needed.
     * This helps to support:
     * 1. A single object to store global DreamSpace states, such as the host application version, base paths, etc.
     * 2. A global object to store callback functions for API initialization, such as Google Maps, etc.
     * @param uniqueGlobalVarName The global name to use.  By default this is the constant 'DEFAULT_ROOT_NS_NAME', which uses a NAME + GUID to guarantee no collisions.
     */
    function registerGlobal(uniqueGlobalVarName?: string): typeof DS;
    /**
     * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
     */
    function sealed<T extends IType>(target: T): T;
    function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
    /**
    * A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
    */
    function frozen<T extends IType>(target: T): T;
    function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
    /**
     * A decorator used to add DI information for a function parameter.
     * @param args A list of items which are either fully qualified type names, or references to the type functions.
     * The order specified is important.  A new (transient) or existing (singleton) instance of the first matching type found is returned.
     */
    function $(...args: (IType<any> | string)[]): (target: any, paramName: string, index: number) => void;
    /** Must be used to load a module before it can be used.
     * This call returns a reference to the loaded module.
     * See 'modules$()' for loading multiple modules. */
    function module<T extends {}>(ns: T): Promise<T>;
    /** Can be used to load multiple modules. You can also use 'module()' to load and return a single module. */
    function modules(...ns: {}[]): Promise<void>;
    /** Must be used to load a type before it can be used. */
    var type: typeof module;
    /** Can be used to load multiple types. You can also use 'type()' to load and return a single type. */
    var types: typeof modules;
    /** The 'Abstracts' namespace holds functions, properties, and types that are shared between the server and client sides. Each side
     * then extends the behaviors for the environment. Most types in the 'Abstracts' namespace are abstract types and need to be implemented.
     */
    namespace Abstracts { }
}
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
    new (...args: any[]): TInstance;
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
interface ICallback<TSender> {
    (sender?: TSender): void;
}
/**
 * A handler that is called when a resource is loaded.
 * The data supplied may not be the original data. Each handler can apply transformations to the data. Any data returned replaces the
 * underlying data for the request and gets passed to the next callback in the chain (if any), which is useful for filtering.
 * Another resource request can also be returned, in which case the 'transformedData' value of that request becomes the result (unless that
 * request failed, which would cascade the failure the current request as well).
 */
interface IResultCallback<TSender> {
    (sender?: TSender, data?: any): any | DS.IResourceRequest;
}
interface IErrorCallback<TSender> {
    (sender?: TSender, error?: any): any;
}
declare namespace DS {
    /** Type-cast class/function references to this interface to access type specific information, where available. */
    interface ITypeInfo {
        /** Returns the name of this type.
          * Note: This is the object type name taken from the constructor (if one exists), and is not the FULL type name (no namespace).
          * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
          */
        $__name?: string;
        $__fullname?: string;
    }
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
    /** One or more utility functions to ease development within DreamSpace environments. */
    namespace Utilities {
        /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
        function escapeRegex(regExStr: string): string;
        /** This locates names of properties where only a reference and the object context is known.
        * If a reference match is found, the property name is returned, otherwise the result is 'undefined'.
        */
        function getReferenceName(obj: IndexedObject, reference: object): string;
        /** Erases all properties on the object, instead of deleting them (which takes longer).
        * @param {boolean} ignore An optional list of properties to ignore when erasing. The properties to ignore should equate to 'true'.
        * This parameter expects an object type because that is faster for lookups than arrays, and developers can statically store these in most cases.
        */
        function erase(obj: IndexedObject, ignore?: {
            [name: string]: boolean;
        }): {};
        /** Makes a deep copy of the specified value and returns it. If the value is not an object, it is returned immediately.
        * For objects, the deep copy is made by */
        function clone(value: any): any;
        /** Dereferences a property path in the form "A.B.C[*].D..." and returns the right most property value, if exists, otherwise
        * 'undefined' is returned.  If path is invalid, an exception will be thrown.
        * @param {string} path The delimited property path to parse.
        * @param {object} origin The object to begin dereferencing with.  If this is null or undefined then it defaults to the global scope.
        * @param {boolean} unsafe If false (default) then a highly optimized routine is used to parse the path.  If true, then 'eval()' is used as an even faster approach.
        *                         The reason for the option is that 'eval' is up to 4x faster, and is best used only if the path is guaranteed not to contain user entered
        *                         values, or ANY text transmitted insecurely.
        *                         Note: The 'eval' that is used is 'DS.eval()', which is closed over the global scope (and not the DS module's private scope).
        *                         'window.eval()' is not called directly in this function.
        */
        function dereferencePropertyPath(path: string, origin?: IndexedObject, unsafe?: boolean): any;
        /** Waits until a property of an object becomes available (i.e. is no longer 'undefined').
          * @param {Object} obj The object for the property.
          * @param {string} propertyName The object property.
          * @param {number} timeout The general amount of timeout to wait before failing, or a negative value to wait indefinitely.
          */
        function waitReady(obj: IndexedObject, propertyName: string, callback: Function, timeout?: number, timeoutCallback?: Function): void;
        /** Helps support cases where 'apply' is missing for a host function object (i.e. IE7 'setTimeout', etc.).  This function
        * will attempt to call '.apply()' on the specified function, and fall back to a work around if missing.
        * @param {Function} func The function to call '.apply()' on.
        * @param {Object} _this The calling object, which is the 'this' reference in the called function (the 'func' argument).
        * Note: This must be null for special host functions, such as 'setTimeout' in IE7.
        * @param {any} args The arguments to apply to given function reference (the 'func' argument).
        */
        function apply(func: Function, _this: Object, args: any[]): any;
        /**
         * Creates and returns a new version-4 (randomized) GUID/UUID (unique identifier). The uniqueness of the result
         * is enforced by locking the first part down to the current local date/time (not UTC) in milliseconds, along with
         * a counter value in case of fast repetitive calls. The rest of the ID is also randomized with the current local
         * time, along with a checksum of the browser's "agent" string and the current document URL.
         * This function is also supported server side; however, the "agent" string and document location are fixed values.
         * @param {boolean} hyphens If true (default) then hyphens (-) are inserted to separate the GUID parts.
         */
        function createGUID(hyphens?: boolean): string;
        /** Returns the name of a namespace or variable reference at runtime. */
        function nameof(selector: () => any, fullname?: boolean): string;
        var FUNC_NAME_REGEX: RegExp;
        /** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
        function getFunctionName(func: Function): string;
        /** Returns the type name for an object instance registered with 'AppDomain.registerType()'.  If the object does not have
        * type information, and the object is a function, then an attempt is made to pull the function name (if one exists).
        * Note: This function returns the type name ONLY (not the FULL type name [no namespace path]).
        * Note: The name will be undefined if a type name cannot be determined.
        * @param {object} object The object to determine a type name for.  If the object type was not registered using 'AppDomain.registerType()',
        * and the object is not a function, no type information will be available. Unregistered function objects simply
        * return the function's name.
        * @param {boolean} cacheTypeName (optional) If true (default), the name is cached using the 'ITypeInfo' interface via the '$__name' property.
        * This helps to speed up future calls.
        */
        function getTypeName(object: object, cacheTypeName?: boolean): string;
        /**
         * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known.
         * @see getTypeName()
         */
        function getFullTypeName(object: object, cacheTypeName?: boolean): string;
        /** An utility to extend a TypeScript namespace, which returns a string to be executed using 'eval()'.
         * When executed BEFORE the namespace to be added, it creates a pre-existing namespace reference that forces typescript to update.
         * Example 1: extendNS(()=>Local.NS, "Imported.NS");
         * Example 2: extendNS(()=>Local.NS, ()=>Imported.NS);
         * @param selector The local namespace that will extend the target.
         * @param name A selector or dotted identifier path to the target namespace name to extend from.
         */
        function extendNS(selector: () => any, name: string | (() => any)): string;
        function ciIndexOf(arr: Array<any>, value: any): number;
        /** Attempts to parse a string as JSON and returns the result.  If the value is not a string, or the conversion fails,
         * the value is returned as is.
         * This is used mainly to convert JSON strings to objects, while allowing all other values to pass through as is.
         */
        function parseJsonElseKeepAsIs<T = any>(value: any): T;
    }
}
declare namespace DS {
    /** Used with 'DreamSpace.log(...)' to write to the host console, if available.
      */
    enum LogTypes {
        /** An important or critical action was a success. */
        Success = -1,
        /** General logging information - nothing of great importance (such as writing messages to developers in the console, or perhaps noting the entry/exit of a section of code), but could be good to know during support investigations. */
        Normal = 0,
        /** An important action has started, or important information must be noted (usually not debugging related, but could be good to know during support investigations). */
        Info = 1,
        /** A warning or non critical error has occurred. */
        Warning = 2,
        /** A error has occurred (usually critical). */
        Error = 3,
        /** Debugging details only. In a live system debugging related log writes are ignored. */
        Debug = 4,
        /** Usually used with more verbose logging to trace execution. In a live system debugging related log writes are ignored. */
        Trace = 5
    }
    /** Logs the message to the console (if available) and returns the message.
      *  By default errors are thrown instead of being returned.  Set 'throwOnError' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {LogTypes} type The type of message to log.
      * @param {boolean} throwOnError If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    function log(title: string, message: string, type?: LogTypes, source?: object, throwOnError?: boolean, useLogger?: boolean): string;
    /** Logs the error message to the console (if available) and throws the error.
      *  By default errors are thrown instead of being returned.  Set 'throwException' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {boolean} throwException If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    function error(title: string, message: string, source?: object, throwException?: boolean, useLogger?: boolean): string;
}
declare namespace DS {
    /** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
      * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
      */
    function getErrorMessage(errorSource: any | string | Error | Exception, includeStack?: boolean): string;
}
declare namespace DS {
    /**
     * The Exception object is used to record information about errors that occur in an application.
     * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
     */
    class Exception extends Error {
        /** Stores nested exceptions in cases where multiple exceptions are thrown. */
        innerException?: Exception;
        /** An optional user defined value related to the error. */
        source?: any;
        /** The call trace, which may include arguments. */
        callTrace?: string;
        /** The stack split up into an array of lines. */
        stackLines?: string[];
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        /** Records information about errors that occur in the application.
        * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
        * @param {string | Error | Exception | Diagnostics.ILogItem} message The error message, or another supported object type to copy a message from.
        * @param {any} source An object that is associated with the message, or null.
        * @param {Exception} innerException An optional exception that is the cause of the current new exception.
        * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
        */
        constructor(message: string | Error | Exception | Diagnostics.LogItem, source?: any, innerException?: Exception, log?: boolean);
        /** Returns the current call trace, which may include arguments, for debugging purposes. */
        static getCallTrace(): string;
        /** Returns the current stack parsed into an array of lines.
         * Call 'getCallTrace()' to get more details, such as arguments past in, but without line and column numbers.
         */
        static parseStack(err?: Error): string[];
        /**
         * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
         */
        static error(title: string, message: string, source?: object): Exception;
        /**
         * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static notImplemented(functionNameOrTitle: string, source?: object, message?: string): Exception;
        /**
         * Logs an "Argument Required" error message with an optional title, and returns an associated 'Exception'
         * object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static argumentRequired(functionNameOrTitle: string, argumentName: string, source?: object, message?: string): Exception;
        /**
         * Logs an "Argument Cannot Be Null" error message with an optional title, and returns an associated 'Exception'
         * object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static argumentUndefinedOrNull(functionNameOrTitle: string, argumentName: string, source?: object, message?: string): Exception;
        /**
         * Logs an "Argument Cannot Be Null" error message with an optional title, and returns an associated 'Exception'
         * object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static invalidArgument(functionNameOrTitle: string, argumentName: string, source?: object, message?: string): Exception;
        /** Returns this exception and any inner exceptions formatted for display (simply calls DS.getErrorMessage(this, true)). */
        toString(): string;
        valueOf(): string;
    }
    interface IException extends Exception {
    }
}
declare namespace DS {
    /** Contains diagnostic based functions, such as those needed for logging purposes. */
    namespace Diagnostics {
        class LogItem {
            constructor(parent: ILogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean);
            /** The parent log item. */
            parent: ILogItem;
            /** The sequence count of this log item. */
            sequence: number;
            /** The title of this log item. */
            title: string;
            /** The message of this log item. */
            message: string;
            /** The time of this log item. */
            time: number;
            /** The type of this log item. */
            type: LogTypes;
            /** The source of the reason for this log item, if any. */
            source: {};
            subItems: ILogItem[];
            marginIndex: number;
            /** Write a message to the log without using a title and return the current log item instance. */
            write(message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Write a message to the log. */
            write(message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
            log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
            log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            /** Causes all future log writes to be nested under this log entry.
            * This is usually called at the start of a block of code, where following function calls may trigger nested log writes. Don't forget to call 'endCapture()' when done.
            * The current instance is returned to allow chaining function calls.
            * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
            */
            beginCapture(): ILogItem;
            /** Undoes the call to 'beginCapture()', activating any previous log item that called 'beginCapture()' before this instance.
            * See 'beginCapture()' for more details.
            * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
            */
            endCapture(): void;
            toString(): string;
        }
        interface ILogItem extends LogItem {
        }
        var __logItems: ILogItem[];
        /** Starts a new diagnostics-based log entry. */
        function log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
        /** Starts a new diagnostics-based log entry. */
        function log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
        function getLogAsHTML(): string;
        function getLogAsText(): string;
    }
}
declare namespace DS {
    interface ISavedPersistableObject {
    }
    /** Methods to deal with saving and loading plain non-system-tracked objects - typically by loading from and saved to JSON stores.
     * A version is also tracked with this type, which increments automatically on each save.
     * Note: This class is rarely inherited from directly.  Instead use 'TrackableObject', which enhances the persistence with a tracking ID.
     */
    abstract class PersistableObject {
        /** Triggers the process to save the object to a data store. */
        save(): Promise<this>;
        /** Triggers the process to load/sync the current project with a data store.
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incoming config file.
         */
        load(replace?: boolean): Promise<this>;
        protected onBeforeSave(): Promise<boolean | void>;
        protected onAfterSuccessfulSave(result: any): void;
        protected onSave(): Promise<any>;
        protected onBeforeLoad(): Promise<boolean | void>;
        protected onAfterSuccessfulLoad(result: any): void;
        /** Implementers can override this function to provide a different mechanism to retrieve the underlying content.
         * The default behavior simply returns 'undefined'.
         */
        protected onLoad(): Promise<any>;
        saveConfigToObject<T extends ISavedPersistableObject>(target?: T): any;
        /** Loads data from a given object.
         */
        loadConfigFromObject(source?: ISavedPersistableObject, replace?: boolean): this;
    }
    interface IPersistableObject extends PersistableObject {
    }
}
declare namespace DS {
    interface ISavedTrackableObject extends ISavedPersistableObject {
        $id: string;
        $objectType: string;
    }
    /** A common base type for all objects that can be tracked by a globally unique ID. */
    abstract class TrackableObject extends PersistableObject implements IResourceSource {
        /** Returns a tracked object, or undefined if not found. */
        static get<T = any>(id: string): T;
        [name: string]: any;
        /** A globally unique ID for this object. */
        get _id(): string;
        set _id(id: string);
        private $__id;
        /** The name of the class the instance was created from. */
        readonly _objectType: string;
        constructor();
        getResourceValue(): Promise<any>;
        getResourceType(): ResourceTypes;
        /** Saves the tracking details and related items to a specified object.
        * If no object is specified, then a new empty object is created and returned.
        */
        saveConfigToObject<T extends ISavedPersistableObject>(target?: T & ISavedTrackableObject): T & ISavedTrackableObject;
        /** Loads the tracking details from a given object. */
        loadConfigFromObject(source?: ISavedTrackableObject, replace?: boolean): this;
    }
    interface ITrackableObject extends TrackableObject {
    }
}
declare namespace DS {
    /** Represents an object that can have a parent object. */
    abstract class DependentObject extends TrackableObject {
        get parent(): DependentObject;
        protected __parent: DependentObject;
    }
    interface IDependencyObject extends DependentObject {
    }
}
declare namespace DS {
    /** Contains virtual DOM objects used when parsing HTML. */
    namespace VDOM {
        abstract class NodeIteratorBase<T> {
            readonly root: Node;
            protected _node: Node;
            abstract next(): {
                value?: T;
                done: boolean;
            };
            constructor(node: Node);
        }
        class NodeIterator extends NodeIteratorBase<Node> {
            readonly root: Node;
            protected _node: Node;
            next(): {
                value: Node;
                done: boolean;
            } | {
                done: boolean;
            };
            constructor(node: Node);
        }
        class NodeKeyIterator extends NodeIteratorBase<number> {
            private _index;
            next(): {
                value: number;
                done: boolean;
            } | {
                done: boolean;
            };
            constructor(node: Node);
        }
        class NodeKeyValueIterator extends NodeIteratorBase<[number, Node]> {
            private _index;
            next(): {
                value: [number, Node];
                done: boolean;
            } | {
                done: boolean;
            };
            constructor(node: Node);
        }
        class NodeList {
            private _owner;
            get length(): number;
            constructor(owner: Node, firstNode: Node);
            forEach(callback: (currentValue: Node, currentIndex: number, listObj: this) => void, thisArg?: {}): void;
            /** Returns a node at the given index, or null if the index is out of bounds. */
            item(index: number): Node;
            entries(): NodeKeyValueIterator;
            keys(): NodeKeyIterator;
            values(): NodeIterator;
            [Symbol.iterator](): NodeIterator;
        }
        enum NodeTypes {
            ELEMENT_NODE = 1,
            ATTRIBUTE_NODE = 2,
            TEXT_NODE = 3,
            CDATA_SECTION_NODE = 4,
            ENTITY_REFERENCE_NODE = 5,
            ENTITY_NODE = 6,
            PROCESSING_INSTRUCTION_NODE = 7,
            COMMENT_NODE = 8,
            DOCUMENT_NODE = 9,
            DOCUMENT_TYPE_NODE = 10,
            DOCUMENT_FRAGMENT_NODE = 11,
            NOTATION_NODE = 12
        }
        /** Represents a single parsed DOM node (this is the base type to all other element types, since server-side processing does not handle events). */
        class Node {
            [index: string]: any;
            /** A convenient function that simply allows using call-chaining to set properties without having to write multiple lines of code within a code block.
             * It also helps to prevent the need for constructors, since deep-cloning requires "default" constructors.
             */
            $__set<T extends keyof this>(name: T, value: this[T]): this;
            /** The node name.*/
            readonly nodeName: string;
            /** The node type.*/
            readonly nodeType: NodeTypes;
            readonly childNodes: NodeList;
            readonly firstChild: Node;
            readonly lastChild: Node;
            readonly nextSibling: Node;
            readonly previousSibling: Node;
            readonly parentElement: Node;
            outerText: any;
            textContent: any;
            get nodeValue(): string;
            set nodeValue(value: string);
            /** Constructs a new node for the Virtual DOM.
             */
            constructor(
            /** The node name.*/
            nodeName: string, 
            /** The node type.*/
            nodeType: NodeTypes);
            appendChild(child: Node): void;
            removeChild(child: Node): void;
            contains(node: Node): boolean;
            cloneNode(): string | number | boolean | IndexedObject<any>;
            getRootNode(): Node;
            hasChildNodes(): boolean;
            insertBefore(sibling: Node, child: Node): void;
            replaceChild(childToReplace: Node, childToAdd: Node): void;
        }
        /** Represents a single parsed element. */
        class Element extends Node {
            /** The element attributes.*/
            attributes: {
                [index: string]: string;
            };
            /** The element CSS classes.*/
            className?: string;
            /** The element namespace prefix.*/
            prefix?: string;
            /** Gets or sets the child objects based on a string.  When setting a string, the current children are replaced by the parsed result.
             * Please be mindful that this is done on every read, so if the node hierarchy is large this could slow things down.
             */
            get innerHTML(): string;
            set innerHTML(value: string);
            get outerHTML(): string;
            toString(): string;
            constructor(
            /** The node name.*/
            nodeName: string, 
            /** The node type.*/
            nodeType: NodeTypes, 
            /** The element attributes.*/
            attributes?: {
                [index: string]: string;
            }, 
            /** The element CSS classes.*/
            className?: string, 
            /** The element namespace prefix.*/
            prefix?: string);
        }
        /** Represents a single parsed HTML element. */
        class HTMLElement extends Element {
            /** The element CSS classes.*/
            className?: string;
            /** The element namespace prefix.*/
            prefix?: string;
            /** Each new instance will initially set its '__htmlTag' property to this value. */
            static defaultHTMLTagName: string;
            constructor(
            /** The node name.*/
            nodeName?: string, 
            /** The node type.*/
            nodeType?: NodeTypes, 
            /** The element attributes.*/
            attributes?: {
                [index: string]: string;
            }, 
            /** The element CSS classes.*/
            className?: string, 
            /** The element namespace prefix.*/
            prefix?: string);
        }
        abstract class CharacterData extends Node {
            data?: string;
            get length(): number;
            constructor(
            /** The node name.*/
            nodeName: string, 
            /** The node type.*/
            nodeType: NodeTypes, data?: string);
        }
        class Text extends CharacterData {
            constructor(text: string);
        }
        class Body extends HTMLElement {
            constructor();
        }
        class Head extends HTMLElement {
            constructor();
        }
        class Form extends HTMLElement {
            constructor();
        }
        class Image extends HTMLElement {
            constructor();
        }
        class Document extends HTMLElement {
            body: Body;
            head: Head;
            forms: Form;
            images: Form;
            constructor();
        }
    }
}
declare namespace DS {
    namespace VDOM {
        /** Holds special types used with parsing HTML templates. */
        namespace Templating {
            /** A list of text mark-up flags for use with phrase based elements. */
            enum PhraseTypes {
                /** Indicates emphasis. */
                Emphasis = 1,
                /** Indicates stronger emphasis. */
                Strong = 2,
                /** Contains a citation or a reference to other sources. */
                Cite = 4,
                /** Indicates that this is the defining instance of the enclosed term. */
                Defining = 8,
                /** Designates a fragment of computer code. */
                Code = 16,
                /** Designates sample output from programs, scripts, etc. */
                Sample = 32,
                /** Indicates text to be entered by the user. */
                Keyboard = 64,
                /** Indicates an instance of a variable or program argument. */
                Variable = 128,
                /** Indicates an abbreviated form (Example: WWW, HTTP, URI, AI, e.g., ex., etc., ...). */
                Abbreviation = 256,
                /** Indicates an acronym (Example: WAC, radar, NASA, laser, sonar, ...). */
                Acronym = 512
            }
            abstract class TemplateElement extends HTMLElement {
                /** The element CSS classes.*/
                className?: string;
                /** The element namespace prefix.*/
                prefix?: string;
                constructor(
                /** The node name.*/
                nodeName?: string, 
                /** The node type.*/
                nodeType?: NodeTypes, 
                /** The element attributes.*/
                attributes?: {
                    [index: string]: string;
                }, 
                /** The element CSS classes.*/
                className?: string, 
                /** The element namespace prefix.*/
                prefix?: string);
                /** Validates that the settings for the template object are correct. If not correct, an exception is thrown.
                 * When validating tag names use either 'assertSupportedElementTypes()' or 'assertUnsupportedElementTypes()'.
                 * The correct process is to validate tags names, including any other necessary properties, by overriding and
                 * calling 'validate()' prior to rendering output when overriding 'get outerHTML()'.
                 */
                abstract validate(): void;
                get outerHTML(): string;
                /** If this is true, then 'assertSupportedNodeTypes()' and 'assertUnsupportedNodeTypes()' always succeeds. */
                __disableNodeTypeValidation: boolean;
                /** Call this to validate supported element types. */
                assertSupportedNodeTypes(...args: string[]): boolean;
                /** Call this to validate unsupported element types. */
                assertUnsupportedNodeTypes(...args: string[]): void;
            }
            class Phrase extends TemplateElement {
                phraseType: PhraseTypes;
                constructor(nodeName?: string);
                validate(): void;
                get outerHTML(): string;
            }
            class HTMLText extends TemplateElement {
                constructor();
                validate(): void;
                onRedraw(recursive?: boolean): void;
            }
            class Header extends TemplateElement {
                headerLevel: number;
                constructor(/**A value from 1-6.*/ headerLevel?: number);
                validate(): void;
                get outerHTML(): string;
                onRedraw(recursive?: boolean): void;
            }
        }
    }
}
declare namespace DS {
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    namespace Browser {
        /** A list of browsers that can be currently detected. */
        enum BrowserTypes {
            /** Browser is not yet detected, or detection failed. */
            Unknown = 0,
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            None = -1,
            IE = 1,
            Chrome = 2,
            FireFox = 3,
            Safari = 4,
            Opera = 5,
            Netscape = 6,
            OmniWeb = 7,
            iCab = 8,
            Konqueror = 9,
            Camino = 10
        }
        /** A list of operating systems that can be currently detected. */
        enum OperatingSystems {
            /** OS is not yet detected, or detection failed. */
            Unknown = 0,
            Windows = 1,
            Mac = 2,
            Linux = 3,
            iOS = 4
        }
        /** Holds detection parameters for a single browser agent string version.
        * Note: This is agent string related, as the version number itself is pulled dynamically based on 'versionPrefix'.
        */
        interface BrowserAgentVersionInfo {
            /** The parent 'BrowserInfo' details that owns this object. */
            parent?: BrowserInfo;
            /** The text to search for to select this version entry. If null, use the browser name string. */
            nameTag: string;
            /** The text to search for that immediately precedes the browser version.
            * If null, use the browser name string, appended with '/'. */
            versionPrefix: string;
            /** Used only to override a browser vendor name if a different vendor owned a browser in the past. */
            vendor?: string;
        }
        /** Holds detection parameters for a single browser type, and supported versions. */
        interface BrowserInfo {
            /** The name of the browser. */
            name: string;
            /** The browser's vendor. */
            vendor: string;
            /** The browser's enum value (see 'Browser.BrowserTypes'). */
            identity: BrowserTypes;
            /** The browser's AGENT STRING versions (see 'Browser.BrowserVersionInfo').
            * Note: This is the most important part, as browser is detected based on it's version details.
            */
            versions: BrowserAgentVersionInfo[];
        }
        /** Holds detection parameters for the host operating system. */
        interface OSInfo {
            name: string;
            identity: OperatingSystems;
        }
        /** Holds a reference to the agent data detected regarding browser name and versions. */
        var browserVersionInfo: BrowserAgentVersionInfo;
        /** Holds a reference to the agent data detected regarding the host operating system. */
        var osInfo: OSInfo;
        /** The name of the detected browser. */
        var name: string;
        /** The browser's vendor. */
        var vendor: string;
        /** The operating system detected. */
        var os: OperatingSystems;
        /** The browser version detected. */
        var version: number;
        /** Set to true if ES2015 (aka ES6) is supported ('class', 'new.target', etc.). */
        const ES6: boolean;
        /** The type of browser detected. */
        var type: BrowserTypes;
    }
}
declare namespace DS {
    interface IConfigBaseObject extends ISavedTrackableObject {
    }
    /** A config-based object is one that does not contain any file contents.
     *  The whole object is represented by a JSON config file (*.json).
     *  Normally the implementer tracks where the JSON should be loaded from or saved to, and this base object then tracks
     *  the state of that object, including caching it to detect property changes.
     */
    class ConfigBaseObject extends TrackableObject {
        /** Determines if a property has changed by comparing the last config object for this object instance with the new one supplied.
          * If no config object exists, then all properties are considered in a 'changed' (unsaved) state, because they are new.
          */
        propertyChanged<T extends ISavedPersistableObject>(name: keyof T): boolean;
        readonly _lastConfig: ISavedPersistableObject & IndexedObject;
        readonly _currentConfig: ISavedPersistableObject & IndexedObject;
        /** The virtual file storage directory where this config object will be persisted. */
        directory: VirtualFileSystem.Abstracts.Directory;
        /** A virtual file that represents the saved object data, if saved or loaded, otherwise this is undefined.
          */
        _file: VirtualFileSystem.Abstracts.File;
        configFilename: string;
        protected onLoad(): Promise<string>;
        protected onSave(): Promise<string>;
        /** Save the configuration information to an object - typically prior to serialization. */
        saveConfigToObject<T extends ISavedPersistableObject>(target?: T & IConfigBaseObject): T & ISavedTrackableObject;
        /** Loads data from a given object.
         */
        loadConfigFromObject(source?: IConfigBaseObject, replace?: boolean): this;
        protected onAfterSuccessfulSave(result: string): void;
        protected onAfterSuccessfulLoad(result: string): void;
    }
}
declare namespace DS {
    /** Provides types and utilities for working with formatted data from various sources. */
    namespace Data {
        /** Provides basic functions for working with JSON data. */
        namespace JSON {
            /** Uses a regex by Douglas Crockford to break down the JSON into valid parts. */
            function isJSON(jsonText: string): boolean;
            /** Converts a JSON string into an object with nested objects as required.
             * The given JSON string is validated first before it is parsed for security reasons. Invalid JSON will throw an exception.
            */
            function toObject(jsonText: string): Object;
            /** A more powerful version of the built-in JSON.stringify() function that uses the same function to respect the
            * built-in rules while also limiting depth and supporting cyclical references.
            */
            function stringify(val: any, depth: number, replacer: (this: any, key: string, value: any) => any, space?: string | number, onGetObjID?: (val: IndexedObject) => string): string;
            /** Attempts to parse a string as JSON and returns the result.  If the value is not a string, or the conversion
             * fails, the value is returned as is. This is used mainly in message queue processing, so JSON can convert to
             * an object by default for the handlers, otherwise the value is sent as is.
            */
            function toObjectOrValue<T extends object | any>(value: T): T;
        }
        /** Represents a value conversion object. */
        interface IValueConverter {
            convert(value: any, type: string, parameter: any): any;
            convertBack(value: any, type: string, parameter: any): any;
        }
        class PropertyPathEndpoint {
            /** The object that is the target of this property path (which is the SOURCE of a binding). */
            object: IndexedObject;
            /** The property name on the end object for this property path. */
            propertyName: string;
            /** An index (number/string, if any) for the end property of this path.  Leave this undefined to ignore.
            * Note: This is ignored if the resulting value is a function, and arguments are defined (even if the array is empty).
            */
            propertyIndex: any;
            /** If the end property is a function reference, this holds the comma separated argument values.
            * Note: Leave this undefined to simply reference a function property.  If defined, the function
            * property will be called (even if the array is empty), and the return value will be used instead.
            */
            arguments: any[];
            constructor(object?: IndexedObject, propertyName?: string, propertyIndex?: any, parameters?: any[]);
            /** Returns the value referenced by the associated endpoint information. */
            getValue(): any;
        }
        /** Holds details about the value source or target of a binding. */
        class PropertyPath {
            private static __PathPartRegEx;
            origin: {};
            namePath: Array<string>;
            arguments: Array<any[]>;
            indexes: Array<any>;
            constructor(origin: {}, path: string);
            /** Parses the specified path string and updates this PropertyPath instance with the details. */
            parsePath(path: string): PropertyPath;
            /** Reconstructs the property path string using the internal path array details. */
            private __getPathString;
            /** Traverses the property path information and returns the final endpoint details.
            * @param {object} origin The root object to begin the traversal on.  If an object was supplied to the constructor,
            * then this parameter is optional; though, it can be used to override that object (for the call only).
            * @param {PropertyPathEndpoint} existingEndpoint An optional existing endpoint instance if available, otherwise leave this undefined.
            */
            getEndpoint(origin?: {}, existingEndpoint?: PropertyPathEndpoint): PropertyPathEndpoint;
        }
        /** The type of binding between object properties (used by System.IO.Data.Binding). */
        enum BindingMode {
            /** Updates either the target or source property to the other when either of them change. */
            TwoWay = 0,
            /** Updates only the target property when the source changes. */
            OneWay = 1,
            /** Inverts OneWay mode so that the source updates when the target changes. */
            OneWayToSource = 2,
            /** Updates only the target property once when bound.  Subsequent source changes are ignored. */
            OneTime = 3
        }
        /** Represents a binding between object properties. */
        class Binding {
            /** The root object for the property path. */
            source: {};
            /** The 'PropertyPath' object which describes the property path to the bound property. */
            propertyPath: PropertyPath;
            /** The endpoint reference for the source value of this binding. */
            sourceEndpoint: PropertyPathEndpoint;
            mode: BindingMode;
            defaultValue: any;
            converter: IValueConverter;
            targetType: string;
            converterParameter: string;
            /** Creates a new Binding object to update an object property when another changes.
            * @param {object} source The source object that is the root to which the property path is applied for the binding.
            * @param {string} path The property path to the bound property.
            * @param {string} targetType The expected type of the target .
            * @param {BindingMode} mode The direction of data updates.
            * @param {any} defaultValue A default value to use when binding is unable to return a value, or the value is 'undefined'.
            * Note: If 'defaultValue' is undefined when a property path fails, an error will occur.
            * @param {IValueConverter} converter The converter used to convert values for this binding..
            */
            constructor(source: {}, path: string, targetType: string, mode?: BindingMode, defaultValue?: any, converter?: IValueConverter, converterParameter?: string);
            /** Updates the source endpoint using the current property path settings. */
            updateEndpoint(): void;
            /** Returns the value referenced by the source endpoint object, and applies any associated converter. */
            getValue(type?: string, parameter?: string): any;
        }
    }
}
declare namespace DS {
    interface DelegateFunction<TObj extends object = object> {
        (...args: any[]): any;
    }
    /**
     * Represents a function of a specific object instance.
     * Functions have no reference to any object instance when invoked statically.  This means when used as "handlers" (callbacks)
     * the value of the 'this' reference is either the global scope, or undefined (in strict mode).   Delegates couple the target
     * object instance (context of the function call [using 'this']) with a function reference.  This allows calling a function
     * on a specific object instance by simply invoking it via the delegate. If not used with closures, a delegate may also be
     * serialized.
     * Note: If the target object is undefined, then 'null' is assumed and passed in as 'this'.
     */
    class Delegate<TObj extends object, TFunc extends DelegateFunction> {
        /**
        * Reinitializes a disposed Delegate instance.
        * @param o The Delegate instance to initialize, or re-initialize.
        * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
        * @param object The instance to bind to the resulting delegate object.
        * @param func The function that will be called for the resulting delegate object.
        */
        constructor(object: TObj, func: TFunc);
        /**
         * Implements a more efficient '{function}.apply()' function when a small number of parameters are supplied.
         * This works better because a direct function call 'o.func(args[0], args[1], etc...)' is many times faster than 'o.func.apply(o, args)'.
         */
        static fastApply?(func: Function, context: {}, args: {
            [index: number]: any;
            length: number;
        }): any;
        /**
         * Implements a more efficient '{function}.call()' function when a small number of parameters are supplied.
         * This works better because a direct function call 'o.func(args[0], args[1], etc...)' is many times faster than 'o.func.apply(o, args)'.
         */
        static fastCall?(func: Function, context: {}, ...args: any[]): any;
        /** Creates and returns a string that uniquely identifies the combination of the object instance and function for
         * this delegate.  Since every delegate has a unique object ID across an application domain, key strings can help
         * prevent storage of duplicate delegates all pointing to the same target.
         * Note: The underlying object and function must be registered types first.
         * See 'AppDomain.registerClass()/.registerType()' for more information.
         */
        static getKey<TFunc extends DelegateFunction>(object: TrackableObject, func: TFunc): string;
        protected static __validate(callername: string, object: Object, func: DelegateFunction): boolean;
        /** A read-only key string that uniquely identifies the combination of object instance and function in this delegate.
        * This property is set for new instances by default.  Calling 'update()' will update it if necessary.
        */
        get key(): string;
        private __key;
        /** The function to be called on the associated object. */
        func: IFunctionInfo;
        private __boundFunc;
        private __functionText;
        /** The instance on which the associated function will be called.  This should be undefined/null for static functions. */
        object: TObj;
        /** If the 'object' or 'func' properties are modified directly, call this function to update the internal bindings. */
        update(): this;
        /** Invokes the delegate directly. Pass undefined/void 0 for the first parameter, or a custom object context. */
        invoke: TFunc;
        /** Invoke the delegate with a fixed number of arguments (do not pass the object context ['this'] as the first parameter - use "invoke()" instead).
        * Note: This does not simply invoke "call()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
        */
        call: (...args: any[]) => any;
        /** Invoke the delegate using an array of arguments.
        * Note: This does not simply invoke "apply()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
        */
        apply: {
            /** Invoke the delegate using an array of arguments.
            * Note: This does not simply invoke "apply()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
            */
            (args: any[]): any;
            /** Invoke the delegate using a specific object context and array of arguments.
            * Note: This does not simply invoke "apply()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
            */
            (context: {}, args: any[]): any;
        };
        private __apply;
        equal(value: any): boolean;
    }
    interface IDelegate<TObj extends object = object, TFunc extends DelegateFunction = DelegateFunction> extends Delegate<TObj, TFunc> {
    }
}
/**
 * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
 * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
 * named index based lookups, so no string concatenation is used, which makes the process many times faster.
 * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
 * property names.  To be safe, make sure to always use the 'DreamSpace.Globals.register()' function.  It can create isolated
 * global variables, and if necessary, also create a safer unique host global scope name.
 */
declare namespace DS {
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
}
declare namespace DS {
    enum HTMLReaderModes {
        /** There's no more to read (end of HTML). */
        End = -1,
        /** Reading hasn't yet started. */
        NotStarted = 0,
        /** A tag was just read. The 'runningText' property holds the text prior to the tag, and the tag name is in 'tagName'. */
        Tag = 1,
        /** An attribute was just read from the last tag. The name will be placed in 'attributeName' and the value (if value) in 'attributeValue'.*/
        Attribute = 2,
        /** An ending tag bracket was just read (no more attributes). */
        EndOfTag = 3,
        /** A template token in the form '{{...}}' was just read. */
        TemplateToken = 4
    }
    /** Used to parse HTML text.
      * Performance note: Since HTML can be large, it's not efficient to scan the HTML character by character. Instead, the HTML
      * reader uses the native RegEx engine to split up the HTML into chunks of delimiter text, which makes reading it much faster.
      */
    class HTMLReader {
        constructor(html: string);
        private static __splitRegEx;
        partIndex: number;
        /** The start index of the running text. */
        textStartIndex: number;
        /** The end index of the running text. This is also the start index of the next tag, if any (since text runs between tags). */
        textEndIndex: number;
        __lastTextEndIndex: number;
        /** A list of text parts that correspond to each delimiter (i.e. TDTDT [T=Text, D=Delimiter]). */
        nonDelimiters: string[];
        /** A list of the delimiters that correspond to each of the text parts (i.e. TDTDT [T=Text, D=Delimiter]). */
        delimiters: string[];
        /** The text that was read. */
        text: string;
        /** The delimiter that was read. */
        delimiter: string;
        /** The text that runs between indexes 'textStartIndex' and 'textEndIndex-1' (inclusive). */
        runningText: string;
        /** The bracket sequence before the tag name, such as '<' or '</'. */
        tagBracket: string;
        /** The tag name, if a tag was read. */
        tagName: string;
        /** The attribute name, if attribute was read. */
        attributeName: string;
        /** The attribute value, if attribute was read. */
        attributeValue: string;
        readMode: HTMLReaderModes;
        /** If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
        * This can greatly help identify possible areas of page errors.
        */
        strictMode: boolean;
        /** Returns true if tag current tag block is a mark-up declaration in the form "<!...>", where '...' is any text EXCEPT the start of a comment ('--'). */
        isMarkupDeclaration(): boolean;
        /** Returns true if tag current tag block is a mark-up declaration representing a comment block in the form "<!--...-->", where '...' is any text. */
        isCommentBlock(): boolean;
        /** Return true if the current tag block represents a script. */
        isScriptBlock(): boolean;
        /** Return true if the current tag block represents a style. */
        isStyleBlock(): boolean;
        /** Returns true if the current position is a tag closure (i.e. '</', or '/>' [self-closing allowed for non-nestable tags]). */
        isClosingTag(): boolean;
        /** Returns true if the current delimiter represents a template token in the form '{{....}}'. */
        isTempalteToken(): boolean;
        private html;
        getHTML(): string;
        private __readNext;
        private __goBack;
        private __reQueueDelimiter;
        /** If the current delimiter is whitespace, then this advances the reading (note: all whitespace will be grouped into one delimiter).
            * True is returned if whitespace (or an empty string) was found and skipped, otherwise false is returned, and no action was taken.
            * @param {boolean} onlyIfTextIsEmpty If true, advances past the whitespace delimiter ONLY if the preceding text read was also empty.  This can happen
            * if whitespace immediately follows another delimiter (such as space after a tag name).
            */
        private __skipWhiteSpace;
        throwError(msg: string): void;
        /** Reads the next tag or attribute in the underlying html. */
        readNext(): void;
        getCurrentRunningText(): string;
        getCurrentLineNumber(): number;
    }
    interface IHTMLReader extends HTMLReader {
    }
}
declare namespace DS {
    /** Contains functions for working with URI based paths. */
    namespace Path {
        /** Parses the URL into 1: protocol (without '://'), 2: username, 3: password, 4: host, 5: port, 6: path, 7: query (without '?'), and 8: fragment (without '#'). */
        var URL_PARSER_REGEX: RegExp;
        /** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
        function parse(url: string): Uri;
        var restrictedFilenameRegex: RegExp;
        /** Returns true if a given filename contains invalid characters. */
        function isValidFileName(name: string): boolean;
        /** Splits and returns the path parts, validating each one and throwing an exception if any are invalid. */
        function getPathParts(path: string): string[];
        /** Returns the directory path minus the filename (up to the last name that is followed by a directory separator).
         * Since the file API does not support special character such as '.' or '..', these are ignored as directory characters (but not removed).
         * Examples:
         * - "/A/B/C/" => "/A/B/C"
         * - "A/B/C" => "A/B"
         * - "//A/B/C//" => "/A/B/C"
         * - "/" => "/"
         * - "" => ""
         */
        function getPath(filepath: string): string;
        /** Returns the filename minus the directory path.
        * Since the file API does not support special character such as '.' or '..', these are ignored as directory characters (but not removed).
        * Examples:
        * - "/A/B/C/" => ""
        * - "A/B/C" => "C"
        * - "/" => ""
        * - "" => ""
        */
        function getName(filepath: string): string;
        /**
        * Appends 'path2' to 'path1', inserting a path separator character (/) if required.
        * Set 'normalizePathSeparators' to true to normalize any '\' path characters to '/' instead.
        */
        function combine(path1: string, path2: string, normalizePathSeparators?: boolean): string;
        /** Returns the protocol + host + port parts of the given absolute URL. */
        function getRoot(absoluteURL: string | Uri): string;
        /**
           * Combines a path with either the base site path or a current alternative path. The following logic is followed for combining 'path':
           * 1. If it starts with '~/' or '~' is will be relative to 'baseURL'.
           * 2. If it starts with '/' it is relative to the server root 'protocol://server:port' (using current or base path, but with the path part ignored).
           * 3. If it starts without a path separator, or is empty, then it is combined as relative to 'currentResourceURL'.
           * Note: if 'currentResourceURL' is empty, then 'baseURL' is assumed.
           * @param {string} currentResourceURL An optional path that specifies a resource location to take into consideration when resolving relative paths.
           * If not specified, this is 'location.href' by default.
           * @param {string} baseURL An optional path that specifies the site's root URL.  By default this is 'DreamSpace.baseURL'.
           */
        function resolve(path: string, currentResourceURL?: any, baseURL?: string): any;
        /** Fixes a URL by splitting it apart, trimming it, then recombining it along with a trailing forward slash (/) at the end. */
        function fix(url: string): string;
        /** Returns true if the specified extension is missing from the end of 'pathToFile'.
          * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
          * indirectly via a server side script, or handled in some other special way).
          * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
          */
        function hasFileExt(pathToFile: string, ext: string): boolean;
        /** Subtracts the current site's base URL from the given URL and returns 'serverWebRoot' with the remained appended. */
        function map(url: string): string;
        /** Returns true if the given path is an absolute path. If false, the path is relative.
         * When a path is absolute it should not have any other path prefixed before it.
         */
        function isAbsolute(path: string): boolean;
    }
}
declare namespace DS {
    var QUERY_STRING_REGEX: RegExp;
    /**
      * Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
      * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
      * with all values escaped and ready to be appended to a URI.
      * Note: Call 'Query.new()' to create new instances.
      */
    class Query {
        /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
        * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
        * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
        */
        constructor(query?: string | object, makeNamesLowercase?: boolean);
        values: {
            [index: string]: string;
        };
        /**
            * Use to add additional query string values. The function returns the current object to allow chaining calls.
            * Example: add({'name1':'value1', 'name2':'value2', ...});
            * Note: Use this to also change existing values.
            * @param {boolean} newValues An object whose properties will be added to the current query.
            * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
            */
        addOrUpdate(newValues: object | {
            [index: string]: string;
        }, makeNamesLowercase?: boolean): this;
        /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
            * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
            * Warning: If the new name already exists, it will be replaced.
            */
        rename(newNames: {
            [index: string]: string;
        }): this;
        /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
            * Example: remove(['name1', 'name2', 'name3']);
            */
        remove(namesToDelete: string[]): this;
        /** Creates and returns a duplicate of this object. */
        clone(): IQuery;
        appendTo(uri: string): string;
        /** Returns the specified value, or a default value if nothing was found. */
        getValue(name: string, defaultValueIfUndefined?: string): any;
        /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
        getLCValue(name: string, defaultValueIfUndefined?: string): string;
        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
        getUCValue(name: string, defaultValueIfUndefined?: string): string;
        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
        getNumber(name: string, defaultValueIfUndefined?: number): number;
        /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
            * The existing value is replaced by the encoded value, and the encoded value is returned.
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
        encodeValue(name: string): string;
        /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
            * The existing value is replaced by the decoded value, and the decoded value is returned.
            */
        decodeValue(name: string): string;
        /** Encode ALL query values (see 'encodeValue()').
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
        encodeAll(): void;
        /** Decode ALL query values (see 'encodeValue()').
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
        decodeAll(): void;
        /**
           * Converts the underlying query values to a proper search string that can be appended to a URI.
           * @param {boolean} addQuerySeparator If true (the default) prefixes '?' before the returned query string.
           */
        toString(addQuerySeparator?: boolean): string;
    }
    interface IQuery extends Query {
    }
    /** This is set automatically to the query for the current page. */
    var pageQuery: Query;
}
declare namespace DS {
    enum CacheMode {
        /** Bypass the cache and load as normal.  Successful responses are NOT cached. */
        Bypass = -1,
        /** Load from the local storage if possible, otherwise load as normal.  Successful responses are cached. */
        Store = 0,
        /** Ignore the local storage and load as normal.  Successful responses are cached, overwriting the existing data. */
        Reload = 1
    }
    /**
      * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
      * implementation designed to work better with the DreamSpace system specifically, and to support parallel loading).
      * Note: It is advised to use 'DreamSpace.Loader.loadResource()' to load resources instead of directly creating resource request objects.
      * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
      * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
      * The method used to read a resource depends on client vs server sides, which is detected internally.
      */
    class ResourceRequest {
        /**
         * If true (the default) then a 'ResourceRequest.cacheBustingVar+"="+Date.now()' query item is added to make sure the browser never uses
         * the cache. To change the variable used, set the 'cacheBustingVar' property also.
         * Each resource request instance can also have its own value set separate from the global one.
         * Note: DreamSpace has its own caching that uses the local storage, where supported.
         */
        static cacheBusting: boolean;
        /** See the 'cacheBusting' property. */
        static get cacheBustingVar(): string;
        static set cacheBustingVar(value: string);
        private static _cacheBustingVar;
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        constructor(url: string, type: ResourceTypes | string, method?: string, body?: any, delay?: number, async?: boolean);
        private $__index;
        /** The requested resource URL. If the URL string starts with '~/' then it becomes relative to the content type base path. */
        get url(): string;
        set url(value: string);
        /** The raw unresolved URL given for this resource. Use the 'url' property to resolve content roots when '~' is used. */
        _url: string;
        /**
           * The HTTP request method to use, such as "GET" (the default), "POST", "PUT", "DELETE", etc.  Ignored for non-HTTP(S) URLs.
           */
        method: string;
        /** Optional data to send with the request, such as for POST operations. */
        body: any;
        /** A delay, in ms, before sending the request. Defaults to 0 (none).
         * The main purpose of this is to prevent synchronous execution. When 0, the request executes immediately when 'start()'
         * is called. Setting this to anything greater than 0 will allow future configurations during the current thread execution.
         */
        delay: number;
        /** An optional username to pass to the XHR instance when opening the connecting. */
        username: string;
        /** An optional password to pass to the XHR instance when opening the connecting. */
        password: string;
        /** The requested resource type (to match against the server returned MIME type for data type verification). */
        type: ResourceTypes | string;
        /**
           * The XMLHttpRequest (client) or require('xhr2') (server) instance used for this request.  It's marked private to discourage access, but experienced
           * developers should be able to use it if necessary to further configure the request for advanced reasons.
           * When using this just type cast to the expected object type based on the platform (client=instanceof XMLHttpRequest, server=instanceof require('xhr2') [XMLHttpRequest for NodeJS])
           */
        _xhr: IndexedObject;
        /**
           * The raw data returned from the HTTP request.
           * Note: This does not change with new data returned from callback handlers (new data is passed on as the first argument to
           * the next call [see 'transformedData']).
           */
        response: any;
        /** This gets the transformed response as a result of callback handlers (if any).
          * If no transformations were made, then the value in 'response' is returned as is.
          */
        get transformedResponse(): any;
        private $__transformedData;
        /** The response code from the XHR response. */
        responseCode: number;
        /** The response code message from the XHR response. */
        responseCodeMessage: string;
        /** The current request status. */
        status: RequestStatuses;
        /**
         * A progress/error message related to the status (may not be the same as the response message).
         * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
         */
        get message(): string;
        set message(value: string);
        private _message;
        /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
        messageLog: string[];
        /**
         * If true (default), them this request is non-blocking, otherwise the calling script will be blocked until the request
         * completes loading.  Please note that no progress callbacks can occur during blocked operations (since the thread is
         * effectively 'paused' in this scenario).
         * Note: Deprecated: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#Synchronous_request
         * "Starting with Gecko 30.0 (Firefox 30.0 / Thunderbird 30.0 / SeaMonkey 2.27), Blink 39.0, and Edge 13, synchronous requests on the main thread have been deprecated due to the negative effects to the user experience."
         */
        async: boolean;
        /**
         * If true (the default) then a '"_="+Date.now()' query item is added to make sure the browser never uses
         * the cache. To change the variable used, set the 'cacheBustingVar' property also.
         * Note: DreamSpace has its own caching that uses the local storage, where supported.
         */
        cacheBusting: boolean;
        /** See the 'cacheBusting' property. */
        cacheBustingVar: string;
        private _onProgress;
        private _onReady;
        /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
        * There's also an 'on finally' which should execute on success OR failure, regardless.
        * For each entry, only ONE of any callback type will be set.
        */
        private _promiseChain;
        private _promiseChainIndex;
        /**
         * A list of parent requests that this request is depending upon.
         * When 'start()' is called, all parents are triggered to load first, working downwards.
         * Regardless of order, loading is in parallel asynchronously; however, the 'onReady' event will fire in the expected order.
         * */
        _parentRequests: IResourceRequest[];
        private _parentCompletedCount;
        _dependants: IResourceRequest[];
        private _paused;
        private _queueDoNext;
        private _queueDoError;
        private _requeueHandlersIfNeeded;
        /** Triggers a success or error callback after the resource loads, or fails to load. */
        then(success: IResultCallback<IResourceRequest>, error?: IErrorCallback<IResourceRequest>): this;
        /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
          * the dependant request fires its 'onReady' event.
          * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
          */
        include<T extends IResourceRequest>(request: T): T;
        /** Returns a promise that hooks into this request. This is provided to support the async/await semantics.
         * When the 'ready()' or 'catch' events fire, the promise is given the resource request instance in both cases.
         * On success the value should be in either the 'transformedResponse' or 'response' properties of the request instance. */
        asPromise(): Promise<IResourceRequest>;
        /**
         * Add a call-back handler for when the request completes successfully.
         * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
         * @param handler
         */
        ready(handler: ICallback<IResourceRequest>): this;
        /** Adds a hook into the resource load progress event. */
        while(progressHandler: ICallback<IResourceRequest>): this;
        /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
        abort(): void;
        /**
         * Provide a handler to catch any errors from this request.
         */
        catch(errorHandler: IErrorCallback<IResourceRequest>): this;
        /**
         * Provide a handler which should execute on success OR failure, regardless.
         */
        finally(cleanupHandler: ICallback<IResourceRequest>): this;
        /**
           * Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
           * order).  Regardless of the start order, all scripts are loaded in parallel.
           * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
           * @param {string} method An optional method to override the default request method set in the 'method' property on this request instance.
           * @param {string} body Optional payload data to send, which overrides any value set in the 'payload' property on this request instance.
           * @param {string} username Optional username value, instead of storing the username in the instance.
           * @param {string} password Optional password value, instead of storing the password in the instance.
           */
        start(method?: string, body?: string, username?: string, password?: string): this;
        private _Start;
        /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
        pause(): this;
        /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
          * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
          */
        continue(): this;
        private _doOnProgress;
        setError(message: string, error?: {
            name?: string;
            reason?: string;
            message?: string;
            type?: any;
            stack?: string;
        }): void;
        private _doNext;
        private _doReady;
        private _doError;
        /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
          * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
          * @param {boolean} includeDependentResources Reload all resource dependencies as well.
          */
        reload(includeDependentResources?: boolean): this;
        static _resourceRequests: IResourceRequest[];
        static _resourceRequestByURL: {
            [url: string]: IResourceRequest;
        };
    }
    interface IResourceRequest extends ResourceRequest {
    }
}
declare namespace DS {
    /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
    enum ResourceTypes {
        Application_Script = "application/javascript",
        Application_ECMAScript = "application/ecmascript",
        Application_JSON = "application/json",
        Application_ZIP = "application/zip",
        Application_GZIP = "application/gzip",
        Application_PDF = "application/pdf",
        Application_DefaultFormPost = "application/x-www-form-urlencoded",
        Application_TTF = "application/x-font-ttf",
        Multipart_BinaryFormPost = "multipart/form-data",
        AUDIO_MP4 = "audio/mp4",
        AUDIO_MPEG = "audio/mpeg",
        AUDIO_OGG = "audio/ogg",
        AUDIO_AAC = "audio/x-aac",
        AUDIO_CAF = "audio/x-caf",
        Image_GIF = "image/gif",
        Image_JPEG = "image/jpeg",
        Image_PNG = "image/png",
        Image_SVG = "image/svg+xml",
        Image_GIMP = "image/x-xcf",
        Text_CSS = "text/css",
        Text_CSV = "text/csv",
        Text_HTML = "text/html",
        Text_Plain = "text/plain",
        Text_RTF = "text/rtf",
        Text_XML = "text/xml",
        Text_JQueryTemplate = "text/x-jquery-tmpl",
        Text_MarkDown = "text/x-markdown",
        Video_AVI = "video/avi",
        Video_MPEG = "video/mpeg",
        Video_MP4 = "video/mp4",
        Video_OGG = "video/ogg",
        Video_MOV = "video/quicktime",
        Video_WMV = "video/x-ms-wmv",
        Video_FLV = "video/x-flv"
    }
    /** A map of popular resource extensions to resource enum type names.
      * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
      * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
      * Example 3: DreamSpace.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
      * Example 4: DreamSpace.Loader.getResourceTypeFromExtension(".js");
      */
    enum ResourceExtensions {
        Application_Script = ".js",
        Application_ECMAScript = ".es",
        Application_JSON = ".json",
        Application_ZIP = ".zip",
        Application_GZIP = ".gz",
        Application_PDF = ".pdf",
        Application_TTF = ".ttf",
        AUDIO_MP4 = ".mp4",
        AUDIO_MPEG = ".mpeg",
        AUDIO_OGG = ".ogg",
        AUDIO_AAC = ".aac",
        AUDIO_CAF = ".caf",
        Image_GIF = ".gif",
        Image_JPEG = ".jpeg",
        Image_PNG = ".png",
        Image_SVG = ".svg",
        Image_GIMP = ".xcf",
        Text_CSS = ".css",
        Text_CSV = ".csv",
        Text_HTML = ".html",
        Text_Plain = ".txt",
        Text_RTF = ".rtf",
        Text_XML = ".xml",
        Text_JQueryTemplate = ".tpl.htm",
        Text_MarkDown = ".markdown",
        Video_AVI = ".avi",
        Video_MPEG = ".mpeg",
        Video_MP4 = ".mp4",
        Video_OGG = ".ogg",
        Video_MOV = ".qt",
        Video_WMV = ".wmv",
        Video_FLV = ".flv"
    }
    /** Return the resource (MIME) type of a given extension (with or without the period). */
    function getResourceTypeFromExtension(ext: string): ResourceTypes;
    /** Return the resource (MIME) type of a given extension type. */
    function getResourceTypeFromExtension(ext: ResourceExtensions): ResourceTypes;
    enum RequestStatuses {
        /** The request has not been executed yet. */
        Pending = 0,
        /** The resource failed to load.  Check the request object for the error details. */
        Error = 1,
        /** The requested resource is loading. */
        Loading = 2,
        /** The requested resource has loaded (nothing more). */
        Loaded = 3,
        /** The requested resource is waiting on parent resources to complete. */
        Waiting = 4,
        /** The requested resource is ready to be used. */
        Ready = 5,
        /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
        Executed = 6
    }
    /**
     * Returns the base path based on the resource type.
     */
    function basePathFromResourceType(resourceType: string | ResourceTypes): string;
}
declare namespace DS {
    /** Contains a few utility functions for working with strings. */
    namespace StringUtils {
        /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
        function replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string;
        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
          * specified fixed length, then the request is ignored, and the given string is returned.
          * @param {any} str The string to pad.
          * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
          * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
          * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
          */
        function pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string;
        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        function append(source: string, suffix?: string, delimiter?: string): string;
        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        function prepend(source: string, prefix?: string, delimiter?: string): string;
        /**
         * Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups], where
         * 'groups' index 0 is the full matched text, and 1 onwards are any matched groups).
         */
        function matches(regex: RegExp, text: string): string[][];
        /**
         * Converts the given value to a string and returns it.  'undefined' (void 0) and null become empty, string types are
         * returned as is, and everything else will be converted to a string by calling 'toString()', or simply '""+value' if
         * 'value.toString' is not a function. If for some reason a call to 'toString()' does not return a string the cycle
         * starts over with the new value until a string is returned.
         * Note: If no arguments are passed in (i.e. 'StringUtils.toString()'), then undefined is returned.
         */
        function toString(value?: any): string;
        /** Splits the lines of the text (delimited by '\r\n', '\r', or '\n') into an array of strings. */
        function getLines(text: string): string[];
        interface IAddLineNumbersFilter {
            (lineNumber: number, marginSize: number, paddedLineNumber: string, line: string): string;
        }
        /** Adds a line number margin to the given text and returns the result. This is useful when display script errors.
        * @param {string} text The text to add line numbers to.
        * @param {Function} lineFilter An optional function to run on every line that should return new line text, or undefined to skip a line.
        */
        function addLineNumbersToText(text: string, lineFilter?: IAddLineNumbersFilter): any;
        /** Converts a byte array to a UTF8 string. */
        function byteArrayToString(array: Uint8Array): string;
        /** Converts a UTF8 string to a byte array. */
        function stringToByteArray(text: string): Uint8Array;
        /**
         * Escapes control, escape, or double quote characters in a string and returns it.
         * Note: Single quotes are not escaped by default.
         * @param str The string to escape.
         * @param includeSingleQuotes Escapes single quotes by doubling them.  This, along with escaping, is typically used to help sanitize strings before storing them in a database.
         */
        function escapeString(str: string, includeSingleQuotes?: boolean): string;
        /** Reduces multiple consecutive whitespace characters into a single space character.
         * This helps with either presentation, or when comparing text entered by users.
         */
        function reduceWhitespace(s: string): string;
        /**
         * Returns true if string content is undefined, null, empty, or only whitespace.
         * @param {string} value
         */
        function isEmptyOrWhitespace(value: string): boolean;
    }
    namespace Encoding {
        enum Base64Modes {
            /** Use standard Base64 encoding characters. */
            Standard = 0,
            /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
            URI = 1,
            /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
            * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
            */
            Custom = 2
        }
        var __64BASE_ENCODING_CHARS_STANDARD: string;
        var __64BASE_ENCODING_CHARS_URI: string;
        var __64BASE_ENCODING_CHARS_CUSTOM: string;
        /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
        *                             Exception: If the mode is URI encoding, then padding is false by default.
        */
        function base64Encode(value: string, mode?: Base64Modes, usePadding?: boolean): string;
        /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        */
        function base64Decode(value: string, mode?: Base64Modes): string;
    }
    abstract class HTML {
    }
    namespace HTML {
        /** Removes the '<!-- -->' comment sequence from the ends of the specified HTML. */
        function uncommentHTML(html: string): string;
        function getCommentText(html: string): string;
        /** Gets the text between '<!-- -->' (assumed to be at each end of the given HTML). */
        function getScriptCommentText(html: string): string;
        /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
        function replaceTags(html: string, tagReplacement?: string): string;
        /** Simply converts '<br/>' into EOL characters and strips all the HTML tags from the given HTML. */
        function htmlToPlainText(html: string): string;
        /** Encodes any characters other than numbers and letters as html entities.
         * @param html The HTML text to encode (typically to display in a browser).
         * @param ingoreChars You can optionally pass in a list of characters to ignore (such as "\r\n" to maintain source formatting when outputting HTML).
         * @param encodeSpaceAsNBSP If true, the spaces are replaced with "&nbsp;" elements to maintain the spacing.  If false (the default), the spaces will be collapsed when displayed in browsers.
         */
        function encodeHTML(html: string, ingoreChars?: string, encodeSpaceAsNBSP?: boolean): string;
    }
}
declare namespace DS {
    namespace VDOM {
        namespace Templating {
            /** Data template information as extracted from HTML template text. */
            interface IDataTemplate {
                id: string;
                originalHTML: string;
                templateHTML: string;
                templateItem: VDOM.Node;
                childTemplates: IDataTemplates;
            }
            interface IDataTemplates {
                [id: string]: IDataTemplate;
            }
            interface IHTMLParseResult {
                rootElements: VDOM.Node[];
                templates: IDataTemplates;
            }
            /** Parses HTML to create a graph object tree, and also returns any templates found.
            * This concept is similar to using XAML to load objects in WPF. As such, you have the option to use an HTML template, or dynamically build your
            * graph items directly in code.
            *
            * Warning about inline scripts: Script tags may be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
            * HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side (or client side for that matter) unless you
            * handle/execute the script code yourself.
            * @param {string} html The HTML to parse.
            * @param {boolean} strictMode If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
            * This can greatly help keep your html clean, AND identify possible areas of page errors.  If strict formatting is not important,
            * pass in false (also defaults to false if not specified).
            */
            function parse(html?: string, strictMode?: boolean): IHTMLParseResult;
        }
    }
}
declare namespace DS {
    /** Time related function utilities. */
    namespace Time {
        /** Returns a UTC timestamp string, similar to what is used with MySQL databases. */
        function getUTCTimestamp(): string;
    }
    /**
     * Represents a span of time (not a date). Calculation of dates usually relies on calendar rules.  A time-span object
     * doesn't care about months and day of the month - JavaScript already has a date object for that.
     * TimeSpan does, however, base the start of time on the epoch year of 1970 (same as the 'Date' object), and takes leap
     * years into account.
     *
     * Note: TimeSpan exposes the results as properties for fast access (rather than getters/setters), but changing individual
     * properties does not cause the other values to update.  Use the supplied functions for manipulating the values.
     */
    class TimeSpan {
        constructor(year?: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number);
        /** Returns the time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        static getTimeZoneOffset(): number;
        /** Creates a TimeSpan object from the current value returned by calling 'Date.now()', or 'new Date().getTime()' if 'now()' is not supported. */
        static now(): ITimeSpan;
        static utcTimeToLocalYear(timeInMs: number): number;
        static utcTimeToLocalDayOfYear(timeInMs: number): number;
        static utcTimeToLocalHours(timeInMs: number): number;
        static utcTimeToLocalMinutes(timeInMs: number): number;
        static utcTimeToLocalSeconds(timeInMs: number): number;
        static utcTimeToLocalMilliseconds(timeInMs: number): number;
        static utcTimeToLocalTime(timeInMs: number): ITimeSpan;
        /** Creates and returns a TimeSpan that represents the date object.
           * This relates to the 'date.getTime()' function, which returns the internal date span in milliseconds (from Epoch) with the time zone added.
           * See also: fromLocalDateAsUTC().
           */
        static fromDate(date: Date): ITimeSpan;
        /**
           * Creates and returns a TimeSpan that represents the date object's localized time as Coordinated Universal Time (UTC).
           * Note: This removes the time zone added to 'date.getTime()' to make a TimeSpan with localized values, but remember that values in a TimeSpan
           * instance always represent UTC time by default.
           * See also: fromDate().
           */
        static fromLocalDateAsUTC(date: Date): ITimeSpan;
        private static __parseSQLDateTime;
        /** Creates and returns a TimeSpan that represents the specified date string as the local time.
            * Note: The 'Date.parse()' function is used to parse the text, so any ISO-8601 formatted dates (YYYY-MM-DDTHH:mm:ss.sssZ) will be treated as UTC
            * based (no time zone applied). You can detect such cases using 'isISO8601()', or call 'parseLocal()' instead.
            * This function also supports the SQL standard Date/Time format (see 'isSQLDateTime()'), which is not supported in IE (yet).
            */
        static parse(dateString: string): ITimeSpan;
        /** Creates and returns a TimeSpan that represents the specified date string as Coordinated Universal Time (UTC). */
        static parseAsUTC(dateString: string): ITimeSpan;
        /** Returns true if the specified date is in the ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
             * Since JavaScript 'Date' objects parse ISO strings as UTC based (not localized), this function help detect such cases.
             * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time, or date+time+timezone).
             */
        static isISO8601(dateStr: string): boolean;
        /** Returns true if the specified date is in the standard SQL based Date/Time format (YYYY-MM-DD HH:mm:ss.sss+ZZ).
            * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time).
            * @param (boolean) requireTimeMatch If true, the space delimiter and time part MUST exist for the match, otherwise the date portion is only
            * required.  It's important to note that the date part of the ISO 8601 format is the same as the standard SQL Date/Time, and browsers will
            * treat the date portion of the SQL date as an ISO 8601 date at UTC+0.
            */
        static isSQLDateTime(dateStr: string, requireTimeMatch?: boolean): boolean;
        /** Calculates the number of leap days since Epoch up to a given year (note: cannot be less than the Epoch year [1970]). */
        static daysSinceEpoch(year: number): number;
        /** Calculates the number of years from the specified milliseconds, taking leap years into account. */
        static yearsSinceEpoch(ms: number): number;
        static isLeapYear(year: number): boolean;
        static msFromTime(year?: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): number;
        /** Returns the time zone as a string in the format "UTC[+/-]####".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getTimeZoneSuffix(timezoneOffsetInMs?: number): string;
        /** Returns the ISO-8601 time zone as a string in the format "[+/-]hh:mm:ss.sssZ".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getISOTimeZoneSuffix(timezoneOffsetInMs?: number): string;
        year: number;
        dayOfYear: number;
        hours: number;
        minutes: number;
        seconds: number;
        milliseconds: number;
        private __ms;
        private __date;
        private __localTS;
        /** Set the time of this TimeSpan, in milliseconds.
            * Note: This function assumes that milliseconds representing leap year days are included (same as the JavaScript 'Date' object).
            */
        setTime(timeInMs: number): ITimeSpan;
        /** Returns the internal millisecond total for this TimeSpan.
            * Note:
            */
        getTime(): number;
        add(timeInMS: number): ITimeSpan;
        add(yearOffset: number, dayOfYearOffset: number, hoursOffset?: number, minutesOffset?: number, secondsOffset?: number, msOffset?: number): ITimeSpan;
        subtract(timeInMS: number): ITimeSpan;
        subtract(yearOffset: number, dayOfYearOffset: number, hoursOffset?: number, minutesOffset?: number, secondsOffset?: number, msOffset?: number): ITimeSpan;
        /** Returns the time span as a string (note: this is NOT a date string).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            * @param {boolean} includeTimezone If true (default), the time zone part is included.
            * Note: This is ignored if 'includeTime' is false.
            */
        toString(includeTime?: boolean, includeMilliseconds?: boolean, includeTimezone?: boolean): string;
        /** Returns the time span as a string (note: this is NOT a date string).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            */
        toUTCString(includeTime?: boolean, includeMilliseconds?: boolean): string;
        /** Returns the time span as a local string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            * @param {boolean} includeTimezone If true (default), the time zone part is included.
            * Note: This is ignored if 'includeTime' is false.
            */
        toISODateString(includeTime?: boolean, includeMilliseconds?: boolean, includeTimezone?: boolean): string;
        /** Returns the time span as a Coordinated Universal Time (UTC) string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            * @param {boolean} includeTimezone If true (default), the time zone part is included.
            * Note: This is ignored if 'includeTime' is false.
            */
        toUTCISODateString(includeTime?: boolean, includeMilliseconds?: boolean, includeTimezone?: boolean): string;
        toValue(): number;
    }
    interface ITimeSpan extends TimeSpan {
    }
}
declare namespace DS {
    /** The result of 'Path.parse()', and also helps building URLs manually. */
    class Uri {
        /** Protocol (without '://'). */
        protocol?: string;
        /** URL host. */
        hostName?: string;
        /** Host port. */
        port?: string;
        /** URL path. */
        path?: string;
        /** Query (without '?'). */
        query?: string;
        /** Fragment (without '#'). */
        fragment?: string;
        /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
        username?: string;
        /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
        password?: string;
        constructor(
        /** Protocol (without '://'). */
        protocol?: string, 
        /** URL host. */
        hostName?: string, 
        /** Host port. */
        port?: string, 
        /** URL path. */
        path?: string, 
        /** Query (without '?'). */
        query?: string, 
        /** Fragment (without '#'). */
        fragment?: string, 
        /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
        username?: string, // (see also: https://goo.gl/94ivpK)
        /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
        password?: string);
        /** Returns only  host + port parts combined. */
        host(): string;
        /** Returns only the protocol + host + port parts combined. */
        origin(): string;
        /**
           * Builds the full URL from the parts specified in this instance while also allowing to override parts.
           * @param {string} origin An optional origin that replaces the protocol+host+port part.
           * @param {string} path An optional path that replaces the current path property value on this instance.
           * @param {string} query An optional query that replaces the current query property value on this instance.
           * This value should not start with a '?', but if exists will be handled correctly.
           * @param {string} fragment An optional fragment that replaces the current fragment property value on this instance.
           * This value should not start with a '#', but if exists will be handled correctly.
           */
        toString(origin?: string, path?: string, query?: string, fragment?: string): string;
        /**
           * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
           * the path to the resource (minus the resource name part).
           * For example, if the path is 'a/b/c' or 'a/b/c.ext' (etc.) then 'a/b/' is returned.
           * This is useful to help remove resource names, such as file names, from the end of a URL path.
           * @param {string} resourceName An optional resource name to append to the end of the resulting path.
           */
        getResourcePath(resourceName?: string): string;
        /**
           * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
           * the path to the resource (minus the resource name part), and optionally appends a new 'resourceName' value.
           * For example, if the current Uri represents 'http://server/a/b/c?a=b#h' or 'http://server/a/b/c.ext?a=b#h' (etc.), and
           * 'resourceName' is "x", then 'http://server/a/b/x?a=b#h' is returned.
           * This is useful to help remove resource names, such as file names, from the end of a URL path.
           * @param {string} resourceName An optional name to append to the end of the resulting path.
           */
        getResourceURL(resourceName?: string): string;
        /** Returns a new Uri object that represents the 'window.location' object values. */
        static fromLocation(): Uri;
    }
}
/** This is the root to all DreamSpaceJS utilities.
 * These utilities cover most common developer needs when building custom components.
 */
declare namespace DS {
    /** Contains operations for working with data loading and communication. */
    namespace IO {
        type Methods = "GET" | "POST" | "PUT" | "DELETE";
        const enum HttpStatus {
            /**  This means that the server has received the request headers, and that the client should proceed to send the request body (in the case of a request for which a body needs to be sent; for example, a POST request). If the request body is large, sending it to a server when a request has already been rejected based upon inappropriate headers is inefficient. To have a server check if the request could be accepted based on the request's headers alone, a client must send Expect: 100-continue as a header in its initial request and check if a 100 Continue status code is received in response before continuing (or receive 417 Expectation Failed and not continue). */
            Continue = 100,
            /**  This means the requester has asked the server to switch protocols and the server is acknowledging that it will do so. */
            SwitchingProtocols = 101,
            /**  Standard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action. */
            OK = 200,
            /**  The request has been fulfilled and resulted in a new resource being created. */
            Created = 201,
            /**  The request has been accepted for processing, but the processing has not been completed. The request might or might not eventually be acted upon, as it might be disallowed when processing actually takes place. */
            Accepted = 202,
            /**  (since HTTP/1.1) The server successfully processed the request, but is returning information that may be from another source. */
            NonAuthoritativeInformation = 203,
            /**  The server successfully processed the request, but is not returning any content. */
            NoContent = 204,
            /**  The server successfully processed the request, but is not returning any content. Unlike a 204 response, this response requires that the requester reset the document view. */
            ResetContent = 205,
            /**  (RFC 7233) The server is delivering only part of the resource (byte serving) due to a range header sent by the client. The range header is used by HTTP clients to enable resuming of interrupted downloads, or split a download into multiple simultaneous streams. */
            PartialContent = 206,
            /**  (WebDAV; RFC 4918) The message body that follows is an XML message and can contain a number of separate response codes, depending on how many sub-requests were made.[4] */
            MultiStatus = 207,
            /**  (WebDAV; RFC 5842) The members of a DAV binding have already been enumerated in a previous reply to this request, and are not being included again. */
            AlreadyReported = 208,
            /** (RFC 3229) The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.[5] */
            IMUsed = 226,
            /**  Indicates multiple options for the resource that the client may follow. It, for instance, could be used to present different format options for video, list files with different extensions, or word sense disambiguation. */
            MultipleChoices = 300,
            /**  This and all future requests should be directed to the given URI. */
            MovedPermanently = 301,
            /**  This is an example of industry practice contradicting the standard. The HTTP/1.0 specification (RFC 1945) required the client to perform a temporary redirect (the original describing phrase was "Moved Temporarily"),[6] but popular browsers implemented 302 with the functionality of a 303 See Other. Therefore, HTTP/1.1 added status codes 303 and 307 to distinguish between the two behaviours.[7] However, some Web applications and frameworks use the 302 status code as if it were the 303.[8] */
            Found = 302,
            /**  (since HTTP/1.1) The response to the request can be found under another URI using a GET method. When received in response to a POST (or PUT/DELETE), it should be assumed that the server has received the data and the redirect should be issued with a separate GET message. */
            SeeOther = 303,
            /**  (RFC 7232) Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match. This means that there is no need to retransmit the resource, since the client still has a previously-downloaded copy. */
            NotModified = 304,
            /**  (since HTTP/1.1) The requested resource is only available through a proxy, whose address is provided in the response. Many HTTP clients (such as Mozilla[9] and Internet Explorer) do not correctly handle responses with this status code, primarily for security reasons.[10] */
            UseProxy = 305,
            /**  No longer used. Originally meant "Subsequent requests should use the specified proxy."[11] */
            SwitchProxy = 306,
            /**  (since HTTP/1.1) In this case, the request should be repeated with another URI; however, future requests should still use the original URI. In contrast to how 302 was historically implemented, the request method is not allowed to be changed when reissuing the original request. For instance, a POST request should be repeated using another POST request.[12] */
            TemporaryRedirect = 307,
            /**  (RFC 7538) The request, and all future requests should be repeated using another URI. 307 and 308 (as proposed) parallel the behaviours of 302 and 301, but do not allow the HTTP method to change. So, for example, submitting a form to a permanently redirected resource may continue smoothly.[13] */
            PermanentRedirect = 308,
            /**  (Google) This code is used in the Resumable HTTP Requests Proposal to resume aborted PUT or POST requests.[14] */
            ResumeIncomplete = 308,
            /**  The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).[15] */
            BadRequest = 400,
            /**  (RFC 7235) Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource. See Basic access authentication and Digest access authentication. */
            Unauthorized = 401,
            /**  Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micropayment scheme, but that has not happened, and this code is not usually used. Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.[16] */
            PaymentRequired = 402,
            /**  The request was a valid request, but the server is refusing to respond to it. Unlike a 401 Unauthorized response, authenticating will make no difference. */
            Forbidden = 403,
            /**  The requested resource could not be found but may be available again in the future. Subsequent requests by the client are permissible. */
            NotFound = 404,
            /**  A request was made of a resource using a request method not supported by that resource; for example, using GET on a form which requires data to be presented via POST, or using PUT on a read-only resource. */
            MethodNotAllowed = 405,
            /**  The requested resource is only capable of generating content not acceptable according to the Accept headers sent in the request. */
            NotAcceptable = 406,
            /**  (RFC 7235) The client must first authenticate itself with the proxy. */
            ProxyAuthenticationRequired = 407,
            /**  The server timed out waiting for the request. According to HTTP specifications: "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time." */
            RequestTimeout = 408,
            /**  Indicates that the request could not be processed because of conflict in the request, such as an edit conflict in the case of multiple updates. */
            Conflict = 409,
            /**  Indicates that the resource requested is no longer available and will not be available again. This should be used when a resource has been intentionally removed and the resource should be purged. Upon receiving a 410 status code, the client should not request the resource again in the future. Clients such as search engines should remove the resource from their indices.[17] Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead. */
            Gone = 410,
            /**  The request did not specify the length of its content, which is required by the requested resource. */
            LengthRequired = 411,
            /** (RFC 7232) The server does not meet one of the preconditions that the requester put on the request. */
            PreconditionFailed = 412,
            /**  (RFC 7231) The request is larger than the server is willing or able to process. Called "Request Entity Too Large " previously. */
            PayloadTooLarge = 413,
            /**  The URI provided was too long for the server to process. Often the result of too much data being encoded as a query-string of a GET request, in which case it should be converted to a POST request. */
            RequestURITooLong = 414,
            /**  The request entity has a media type which the server or resource does not support. For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format. */
            UnsupportedMediaType = 415,
            /**  (RFC 7233) The client has asked for a portion of the file (byte serving), but the server cannot supply that portion. For example, if the client asked for a part of the file that lies beyond the end of the file. */
            RequestedRangeNotSatisfiable = 416,
            /**  The server cannot meet the requirements of the Expect request-header field. */
            ExpectationFailed = 417,
            /**  (RFC 2324) This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers. The RFC specifies this code should be returned by tea pots requested to brew coffee. */
            ImATeapot = 418,
            AuthenticationTimeout = 419,
            /**  (RFC 7540) The request was directed at a server that is not able to produce a response (for example because a connection reuse).[19] */
            MisdirectedRequest = 421,
            /**  (WebDAV; RFC 4918) The request was well-formed but was unable to be followed due to semantic errors.[4] */
            UnprocessableEntity = 422,
            /**  (WebDAV; RFC 4918) The resource that is being accessed is locked.[4] */
            Locked = 423,
            /**  (WebDAV; RFC 4918) The request failed due to failure of a previous request (e.g., a PROPPATCH).[4] */
            FailedDependency = 424,
            /**  The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field. */
            UpgradeRequired = 426,
            /**  (RFC 6585) The origin server requires the request to be conditional. Intended to prevent "the 'lost update' problem, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict."[20] */
            PreconditionRequired = 428,
            /**  (RFC 6585) The user has sent too many requests in a given amount of time. Intended for use with rate limiting schemes.[20] */
            TooManyRequests = 429,
            /**  (RFC 6585) The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.[20] */
            RequestHeaderFieldsTooLarge = 431,
            /**  (Microsoft) A Microsoft extension. Indicates that your session has expired.[21] */
            LoginTimeout = 440,
            /**  (Nginx) Used in Nginx logs to indicate that the server has returned no information to the client and closed the connection (useful as a deterrent for malware). */
            NoResponse = 444,
            /**  (Microsoft) A Microsoft extension. The request should be retried after performing the appropriate action.[22] */
            RetryWith = 449,
            /**  (Microsoft) A Microsoft extension. This error is given when Windows Parental Controls are turned on and are blocking access to the given webpage.[23] */
            BlockedByWindowsParentalControls = 450,
            /**  (Internet draft) Defined in the internet draft "A New HTTP Status Code for Legally-restricted Resources".[24] Intended to be used when resource access is denied for legal reasons, e.g. censorship or government-mandated blocked access. A reference to the 1953 dystopian novel Fahrenheit 451, where books are outlawed.[25] */
            UnavailableForLegalReasons = 451,
            /**  (Microsoft) Used in Exchange ActiveSync if there either is a more efficient server to use or the server cannot access the users' mailbox.[26] */
            Redirect = 451,
            /**  (Nginx) Nginx internal code similar to 431 but it was introduced earlier in version 0.9.4 (on January 21, 2011).[28][original research?] */
            RequestHeaderTooLarge = 494,
            /**  (Nginx) Nginx internal code used when SSL client certificate error occurred to distinguish it from 4XX in a log and an error page redirection. */
            CertError = 495,
            /**  (Nginx) Nginx internal code used when client didn't provide certificate to distinguish it from 4XX in a log and an error page redirection. */
            NoCert = 496,
            /**  (Nginx) Nginx internal code used for the plain HTTP requests that are sent to HTTPS port to distinguish it from 4XX in a log and an error page redirection. */
            HTTPtoHTTPS = 497,
            /**  (Esri) Returned by ArcGIS for Server. A code of 498 indicates an expired or otherwise invalid token.[29] */
            TokenExpiredInvalid = 498,
            /**  (Nginx) Used in Nginx logs to indicate when the connection has been closed by client while the server is still processing its request, making server unable to send a status code back.[30] */
            ClientClosedRequest = 499,
            /**  (Esri) Returned by ArcGIS for Server. A code of 499 indicates that a token is required (if no token was submitted).[29] */
            TokenRequired = 499,
            /**  A generic error message, given when an unexpected condition was encountered and no more specific message is suitable. */
            InternalServerError = 500,
            /**  The server either does not recognize the request method, or it lacks the ability to fulfill the request. Usually this implies future availability (e.g., a new feature of a web-service API). */
            NotImplemented = 501,
            /**  The server was acting as a gateway or proxy and received an invalid response from the upstream server. */
            BadGateway = 502,
            /**  The server is currently unavailable (because it is overloaded or down for maintenance). Generally, this is a temporary state. */
            ServiceUnavailable = 503,
            /**  The server was acting as a gateway or proxy and did not receive a timely response from the upstream server. */
            GatewayTimeout = 504,
            /**  The server does not support the HTTP protocol version used in the request. */
            HTTPVersionNotSupported = 505,
            /** (RFC 2295) Transparent content negotiation for the request results in a circular reference.[31] */
            VariantAlsoNegotiates = 506,
            /** (WebDAV; RFC 4918) The server is unable to store the representation needed to complete the request.[4] */
            InsufficientStorage = 507,
            /** (WebDAV; RFC 5842) The server detected an infinite loop while processing the request (sent in lieu of 208 Already Reported). */
            LoopDetected = 508,
            /** (Apache bw/limited extension)[32]This status code is not specified in any RFCs. Its use is unknown. */
            BandwidthLimitExceeded = 509,
            /** (RFC 2774) Further extensions to the request are required for the server to fulfil it.[33] */
            NotExtended = 510,
            /** (RFC 6585) The client needs to authenticate to gain network access. Intended for use by intercepting proxies used to control access to the network (e.g., "captive portals" used to require agreement to Terms of Service before granting full Internet access via a Wi-Fi hotspot).[20] */
            NetworkAuthenticationRequired = 511,
            /**  This status code is not specified in any RFC and is returned by certain services, for instance Microsoft Azure and CloudFlare servers: "The 520 error is essentially a �catch-all� response for when the origin server returns something unexpected or something that is not tolerated/interpreted (protocol violation or empty response)."[34] */
            UnknownError = 520,
            /**  This status code is not specified in any RFCs, but is used by CloudFlare's reverse proxies to signal that a server connection timed out. */
            OriginConnectionTimeout = 522,
            /** (Unknown) This status code is not specified in any RFCs, but is used by Microsoft HTTP proxies to signal a network read timeout behind the proxy to a client in front of the proxy.[citation needed] */
            NetworkReadTimeoutError = 598,
            /** (Unknown) This status code is not specified in any RFCs, but is used by Microsoft HTTP proxies to signal a network connect timeout behind the proxy to a client in front of the proxy.[citation needed] */
            NetworkConnectTimeoutError = 599
        }
        class Response<TData = any> {
            /** The HTTP status code for the response. */
            status: HttpStatus;
            /** A message for the response. */
            message?: string;
            /** An optional exception object details that may be included if the response is an error. */
            error?: Exception;
            /** Optional data for this response. */
            data?: TData;
            /** If the response is an issue with a view the path is set here. */
            viewPath?: string;
            /** If true then the data can be serialized. The default is false (undefined), which then allows transferring data using 'JSON.stringify()'
             * This prevents server-side-only or client-side-only data from being able to transfer between platforms.
             */
            notSerializable?: boolean;
            constructor(message?: string, data?: any, httpStatusCode?: HttpStatus, notSerializable?: boolean, error?: Exception);
            toString(): string;
            toValue(): string;
            toJSON(): string;
            setViewInfo(viewPath?: string): this;
            static fromError(message: string, error: string | Error | Exception, httpStatusCode?: HttpStatus, data?: any): Response<any>;
        }
        interface IResponse<TData = any> extends Response<TData> {
        }
        /** Attempts to get an HTTP resource from a URL. */
        function get<T = object>(url: string, type?: ResourceTypes.Application_JSON, method?: Methods, data?: any): Promise<T>;
        /** Attempts to get an HTTP resource from a URL. */
        function get<T = string>(url: string, type?: ResourceTypes.Text_XML, method?: Methods, data?: any): Promise<T>;
        /** Attempts to get an HTTP resource from a URL. */
        function get<T = string>(url: string, type?: ResourceTypes.Text_Plain, method?: Methods, data?: any): Promise<T>;
        /** Attempts to get an HTTP resource from a URL. */
        function get<T = any>(url: string, type?: string, method?: Methods, data?: any): Promise<T>;
        /** Loads a file and returns the contents. */
        function read(path: string): Promise<Uint8Array>;
        /** Saves contents to a file. */
        function write(path: string, content: Uint8Array): Promise<void>;
        /** Lists the contents of a directory. */
        function getFiles(path: string): Promise<string[]>;
        /** Lists the contents of a directory. */
        function getDirectories(path: string): Promise<string[]>;
    }
}
declare namespace DS {
    /** Contains functions and types to manage events within the workflow system. */
    namespace Events {
        class EventHandler {
            event: EventDefinition;
            workflow: Workflow;
            /**
             * @param event The defined event for which the associated workflow will be triggered.
             * @param workflow The workflow to start when the underlying event triggers.
             */
            constructor(event: EventDefinition, workflow: Workflow);
        }
    }
}
declare namespace DS {
    namespace VirtualFileSystem {
        enum SyncStatus {
            /** Not synchronizing. */
            None = 0,
            /** The content is being uploaded. */
            Uploading = 1,
            /** Upload error. */
            Error = 2,
            /** File now exists on the remote endpoint. */
            Completed = 3
        }
        class DirectoryItem extends TrackableObject {
            readonly _fileManager: FileManager;
            /** Holds the UTC time the item was stored locally. If this is undefined then the item is in memory only, which might result in data loss if not stored on the server. */
            storedLocally: Date;
            /** Holds the UTC time the item was stored remotely. If this is undefined and the item is not stored locally then the item is only in memory and that could lead to data loss. */
            storedRemotely: Date;
            /** The last time this*/
            get lastAccessed(): Date;
            /** Updates the 'lastAccessed' date+time value to the current value. Touching this directory item also refreshes the dates of all parent items.
             * When the date of an item changes after a touch, it starts the process of reviewing and synchronizing with the back-end.
             */
            touch(): void;
            private _lastAccessed;
            /** The sync status of this item.
             * Note: Each directory item node syncs in sequence parent-to-child; thus, the child only syncs when the parent succeeds.  That said,
             * to be efficient, the parent will send itself AND all child directories (not files) as one JSON request.
             */
            syncStatus: SyncStatus;
            lastSynced: Date;
            syncError: string;
            get name(): string;
            private _name;
            /** Returns a reference to the parent item.  If there is no parent, then 'null' is returned.
             */
            get parent(): DirectoryItem;
            /** Sets a new parent type for this.  The current item will be removed from its parent (if any), and added to the given parent. */
            set parent(parent: DirectoryItem);
            private _parent;
            /** The full path + item name. */
            get absolutePath(): string;
            constructor(fileManager: FileManager, parent?: DirectoryItem);
            toString(): string;
            /** Checks if a namespace item exists.  You can also provide a nested item path.
              * For example, if the current item is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
              */
            exists(name: string, ignore?: DirectoryItem): boolean;
            /** Checks if the given namespace item exists under this item.
              */
            exists(item: DirectoryItem, ignore?: DirectoryItem): boolean;
            /** Resolves a namespace path under this item.  You can provide a nested path if desired.
              * For example, if the current item is 'A/B' within the 'A/B/C/D' path, then you could pass in 'C/D'.
              * If not found, then null is returned.
              * @param {function} typeFilter The type that the returned item must be a derivative of.
              */
            resolve<T extends DirectoryItem>(itemPath: string, typeFilter?: new (...args: any[]) => T): T;
            getJSONStructure<T extends typeof DirectoryItem>(typeFilter?: T): void;
        }
        namespace Abstracts {
            function _defaultCreateDirHandler(fileManager: FileManager, parent?: DirectoryItem): Directory;
            abstract class Directory extends DirectoryItem {
                /** The function used to create directory instances.
                 * Host programs can overwrite this event property with a handler to create and return derived types instead.
                 */
                static get onCreateDirectory(): typeof _defaultCreateDirHandler;
                static set onCreateDirectory(value: typeof _defaultCreateDirHandler);
                private static _onCreateDirectory;
                protected _childItems: DirectoryItem[];
                protected _childItemsByName: {
                    [index: string]: DirectoryItem;
                };
                get hasChildren(): boolean;
                constructor(fileManager: FileManager, parent?: DirectoryItem);
                getFile(filePath: string): File;
                getDirectory(path: string): Directory;
                /** Creates a directory under the user root endpoint. */
                createDirectory(path: string): Directory;
                createFile(filePath: string, contents?: string): File;
                /** Adds the given item under this item.
                  */
                add<T extends DirectoryItem>(item: T): T;
                /** Removes an item under this item. If nothing was removed, then null is returned, otherwise the removed item is returned (not the item passed in). */
                remove<T extends DirectoryItem>(item: T): T;
                /** Removes an item under this item.  If nothing was removed, then null is returned, otherwise the removed item is returned.
                 *  You can provide a nested item path if desired. For example, if the current item is 'A/B' within the 'A/B/C/D' namespace,
                 *  then you could pass in 'C/D'.
                  */
                remove(name: string): DirectoryItem;
                /** Triggered when a directory item (i.e. directory or file) is about to be added to the system.
                 * To abort you can:
                 *   1. throw an exception - the error message (reason) will be displayed to the user.
                 *   2. return an explicit 'false' value, which will prevent the item from adding without a reason.
                 *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being added.
                 */
                protected onItemAdding(item: DirectoryItem): void | boolean | string;
                /** Triggered when a directory item (i.e. directory or file) gets added to the system. */
                protected onItemAdded(item: DirectoryItem): void;
                /** Triggered when a directory item (i.e. directory or file) id about to be removed from the system.
                 * To abort you can:
                 *   1. throw an exception - the error message (reason) will be displayed to the user.
                 *   2. return an explicit 'false' value, which will prevent the item from getting removed without a reason.
                 *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being removed.
                 */
                protected onItemRemoving(item: DirectoryItem): void | boolean | string;
                /** Triggered when a directory item (i.e. directory or file) gets removed from the system. */
                protected onItemRemoved(item: DirectoryItem): void;
                getJSONStructure(): void;
            }
            function _defaultCreateFileHandler(fileManager: FileManager, parent?: DirectoryItem, content?: string): File;
            abstract class File extends DirectoryItem {
                /** The function used to create file instances.
                 * Host programs can overwrite this event property with a handler to create and return derived types instead.
                 */
                static get onCreateFile(): typeof _defaultCreateFileHandler;
                static set onCreateFile(value: typeof _defaultCreateFileHandler);
                private static _onCreateFile;
                get content(): Uint8Array;
                set content(value: Uint8Array);
                private _contents;
                get text(): string;
                set text(value: string);
                constructor(fileManager: FileManager, parent?: DirectoryItem, content?: string | Uint8Array);
                /** Converts the contents to text and returns it base-64 encoded. */
                toBase64(): string;
                /** Decodes the base-64 content and updates the current file contents with the result. */
                fromBase64(contentB64: string): void;
                protected onSave(): Promise<this>;
                protected onLoad(): Promise<this>;
                protected onAfterSuccessfulSave(result: this): void;
                protected onAfterSuccessfulLoad(result: this): void;
                /** Returns the resource value for this trackable object, which is just the config file contents. */
                getResourceValue(): Promise<any>;
                getResourceType(): ResourceTypes;
            }
        }
        /** Manages files in a virtual file system. This allows project files to be stored locally and synchronized with the server when a connection is available.
         * For off-line storage to work, the browser must support local storage.
         * Note: The 'FlowScript.currentUser' object determines the user-specific root directory for projects.
         */
        class FileManager {
            /** The URL endpoint for the FlowScript project files API. Defaults to 'FileManager.apiEndpoint'. */
            apiEndpoint: string;
            static _filesByGUID: {
                [guid: string]: DirectoryItem;
            };
            static getFileByID(id: string): DirectoryItem;
            /** Manages the global file system for FlowScript by utilizing local storage space and remote server space.
             * The file manager tries to keep recently accessed files local (while backed up to remove), and off-loads
             * less-accessed files to save space.
             */
            static get current(): FileManager;
            private static _current;
            /** The URL endpoint for the FlowScript project files API. */
            static apiEndpoint: string;
            /** Just a local property that checks for and returns 'FlowScript.currentUser'. */
            static get currentUser(): User;
            /** The API endpoint to the directory for the current user. */
            static get currentUserEndpoint(): string;
            /** The root directory represents the API endpoint at 'FileManager.apiEndpoint'. */
            readonly root: Abstracts.Directory;
            constructor(
            /** The URL endpoint for the FlowScript project files API. Defaults to 'FileManager.apiEndpoint'. */
            apiEndpoint?: string);
            /** Triggered when a directory item (i.e. directory or file) is about to be added to the system.
             * To abort you can:
             *   1. throw an exception - the error message (reason) will be displayed to the user.
             *   2. return an explicit 'false' value, which will prevent the item from adding without a reason.
             *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being added.
             */
            protected onItemAdding(item: DirectoryItem): void | boolean | string;
            /** Triggered when a directory item (i.e. directory or file) gets added to the system. */
            protected onItemAdded(item: DirectoryItem): void;
            /** Triggered when a directory item (i.e. directory or file) id about to be removed from the system.
             * To abort you can:
             *   1. throw an exception - the error message (reason) will be displayed to the user.
             *   2. return an explicit 'false' value, which will prevent the item from getting removed without a reason.
             *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being removed.
             */
            protected onItemRemoving(item: DirectoryItem): void | boolean | string;
            /** Triggered when a directory item (i.e. directory or file) gets removed from the system. */
            protected onItemRemoved(item: DirectoryItem): void;
            /** Gets a directory under the current user root endpoint.
             * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
             */
            getDirectory(path?: string, userId?: string): Abstracts.Directory;
            /** Creates a directory under the current user root endpoint.
             * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
             */
            createDirectory(path: string, userId?: string): Abstracts.Directory;
            /** Gets a file under the current user root endpoint.
             * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
             */
            getFile(filePath: string, userId?: string): Abstracts.File;
            /** Creates a file under the current user root endpoint.
             * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
             */
            createFile(filePath: string, contents?: string, userId?: string): Abstracts.File;
        }
        /** Combine two paths into one. */
        function combine(path1: string | Abstracts.Directory, path2: string | Abstracts.Directory): string;
    }
}
declare namespace DS {
    interface ISavedSolution extends ISavedTrackableObject {
        name: string;
        description?: string;
        directory?: string;
        /** If this is a string, then it represents a GUID that references a project instead. */
        projects?: (ISavedProject | string)[];
    }
    /** The system.json file contains the entire list of solutions in the system, including system-related settings.
     */
    interface ISystem {
        solutions?: ISavedSolution[];
    }
    namespace Abstracts {
        function _defaultCreateSolutionHandler(solution: ISavedSolution): Solution;
        function _defaultCreateProjectHandler(solution: Solution, project: ISavedProject): Project;
        /**
        * Holds a collection of projects.
        * When a project instance is created, the default 'Solution.onCreateProject' handler is used, which can be overridden for derived project types.
        */
        abstract class Solution extends ConfigBaseObject {
            static CONFIG_FILENAME: string;
            /** The function used to create project instances when a project is created from saved project data.
             * Host programs can overwrite this event property with a handler to create and return derived types instead (such as ProjectUI.ts).
             */
            static get onCreateProject(): typeof _defaultCreateProjectHandler;
            static set onCreateProject(value: typeof _defaultCreateProjectHandler);
            private static _onCreateProject;
            get count(): number;
            get projects(): Project[];
            private _projects;
            get userIDs(): string[];
            private _userIDs;
            /** The file storage directory for all projects. */
            readonly directory: VirtualFileSystem.Abstracts.Directory;
            /** A list of user IDs and assigned roles for this project. */
            readonly userSecurity: UserAccess;
            /** A name for the project. */
            name: string;
            /** A description for the project. */
            description: string;
            /** Returns the startup project, or null if none found. */
            get startupProject(): Project;
            constructor(fileManager?: VirtualFileSystem.FileManager);
            /**
             * Creates a new project with the given title and description.
             * @param name The project title.
             * @param description The project description.
             */
            createProject(name: string, description?: string): Project;
            /** Returns a list of projects that match the given URL path. */
            getProjects(path: string): Promise<Project[]>;
            /** Updates all projects from the data store and returns the project marked as the "start-up". */
            refreshProjects(): Promise<Project>;
            /** Saves the tracking details and related items to a specified object.
            * If no object is specified, then a new empty object is created and returned.
            */
            saveConfigToObject<T extends ISavedPersistableObject>(target?: T & ISavedSolution): T & ISavedSolution;
            /** Loads the tracking details from a given object. */
            loadConfigFromObject(source?: ISavedSolution, replace?: boolean): this;
            /** Saves the solution and related items.
            */
            onSave(): Promise<string>;
            /** Loads and merges/replaces the solution from the virtual file system.
             * @param replace If true, the whole project and any changed properties are replaced.  If false (the default), then only unmodified properties get updated.
             */
            onLoad(replace?: boolean): Promise<string>;
        }
        abstract class Solutions {
            /** The function used to create solution instances when a solution is created from saved solution data.
             * Host programs can overwrite this event property with a handler to create and return derived types instead.
             */
            static get onCreateSolution(): typeof _defaultCreateSolutionHandler;
            static set onCreateSolution(value: typeof _defaultCreateSolutionHandler);
            private static _onCreateSolution;
            static get solutions(): Solution[];
            private static _solutions;
            static get startupSolution(): Solution;
            /** Returns the solution with the specified ID, or null if not found. */
            static get(id: string): Solution;
            /** Returns a list of available solution GUIDs that can be loaded. */
            static getSolutions(): Promise<ISavedSolution[]>;
            /** Triggers the process to load all the solution details in the '/solutions' folder by first calling 'Solutions.getSolutions()'
             * to get the IDs from 'solutions.json'. While all solution configurations are loaded, the contained projects are not.
             */
            static refresh(fm?: VirtualFileSystem.FileManager): Promise<typeof Solutions>;
            /**
             * Creates a new solution with the given title and description.
             * @param name The solution title.
             * @param description The solution description.
             */
            static createSolution(name: string, description?: string, guid?: string): Solution;
        }
    }
}
declare namespace DS {
    interface ISavedProject extends ISavedTrackableObject {
        name: string;
        version?: string;
        description?: string;
        directory?: string;
        /** File paths related to this project. */
        files?: string[];
        workflows?: (ISavedWorkflow | string)[];
    }
    namespace Abstracts {
        abstract class Project extends ConfigBaseObject {
            /** The solution this project belongs to. */ readonly solution: Solution;
            /** The title of the project. */ name: string;
            /** The project's description. */ description?: string;
            static CONFIG_FILENAME: string;
            /** A list of all files associated with this project, indexed by the absolute lowercase file path. */
            readonly files: {
                [index: string]: VirtualFileSystem.Abstracts.File;
            };
            /** A list of user IDs and assigned roles for this project. */
            readonly userSecurity: UserAccess;
            /** The site for this project.  Every project contains a site object, even for API-only projects. For API-only projects there are no pages. */
            readonly site: Site;
            /** True if this project holds the main entry point when no other project is active. */
            isStartup: boolean;
            /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
              * developers to move expressions easily between scripts.
              * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
              */
            get expressionBin(): SelectedItem[];
            private _expressionBin;
            onExpressionBinItemAdded: EventDispatcher<Project, (item: SelectedItem, project: Project) => void>;
            onExpressionBinItemRemoved: EventDispatcher<Project, (item: SelectedItem, project: Project) => void>;
            /** Returns the expression that was picked by the user for some operation. In the future this may also be used during drag-n-drop operations. */
            get pickedItem(): SelectedItem;
            private _pickedItem;
            constructor(
            /** The solution this project belongs to. */ solution: Solution, 
            /** The title of the project. */ name: string, 
            /** The project's description. */ description?: string);
            /** Saves the project values to an object - typically prior to serialization. */
            saveConfigToObject<T extends ISavedPersistableObject>(target?: T & ISavedProject): T & ISavedProject;
            /** Saves the project to a persisted storage, such as the local browser storage, or a remote store, if possible.
             * Usually the local storage is attempted first, then the system will try to sync with a remote store.  If there
             * is no free space in the local store, the system will try to sync with a remote store.  If that fails, the
             * data will only be in memory and a UI warning will display.
             */
            saveToStorage(source?: ISavedPersistableObject & ISavedProject): void;
            /** Loads and merges/replaces the project values from an object - typically prior to serialization.
             * @param replace If true, the whole project and any changed properties are replaced.  If false (the default), then only unmodified properties get updated.
             */
            loadConfigFromObject(source?: ISavedProject, replace?: boolean): this;
            /** Returns the resource value for this trackable object, which is just the config file contents. */
            getResourceValue(): Promise<any>;
            getResourceType(): ResourceTypes;
            /** Saves the project and related items.
             */
            onSave(): Promise<string>;
            /** Loads and merges/replaces the project from the virtual file system.
             * @param replace If true, the whole project and any changed properties are replaced.  If false (the default), then only unmodified properties get updated.
             */
            onLoad(replace?: boolean): Promise<string>;
            /** Saves the project to data objects (calls this.save() when 'source' is undefined) and uses the JSON object to
             * serialize the result into a string.
             */
            serialize(): string;
            addToBin(expr: SelectedItem, triggerEvent?: boolean): void;
            removeFromBin(expr: SelectedItem, triggerEvent?: boolean): void;
            isInBin(expr: SelectedItem): boolean;
            pick(expr: SelectedItem): void;
            /** Returns a list of resources that match the given URL path. */
            getResource(path: string): Promise<Resource[]>;
        }
    }
}
declare namespace DS {
    /** Notifies the end user of an issue within a component, such as incorrect input and output mappings. */
    class ComponentError {
        readonly Message: string;
        readonly Property?: Property;
    }
    /** A component. */
    class Component extends TrackableObject {
        script: string;
        compiledScript: string;
        /** Inputs are generated as parameters at the top of the function that wraps the script. */
        readonly inputs: Property[];
        /** Outputs are */
        readonly outputs: Property[];
        readonly events: EventDefinition[];
        /** Returns a list of one or more issues within a component, such as incorrect input and output mappings.
         * 'Validate()' is usually called when the user has performed an operation when working with the components
         * and related objects.
         * @param errorList An array to store all the errors.  When empty, a new array is created and past onto other validate functions.
         */
        validate(errorList?: ComponentError[]): ComponentError[];
        execute(): Promise<void>;
    }
}
declare namespace DS {
    /** Defines an event that can trigger a workflow. */
    class EventDefinition extends TrackableObject {
        /** The name of this event. */
        name: string;
        /** The parameters defined for this event.  Components are to supply arguments for this when triggering events. */
        readonly parameters: Property[];
    }
}
declare namespace DS {
    /** Represents an event callback function. Handlers should return false to cancel event dispatching if desired (anything else is ignored). */
    interface EventHandler {
        (this: object, ...args: any[]): void | boolean;
    }
    /**
     * The event trigger handler is called to allow custom handling of event handlers when an event occurs.
     * This handler should return false to cancel event dispatching if desired (anything else is ignored).
     */
    interface EventTriggerHandler<TOwner extends object, TCallback extends EventHandler> {
        (event: IEventDispatcher<TOwner, TCallback>, handler: IDelegate<object, TCallback>, args: any[], mode?: EventModes): void | boolean;
    }
    /** Controls how the event progression occurs. */
    enum EventModes {
        /** Trigger event on the way up to the target. */
        Capture = 0,
        /** Trigger event on the way down from the target. */
        Bubble = 1,
        /** Trigger event on both the way up to the target, then back down again. */
        CaptureAndBubble = 2
    }
    /**
      * The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
      * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
      * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
      * instance level event handler registration on the class only when necessary.
      */
    class EventDispatcher<TOwner extends object = object, TCallback extends EventHandler = EventHandler> extends DependentObject {
        readonly owner: TOwner;
        private __eventName;
        private __associations;
        private __listeners;
        /** If a parent value is set, then the event chain will travel the parent hierarchy from this event dispatcher. If not set, the owner is assumed instead. */
        protected __parent: IEventDispatcher<any, EventHandler>;
        private __eventTriggerHandler;
        private __eventPropertyName;
        private __eventPrivatePropertyName;
        private __lastTriggerState;
        private __cancelled;
        private __dispatchInProgress;
        private __handlerCallInProgress;
        /** Return the underlying event name for this event object. */
        getEventName(): string;
        /** If this is true, then any new handler added will automatically be triggered as well.
        * This is handy in cases where an application state is persisted, and future handlers should always execute. */
        autoTrigger: boolean;
        /** Returns true if handlers exist on this event object instance. */
        hasHandlers(): boolean;
        /** If true, then handlers are called only once, then removed (default is false). */
        removeOnTrigger: boolean;
        /** This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters. */
        eventTriggerHandler: EventTriggerHandler<TOwner, TCallback>;
        /** True if the event can be cancelled. */
        canCancel: boolean;
        /**
           * Registers an event with a class type - typically as a static property.
           * @param type A class reference where the static property will be registered.
           * @param eventName The name of the event to register.
           * @param eventMode Specifies the desired event traveling mode.
           * @param removeOnTrigger If true, the event only fires one time, then clears all event handlers. Attaching handlers once an event fires in this state causes them to be called immediately.
           * @param eventTriggerCallback This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
           * @param customEventPropName The name of the property that will be associated with this event, and expected on parent objects
           * for the capturing and bubbling phases.  If left undefined/null, then the default is assumed to be
           * 'on[EventName]', where the first event character is made uppercase automatically.
           * @param canCancel If true (default), this event can be cancelled (prevented from completing, so no other events will fire).
           */
        static registerEvent<TOwner extends object, TCallback extends EventHandler>(type: {
            new (...args: any[]): TOwner;
        }, eventName: string, eventMode?: EventModes, removeOnTrigger?: boolean, eventTriggerCallback?: EventTriggerHandler<TOwner, TCallback>, customEventPropName?: string, canCancel?: boolean): {
            _eventMode: EventModes;
            _eventName: string;
            _removeOnTrigger: boolean;
            eventFuncType: () => IEventDispatcher<TOwner, TCallback>;
            eventPropertyType: IEventDispatcher<TOwner, TCallback>;
        };
        /**
            * Creates an instance property name from a given event name by adding 'on' as a prefix.
            * This is mainly used when registering events as static properties on types.
            * @param {string} eventName The event name to create an event property from. If the given event name already starts with 'on', then the given name is used as is (i.e. 'click' becomes 'onClick').
            */
        static createEventPropertyNameFromEventName(eventName: string): string;
        /**
           * Returns a formatted event name in the form of a private event name like '$__{eventName}Event' (eg. 'click' becomes '$__clickEvent').
           * The private event names are used to store event instances on the owning instances so each instance has it's own handlers list to manage.
           */
        static createPrivateEventName(eventName: string): string;
        dispose(): void;
        /**
         * Associates this event instance with an object using a weak map. The owner of the instance is already associated by default.
         * Use this function to associate other external objects other than the owner, such as DOM elements (there should only be one
         * specific event instance per any object).
         */
        associate(obj: object): this;
        /** Disassociates this event instance from an object (an internal weak map is used for associations). */
        disassociate(obj: object): this;
        /** Returns true if this event instance is already associated with the specified object (a weak map is used). */
        isAssociated(obj: object): boolean;
        _getHandlerIndex(handler: TCallback): number;
        _getHandlerIndex(handler: IDelegate<object, TCallback>): number;
        /** Adds a handler (callback) to this event.
        * Note: The registered owner of the underlying dispatch handler will be used as the context of all attached handlers.
        */
        attach(handler: TCallback, eventMode?: EventModes): this;
        attach(handler: IDelegate<object, TCallback>, eventMode?: EventModes): this;
        /** Dispatch the underlying event. Typically 'dispatch()' is called instead of calling this directly. Returns 'true' if all events completed, and 'false' if any handler cancelled the event.
          * @param {any} triggerState If supplied, the event will not trigger unless the current state is different from the last state.  This is useful in making
          * sure events only trigger once per state.  Pass in null (the default) to always dispatch regardless.  Pass 'undefined' to used the event
          * name as the trigger state (this can be used for a "trigger only once" scenario).
          * @param {boolean} canBubble Set to true to allow the event to bubble (where supported).
          * @param {boolean} canCancel Set to true if handlers can abort the event (false means it has or will occur regardless).
          * @param {string[]} args Custom arguments that will be passed on to the event handlers.
          */
        dispatchEvent(triggerState?: any, ...args: any[]): boolean;
        protected __exception(msg: string, error?: any): Exception;
        /** Calls the event handlers that match the event mode on the current event instance. */
        protected onDispatchEvent(args: any[], mode: EventModes): boolean;
        /** If the given state value is different from the last state value, the internal trigger state value will be updated, and true will be returned.
            * If a state value of null is given, the request will be ignored, and true will always be returned.
            * If you don't specify a value ('triggerState' is 'undefined') then the internal event name becomes the trigger state value (this can be used for a "trigger
            * only once" scenario).  Use 'resetTriggerState()' to reset the internal trigger state when needed.
            */
        setTriggerState(triggerState?: any): boolean;
        /** Resets the current internal trigger state to null. The next call to 'setTriggerState()' will always return true.
            * This is usually called after a sequence of events have completed, in which it is possible for the cycle to repeat.
            */
        resetTriggerState(): void;
        /** A simple way to pass arguments to event handlers using arguments with static typing (calls 'dispatchEvent(null, false, false, arguments)').
        * If not cancelled, then 'true' is returned.
        * TIP: To prevent triggering the same event multiple times, use a custom state value in a call to 'setTriggerState()', and only call
        * 'dispatch()' if true is returned (example: "someEvent.setTriggerState(someState) && someEvent.dispatch(...);", where the call to 'dispatch()'
        * only occurs if true is returned from the previous statement).
        * Note: Call 'dispatchAsync()' to allow current script execution to complete before any handlers get called.
        * @see dispatchAsync
        */
        dispatch(...args: Parameters<TCallback>): boolean;
        /** Trigger this event by calling all the handlers.
         * If a handler cancels the process, then the promise is rejected.
         * This method allows scheduling events to fire after current script execution completes.
         */
        dispatchAsync(...args: Parameters<TCallback>): Promise<void>;
        /** If called within a handler, prevents the other handlers from being called. */
        cancel(): void;
        private __indexOf;
        private __removeListener;
        removeListener(object: Object, func: TCallback): void;
        removeListener(handler: IDelegate<TOwner, TCallback>): void;
        removeAllListeners(): void;
        /** Constructs a new instance of the even dispatcher.
         * @param eventTriggerHandler A global handler per event type that is triggered before any other handlers. This is a hook which is called every time an event triggers.
         * This exists mainly to support handlers called with special parameters, such as those that may need translation, or arguments that need to be injected.
         */
        constructor(owner: TOwner, eventName: string, removeOnTrigger?: boolean, canCancel?: boolean, eventTriggerHandler?: EventTriggerHandler<TOwner, TCallback>);
    }
    interface IEventDispatcher<TOwner extends object, TCallback extends EventHandler> extends EventDispatcher<TOwner, TCallback> {
    }
    interface IPropertyChangingHandler<TSender extends IEventObject> {
        (sender: TSender, newValue: any): boolean;
    }
    interface IPropertyChangedHandler<TSender extends IEventObject> {
        (sender: TSender, oldValue: any): void;
    }
    interface INotifyPropertyChanged<TSender extends IEventObject> {
        /** Triggered when a supported property is about to change.  This does not work for all properties by default, but only those which call 'doPropertyChanging' in their implementation. */
        onPropertyChanging: IEventDispatcher<TSender, IPropertyChangingHandler<TSender>>;
        /** Triggered when a supported property changes.  This does not work for all properties by default, but only those which call 'doPropertyChanged' in their implementation. */
        onPropertyChanged: IEventDispatcher<TSender, IPropertyChangedHandler<TSender>>;
        /** Call this if you wish to implement change events for supported properties. */
        doPropertyChanging(name: string, newValue: any): boolean;
        /** Call this if you wish to implement change events for supported properties. */
        doPropertyChanged(name: string, oldValue: any): void;
    }
    class EventObject implements INotifyPropertyChanged<IEventObject> {
        /** Triggered when a supported property is about to change.  This does not work for all properties by default, but only those
         * which call 'doPropertyChanging' in their implementation.
         */
        onPropertyChanging: IEventDispatcher<IEventObject, IPropertyChangingHandler<IEventObject>>;
        /** Triggered when a supported property changes.  This does not work for all properties by default, but only those
          * which call 'doPropertyChanged' in their implementation.
          */
        onPropertyChanged: IEventDispatcher<IEventObject, IPropertyChangedHandler<IEventObject>>;
        /** Call this if you wish to implement 'changing' events for supported properties.
        * If any event handler cancels the event, then 'false' will be returned.
        */
        doPropertyChanging(name: string, newValue: any): boolean;
        /** Call this if you wish to implement 'changed' events for supported properties. */
        doPropertyChanged(name: string, oldValue: any): void;
    }
    interface IEventObject extends EventObject {
    }
}
declare namespace DS {
    interface ISavedFileVersion extends ISavedTrackableObject {
        "filename": string;
        "originalFilename": string;
        "file": string;
        "originalFile": string;
        "version": number;
        "replacedOn": string;
    }
    class FileVersion extends TrackableObject {
        #private;
        readonly versionManager: VersionManager;
        readonly originalFile: VirtualFileSystem.Abstracts.File;
        readonly file: VirtualFileSystem.Abstracts.File;
        readonly replacedOn: Date;
        /** The absolute file name under which the associated file is saved under. If not specified, then a GUID value will be generated
         * and used automatically.
         */
        readonly _fileID: string;
        /** The original file name if changed, since replaced files may have the ISO UTC date-time stamp appended. */
        readonly _originalFileID: string;
        get filename(): string;
        /** Returns true if this version is the current version.  Current versions remain in their proper locations and do not
         * exist in the 'versions' repository.
         */
        get isCurrent(): boolean;
        /** The version of this persistable instance. If a version number is set, then it will be added to the file name.
         * If not set (the default), then versioning will not be used. Any value set that is less than 1 will be push up to 1 as the
         * starting value during the save process.
         */
        get version(): number;
        set version(v: number);
        /** An optional description for this version. */
        _versionDescription?: string;
        get versionedFileName(): string;
        constructor(versionManager: VersionManager, originalFile: VirtualFileSystem.Abstracts.File);
        /** Saves the versioning details to an object. If no object is specified, then a new empty object is created and returned. */
        saveConfigToObject<T extends ISavedPersistableObject>(target?: T & ISavedFileVersion): T & ISavedFileVersion;
        /** Loads data from a given object.
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incomming config file.
         */
        loadConfigFromObject(source?: ISavedFileVersion, replace?: boolean): this;
        /** The given file will replace the current file, sending the current file into the 'versions' repository.
         * Note that you can only version a non-versioned file ('isCurrent==true'), otherwise an error will be thrown.
         */
        replaceWith(newfile: VirtualFileSystem.Abstracts.File): Promise<FileVersion>;
    }
    /** Manages lists of file versions.
     * This object acts like a trash bin by assigning a version counter and date/time to a file in the virtual file system.
     */
    class VersionManager extends PersistableObject {
        static current: VersionManager;
        static versionsBasePath: string;
        readonly versions: FileVersion[];
        readonly _fs: VirtualFileSystem.FileManager;
        private _fileToVersionMap;
        constructor(fs?: VirtualFileSystem.FileManager);
        /** Gets a file version given either a file object reference or GUID.
         * If no version exists then 'undefined' is returned.
         */
        getVersion(file: VirtualFileSystem.Abstracts.File | string): FileVersion;
        /** Adds a file to the version control system, if not already added.
         * If the file is already versioned then the version entry is returned.
         * The file is not moved from its current location.
         */
        add(file: VirtualFileSystem.Abstracts.File): FileVersion;
        /** Adds two files to the version control system, if not already added, then replaces the current file with the new file.
         * The file is replaced by moving the file into the versions repository under a special version name, and moving the new
         * file into the place of the current file.
         */
        replace(currentfile: VirtualFileSystem.Abstracts.File, newfile: VirtualFileSystem.Abstracts.File): Promise<FileVersion>;
    }
}
declare namespace DS {
    namespace Abstracts {
        /** A page holds the UI design, which is basically just a single HTML page template. */
        abstract class Page extends TrackableObject implements IResourceSource {
            abstract getResourceValue(): Promise<any>;
            abstract getResourceType(): ResourceTypes;
        }
    }
}
declare namespace DS {
    class Property extends TrackableObject {
        name: string;
        type: string;
    }
}
declare namespace DS {
    /** Implemented by objects that can be assigned to a resource entry.  This allows such objects to support being added as a resource. */
    interface IResourceSource extends Pick<TrackableObject, '_id' | '_objectType'> {
        /** Returns the underlying value for a resource supported object. */
        getResourceValue(): Promise<any>;
        getResourceType(): ResourceTypes;
    }
    /** Maps a single resource to some URL path, such as a static 'File' object, or even a 'Project' reference - basically,
     * anything that implements 'IResourceSource', such as objects that inherit from 'TrackableObject'.
     * Projects define resources specific to them, but other projects can also reference them, creating a dependency.
     * All resources have a globally unique ID (GUID), but not all resources may have unique paths. Multiple resources can exist
     * on a single route. If so, the first one found is returned to the client; however, console/debug warnings may be given.
     */
    class Resource extends TrackableObject {
        path: string;
        get resourceID(): string;
        set resourceID(id: string);
        private _resourceID;
        get resource(): IResourceSource;
        set resource(res: IResourceSource);
        private _resource;
        get type(): ResourceTypes;
        set type(type: ResourceTypes);
        private _type;
        isMatch(urlPath: string): boolean;
        getValue(): Promise<any>;
    }
}
declare namespace DS {
    enum UserRoles {
        /** The user has no access. */
        None = 0,
        /** The user has full access as administrator. */
        Admin = 1,
        /** The user has read access. */
        Viewer = 2,
        /** The user is allowed to make modifications. Implies read access, but does not include creation access. */
        Editor = 3,
        /** The user can create and modify. */
        Creator = 4,
        /** The user can delete/remove. */
        Purger = 5
    }
    class UserAccessEntry {
        userID: string;
        roles: UserRoles[];
        constructor(userID: string, roles: UserRoles[]);
        /** Returns true if the specified role exists in this access entry. */
        hasRole(role: UserRoles): boolean;
    }
    class UserAccess {
        private _userIDs;
        get length(): number;
        /** Assigns a user ID and one or more roles. If roles already exist, the given roles are merged (existing roles are note replaced). */
        add(userID: string, ...roles: UserRoles[]): UserAccessEntry;
        /** Removes a user's access. */
        revoke(index: number): boolean;
        /** Removes a user's access. */
        revoke(id: string): boolean;
        /** Finds the index of the entry with the specific user ID. */
        indexOf(userID: string): number;
        /** Gets a user access entry using an index. */
        getItem(index: number): UserAccessEntry;
        /** Gets a user access entry using the user ID. */
        getItem(userID: string): UserAccessEntry;
    }
}
declare namespace DS {
    /** Represents a single selected item. */
    class SelectedItem {
        /** The item that was selected. */
        item: any;
        /** The type of item selected. */
        type: string;
    }
    /** Represents one or more selected items. */
    class Selection {
        /** One or more selected items. */
        readonly selections: SelectedItem[];
    }
}
declare namespace DS {
    enum DeploymentEnvironments {
        Sandbox = 0,
        Development = 1,
        QA = 2,
        Staging = 3,
        Production = 4
    }
    type DeploymentEnvironmentsType = {
        [P in DeploymentEnvironments]: string;
    };
    /** A page holds the UI design, which is basically just a single HTML page template. */
    class Site {
        /** A title for the website. */
        title: string;
        url: DeploymentEnvironmentsType;
        /** One or more page templates that belong to the site. This is empty for API-only sites. */
        readonly pages: Abstracts.Page[];
    }
}
declare namespace DS {
    /** The current user of the FlowScript system.
     * The user 'id' (a GUID) is used as the root directory for projects.
     */
    class User extends TrackableObject {
        email: string;
        firstname?: string;
        lastname?: string;
        /** Returns the current user object. */
        static get current(): User;
        /** Triggered when the current user is about to change.  If any handler returns false then the request is cancelled (such as if the current project is not saved yet). */
        static readonly onCurrentUserChanging: EventDispatcher<typeof User, (oldUser: User, newUser: User) => boolean>;
        /** Triggered when the current user has changed. This event cannot be cancelled - use the 'onCurrentUserChanging' event for that. */
        static readonly onCurrentUserChanged: EventDispatcher<typeof User, (oldUser: User, newUser: User) => void>;
        /** Starts the process of changing the current user. */
        static changeCurrentUser(user: User): Promise<void>;
        /** Holds a mapping of this user ID to global roles associated with the user. */
        readonly _security: UserAccess;
        /** A solution with ALL projects owned by this user.
         * Note: A solution defines what projects a user has access to, but does not automatically load all projects.
         */
        solution: Abstracts.Solution;
        constructor(email: string, firstname?: string, lastname?: string);
    }
}
declare namespace DS {
    class ValueMap {
        sourcePath: string;
        inputName: string;
    }
    /** Defines a branch by name, which determines the next step to execute. */
    class Branch extends TrackableObject {
        name: string;
        step: Step;
    }
    /** References a component and defines translations between previous step's outputs and the next step. */
    class Step extends TrackableObject {
        /** A name for this step. This is also used to resolve property references from other steps. */
        name: string;
        /** The component for this step. */
        component: Component;
        /** If true, the step is executed server-side. The default is client-side. */
        serverSide: boolean;
        /** Maps the outputs of the previous step component's outputs to the inputs of the current component. */
        readonly inputMapping: ValueMap[];
        /** Defines named branches. */
        readonly branches: Branch[];
    }
    interface ISavedWorkflow extends ISavedTrackableObject {
        name: string;
        description?: string;
        steps?: any[];
    }
    /** A series of steps that will execute associated components in order. */
    class Workflow extends TrackableObject {
        readonly steps: Step[];
        execute(): Promise<void>;
    }
    /** One or more "swim-lanes", from top to bottom (in order of sequence), that contain a series of components to execute. */
    class Workflows extends TrackableObject {
        readonly workflows: Workflow[];
    }
}
//# sourceMappingURL=api.d.ts.map