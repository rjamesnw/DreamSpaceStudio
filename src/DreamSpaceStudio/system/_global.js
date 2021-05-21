// ###########################################################################################################################
// These are functions for bootstrapping the core system.  It helps to set up common types and functions that will be needed,
// such as DS.init() to execute callbacks to finalize to loading process (must be called by the end user).
// ###########################################################################################################################
if (!Array.prototype.remove) // Primarily to help support conversions from C# - also, this should exist anyhow!
    Array.prototype.remove = function (item) {
        var i = this.indexOf(this);
        return i > -1 ? (this.splice(i, 1), true) : false;
    };
if (!Array.prototype.removeAt) // Primarily to help support conversions from C# - also, this should exist anyhow!
    Array.prototype.removeAt = function (index) {
        return index >= 0 && index < this.length ? (this.splice(index, 1), true) : false;
    };
if (!Array.prototype.max) // Primarily to help support conversions from C# - also, this should exist anyhow!
    Array.prototype.max = function (predicate) {
        var maxValue = void 0, lastIndex = -1;
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
if (!Array.prototype.last) // Primarily to help support conversions from C# - also, this should exist anyhow!
    Array.prototype.last = function () {
        return this.length > 0 ? this[this.length - 1] : void 0;
    };
if (!String.prototype.trimLeftChar)
    String.prototype.trimLeftChar = function (char) {
        var s = this;
        while (s.length && s[0] === char)
            s = s.substr(1);
        return s;
    };
if (!String.prototype.trimRightChar)
    String.prototype.trimRightChar = function (char) {
        var s = this;
        while (s.length && s[s.length - 1] === char)
            s = s.substr(0, this.length - 1);
        return s;
    };
if (!String.prototype.startsWith)
    String.prototype.startsWith = function (str) {
        if (str === void 0 || str === null)
            return false;
        if (typeof str != 'string')
            str = '' + str;
        return this.substr(0, str.length) === str;
    };
if (!String.prototype.endsWith)
    String.prototype.endsWith = function (str) {
        if (str === void 0 || str === null)
            return false;
        if (typeof str != 'string')
            str = '' + str;
        return this.substr(-str.length) === str;
    };
var AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
var isNode = typeof global == 'object' && !!global.process && !!global.process.versions && !!global.process.versions.node;
/** The default global namespace name if no name is specified when calling 'registerGlobal()'.
 * To get the actual registered name, see the global property 'DreamSpace.globalNamespaceName' exported from this module.
 * Note: A symbol is not used, since callbacks placed into API URLs must be strings. Instead, a static pre-generated GUID is appended.
 */
const DEFAULT_GLOBAL_NS_NAME = "$__DREAMSPACE_GLBOALS_A756B156811A44E59329E44CAA6AFA98"; // (A static GUID is appended)
var USER_GIVEN_GLOBAL_NS_NAME;
/** This is a global object used by all other modules in the system for sharing and updating global states. It is registered on the global
 * scope by calling 'registerGlobal(uniqueGlobalVarName)', which uses the NAME+GUID constant value stored in the exported
 * 'DEFAULT_ROOT_NS_NAME' by default.
 */
var DS;
(function (DS) {
    Object.defineProperty(DS, "globalNamespaceName", { configurable: false, enumerable: true, get: () => { return USER_GIVEN_GLOBAL_NS_NAME || DEFAULT_GLOBAL_NS_NAME; } });
    Object.defineProperty(DS, "rootns", { configurable: false, enumerable: true, get: () => { return DS.global[DS.globalNamespaceName]; } });
    /** The platform-specific end of line character.
     *  For browsers, the internet standard is \r\n.
     *  For NodeJS on Windows, the standard is \r\n.
     *  For NodeJS on all others this defaults to \n.
     */
    DS.EOL = "\r\n"; // The internet standard.  The server side code will update this to the platform standard.
    /**
     * The root namespace for the DreamSpace system.
     */
    // ------------------------------------------------------------------------------------------------------------------------
    /** The current version of the DreamSpace system. */
    DS.version = "0.0.1";
    Object.defineProperty(DS, "version", { writable: false });
    /** Returns the current user defined application version, or a default version. */
    DS.getAppVersion = () => DS.appVersion || "0.0.0";
    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< DreamSpace Client OS - v" + DS.version + " >=- ");
        else
            console.log("%c -=< %cDreamSpace Client OS - v" + DS.version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");
    // ------------------------------------------------------------------------------------------------------------------------
    DS.staticConstructor = Symbol("static constructor");
    // ------------------------------------------------------------------------------------------------------------------------
    // ===========================================================================================================================
    // Setup some preliminary settings before the core scope, including the "safe" and "global" 'eval()' functions.
    // =======================================================================================================================
    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'DreamSpace.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    function noop(...args) { }
    DS.noop = noop;
    /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to keep 'var' declarations, etc., within a function scope.
      * Note: By default, parameter indexes 0-9 are automatically assigned to parameter identifiers 'p0' through 'p9' for easy reference.
      */
    function safeEval(x, ...args) {
        var params = [], paramStr = "";
        if (args.length) {
            for (var i = 0; i <= 9 && i < args.length; ++i)
                params.push("p" + i + " = args[" + i + "]");
            paramStr = "var " + params.join(', ') + ";\r\n";
        }
        return eval(paramStr + x);
    }
    DS.safeEval = safeEval;
    ;
    // (note: this allows executing 'eval' outside the private DreamSpace scope, but still within a function scope to prevent polluting the global scope,
    //  and also allows passing arguments scoped only to the request).
    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
      */
    function globalEval(x) { return (0, eval)(x); }
    DS.globalEval = globalEval;
    ;
    // (note: indirect 'eval' calls are always globally scoped; see more: http://perfectionkills.com/global-eval-what-are-the-options/#windoweval)
    let Environments;
    (function (Environments) {
        /** Represents the DreamSpace client core environment. */
        Environments[Environments["Browser"] = 0] = "Browser";
        /** Represents the DreamSpace worker environment (where applications and certain modules reside). */
        Environments[Environments["Worker"] = 1] = "Worker";
        /** Represents the DreamSpace server environment. */
        Environments[Environments["Server"] = 2] = "Server";
    })(Environments = DS.Environments || (DS.Environments = {}));
    // ------------------------------------------------------------------------------------------------------------------------
    let DebugModes;
    (function (DebugModes) {
        /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
        DebugModes[DebugModes["Release"] = 0] = "Release";
        /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
        DebugModes[DebugModes["Debug_Run"] = 1] = "Debug_Run";
        /**
          * Run in debug mode, which loads all un-minified scripts, but does NOT boot the system nor run the application automatically.
          * To manually start the DreamSpace system boot process, call 'DreamSpace.Loader.bootstrap()'.
          * Once the boot process completes, the application will not start automatically. To start the application process, call 'DreamSpace.Scripts.runApp()".
          */
        DebugModes[DebugModes["Debug_Wait"] = 2] = "Debug_Wait";
    })(DebugModes = DS.DebugModes || (DS.DebugModes = {}));
    /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values. The default is 'Debug_Run'. */
    DS.debugMode = typeof DS.debugMode != 'number' ? DebugModes.Debug_Run : DS.debugMode;
    /** Returns true if DreamSpace is running in debug mode. */
    function isDebugging() { return DS.debugMode != DebugModes.Release; }
    DS.isDebugging = isDebugging;
    // ========================================================================================================================================
    /** Set to true if ES2015+ (aka ES6+) is supported in the browser environment ('class', 'new.target', etc.). */
    DS.ES6 = (() => { try {
        return globalEval("(function () { return new.target; }, true)");
    }
    catch (e) {
        return false;
    } })();
    /** Set to true if ES2015+ (aka ES6+ - i.e. 'class', 'new.target', etc.) was targeted when this DreamSpace JS code was transpiled. */
    DS.ES6Targeted = (() => {
        return (class {
        }).toString() == "class { }"; // (if targeting ES6 in the configuration, 'class' will be output as a function instead)
    })();
    // =======================================================================================================================
    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string).
     * Note: Strings with only whitespace are considered empty as well.
     */
    function isEmpty(obj) {
        if (obj === void 0 || obj === null)
            return true;
        // (note 'DontEnum flag' enumeration bug in IE<9 [on toString, valueOf, etc.])
        if (typeof obj == 'string')
            return !obj || !obj.trim();
        if (Array.isArray(obj))
            return !obj.length;
        if (typeof obj != 'object')
            return isNaN(obj);
        for (var key in obj)
            if (DS.global.Object.prototype.hasOwnProperty.call(obj, key))
                return false;
        return true;
    }
    DS.isEmpty = isEmpty;
    /** Returns true if the given value is null or undefined.
     * Note: In NodeJS you can use the native 'isNullOrUndefined()' function instead.
     */
    function isNullOrUndefined(value) { return value === void 0 || value === null; }
    DS.isNullOrUndefined = isNullOrUndefined;
    /** Null or undefined to default. Returns the given value if it is NOT undefined or null, otherwise the default value is returned.
     * @description Side-note: Name was inspired from the VBA function 'NZ()' (Null to Zero; see https://support.office.com/en-us/article/Nz-Function-8ef85549-cc9c-438b-860a-7fd9f4c69b6c).
     * @param value Value to check.
     * @param defaultVal New value if "value" is undefined or null.
     */
    function nud(value, defaultVal) { return value === void 0 || value === null ? defaultVal : value; }
    DS.nud = nud;
    // ========================================================================================================================================
    /**
     * Returns true if the URL contains the specific action and controller names at the end of the URL path.
     * This of course assumes typical routing patterns in the format '/controller/action' or '/area/controller/action'.
     */
    function isPage(action, controller = "home", area = "") {
        var regexStr = "\/" + action + "(?:\/?[?&#]|$)";
        if (controller)
            regexStr = "\/" + controller + regexStr;
        if (area)
            regexStr = "\/" + area + regexStr;
        return new RegExp(regexStr, "gi").test(location.pathname);
    }
    DS.isPage = isPage;
    // ========================================================================================================================================
    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    let Time;
    (function (Time) {
        // =======================================================================================================================
        Time.__millisecondsPerSecond = 1000;
        Time.__secondsPerMinute = 60;
        Time.__minsPerHour = 60;
        Time.__hoursPerDay = 24;
        Time.__daysPerYear = 365;
        Time.__actualDaysPerYear = 365.2425;
        Time.__EpochYear = 1970;
        Time.__millisecondsPerMinute = Time.__secondsPerMinute * Time.__millisecondsPerSecond;
        Time.__millisecondsPerHour = Time.__minsPerHour * Time.__millisecondsPerMinute;
        Time.__millisecondsPerDay = Time.__hoursPerDay * Time.__millisecondsPerHour;
        Time.__millisecondsPerYear = Time.__daysPerYear * Time.__millisecondsPerDay;
        Time.__ISO8601RegEx = /^\d{4}-\d\d-\d\d(?:[Tt]\d\d:\d\d(?::\d\d(?:\.\d+?(?:[+-]\d\d?(?::\d\d(?::\d\d(?:.\d+)?)?)?)?)?)?[Zz]?)?$/;
        Time.__SQLDateTimeRegEx = /^\d{4}-\d\d-\d\d(?: \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?)?$/; // (Standard SQL Date/Time Format)
        Time.__SQLDateTimeStrictRegEx = /^\d{4}-\d\d-\d\d \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?$/; // (Standard SQL Date/Time Format)
        /** The time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        Time.__localTimeZoneOffset = (new Date()).getTimezoneOffset() * Time.__millisecondsPerMinute; // ('getTimezoneOffset()' returns minutes, which is converted to ms for '__localTimeZoneOffset')
    })(Time = DS.Time || (DS.Time = {}));
    // ========================================================================================================================
    //var $ICE: IHostBridge_ICE = null;
    // TODO: $ICE loads as a module, and should do this differently.
    //??else
    //??    $ICE = <IHostBridge_ICE>host;
    // ========================================================================================================================
    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    DS.global = typeof globalThis != 'undefined' ? globalThis : (function () { }.constructor("return this || global"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])
    // ========================================================================================================================
    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
    * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
    * 'Environments.Worker'.
    * The core of DreamSpace runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
    * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
    * For scripts running on the serve side, this will be set to 'Environments.Server'.
    */
    DS.Environment = (function () {
        if (typeof navigator !== 'object') {
            // On the server side, create a basic "shell" to maintain some compatibility with some system functions.
            DS.global.window = {
                document: { title: "SERVER" }
            };
            DS.global.navigator = { userAgent: "Mozilla/5.0 (DreamSpace) like Gecko" };
            DS.global.location = {
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
        }
        else if (typeof window == 'object' && window.document)
            return Environments.Browser;
        else
            return Environments.Worker;
    })();
    // ========================================================================================================================
    // ========================================================================================================================
    var __onInitCallbacks = [];
    /** Used internally to add callbacks to finalize the boot-up process. Functions added using this will be called when the end user calls DreamSpace.init(); */
    function __onInit(callback) {
        if (typeof callback == 'function')
            if (__onInitCallbacks)
                __onInitCallbacks.push(callback);
            else {
                (console.warn || console.log)("__onInit(callback) warning: called AFTER system is already initialized; callback was: " + callback, callback);
                callback(); // (system already initialized; just execute this now [just in case])
            }
    }
    DS.__onInit = __onInit;
    var initCalled;
    /** Initialize the DreamSpace system. This MUST be called before the system can be used.
     * NOTE: This is an ASYNC operation.  This allows any dynamic modules and/or files to
     * complete loading before the system is officially ready to be used.
     * Example usage: "await init();" or "init().then(()=>{...});"
     */
    async function init() {
        return new Promise(async (initCompleted) => {
            if (initCalled)
                throw "DreamSpace.init() can only be called once.";
            initCalled = true;
            var cbs = __onInitCallbacks;
            for (var i = 0, n = cbs.length; i < n; ++i)
                await (cbs[i]() || Promise.resolve());
            __onInitCallbacks = null; // (make sure init() is not called again)
            DS.log("DreamSpace.init()", "Initialized and ready.");
            initCompleted();
        });
    }
    DS.init = init;
    __onInit(() => {
        // ====================================================================================================================
        // *** At this point the core type system, error handling, and console-based logging are now available. ***
        // ====================================================================================================================
        DS.log("DreamSpace", "Initializing the DreamSpace system ...");
        DS.baseURL = DS.Path.fix(DS.global.siteBaseURL || DS.baseURL || location.origin); // (example: "https://calendar.google.com/")
        DS.baseScriptsURL = DS.global.scriptsBaseURL ? DS.Path.fix(DS.global.scriptsBaseURL || DS.baseScriptsURL) : DS.baseURL + "js/";
        DS.baseCSSURL = DS.global.cssBaseURL ? DS.Path.fix(DS.global.cssBaseURL || DS.baseCSSURL) : DS.baseURL + "css/";
        DS.log("DreamSpace.baseURL", DS.baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using DreamSpace.JS for .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
        DS.log("DreamSpace.baseScriptsURL", DS.baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");
        if (DS.global.serverWebRoot)
            DS.log("DreamSpace.serverWebRoot", DS.global.serverWebRoot + " (typically set server side within the layout view only while debugging to help resolve script source maps)");
        DS.log("DreamSpace", "Core system loaded.");
        // ====================================================================================================================
    });
    // ========================================================================================================================
    /** Returns true if the given type (function) represents a primitive JavaScript type constructor. */
    function isPrimitiveType(o) {
        var symbol = typeof Symbol != 'undefined' ? Symbol : DS.global.Object; // (not supported in IE11)
        return (o == DS.global.Object || o == Array || o == Boolean || o == String
            || o == Number || o == symbol || o == Function || o == Date
            || o == RegExp || o == Error);
    }
    DS.isPrimitiveType = isPrimitiveType;
    // ========================================================================================================================
    /** Registers this global module in the global scope. The global 'DS' namespace is returned, if needed.
     * This helps to support:
     * 1. A single object to store global DreamSpace states, such as the host application version, base paths, etc.
     * 2. A global object to store callback functions for API initialization, such as Google Maps, etc.
     * @param uniqueGlobalVarName The global name to use.  By default this is the constant 'DEFAULT_ROOT_NS_NAME', which uses a NAME + GUID to guarantee no collisions.
     */
    function registerGlobal(uniqueGlobalVarName) {
        if (uniqueGlobalVarName)
            USER_GIVEN_GLOBAL_NS_NAME = uniqueGlobalVarName;
        Object.defineProperty(DS.global, DS.globalNamespaceName, { enumerable: false, writable: false, configurable: false, value: DS });
        // (this locked down, as global paths might be used by APIs after future initialization)
        return DS;
    }
    DS.registerGlobal = registerGlobal;
    function sealed(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.seal(target);
        if (typeof target.prototype == 'object')
            Object.seal(target.prototype);
        return target;
    }
    DS.sealed = sealed;
    function frozen(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.freeze(target);
        if (typeof target.prototype == 'object')
            Object.freeze(target.prototype);
        return target;
    }
    DS.frozen = frozen;
    // =======================================================================================================================
    // Function Parameter Dependency Injection Support
    // TODO: Consider DI support at some point.
    /**
     * A decorator used to add DI information for a function parameter.
     * @param args A list of items which are either fully qualified type names, or references to the type functions.
     * The order specified is important.  A new (transient) or existing (singleton) instance of the first matching type found is returned.
     */
    function $(...args) {
        return function (target, paramName, index) {
            var _target = target;
            _target.$__argumentTypes[index] = args;
        };
    }
    DS.$ = $;
    // =======================================================================================================================
    /** Must be used to load a module before it can be used.
     * This call returns a reference to the loaded module.
     * See 'modules$()' for loading multiple modules. */
    async function module(ns) { return ns instanceof Promise ? await ns : ns; }
    DS.module = module;
    /** Can be used to load multiple modules. You can also use 'module()' to load and return a single module. */
    async function modules(...ns) { for (var i = 0, n = ns.length; i < n; ++i)
        await module(ns[i]); }
    DS.modules = modules;
    /** Must be used to load a type before it can be used. */
    DS.type = module;
    /** Can be used to load multiple types. You can also use 'type()' to load and return a single type. */
    DS.types = modules;
    // =======================================================================================================================
})(DS || (DS = {}));
if (isNode && exports)
    eval("exports.DS = DS;"); // (when require('api') is used we need to export the DS namespace, which will contain the whole DS global API)
// ###########################################################################################################################
//# sourceMappingURL=_global.js.map