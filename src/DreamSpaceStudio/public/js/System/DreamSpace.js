// ###########################################################################################################################
// These are functions for bootstrapping the core system module load process.  It helps to set up types and functions that will
// be needed, such as DreamSpace.init() to execute callbacks to finalize to loading process (must be called by the end user).
// ###########################################################################################################################
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** The default global namespace name if no name is specified when calling 'registerGlobal()'.
     * To get the actual registered name, see the global property 'DreamSpace.globalNamespaceName' exported from this module.
     * Note: A symbol is not used, since callbacks placed into API URLs must be strings. Instead, a static pre-generated GUID is appended.
     */
    exports.DEFAULT_GLOBAL_NS_NAME = "$__DREAMSPACE_GLBOALS_A756B156811A44E59329E44CAA6AFA98"; // (A static GUID is appended)
    var USER_GIVEN_GLOBAL_NS_NAME;
    class DreamSpace {
        /** The global DreamSpace namespace name.  Call 'registerGlobal()' to specify a custom name, otherwise the default 'DEFAULT_GLOBAL_NS_NAME' is used. */
        static get globalNamespaceName() { return USER_GIVEN_GLOBAL_NS_NAME || exports.DEFAULT_GLOBAL_NS_NAME; }
        /** The root DreamSpace namespace, which is just DreamSpace.global[DreamSpace.globalNamespaceName] (which is just 'window[DreamSpace.globalNamespaceName]' on browser clients). */
        static get rootns() { return this.global[DreamSpace.globalNamespaceName]; }
    }
    exports.DreamSpace = DreamSpace;
    /** This is a global object used by all other modules in the system for sharing and updating global states. It is registered on the global
     * scope by calling 'registerGlobal(uniqueGlobalVarName)', which uses the NAME+GUID constant value stored in the exported
     * 'DEFAULT_ROOT_NS_NAME' by default.
     */
    (function (DreamSpace) {
        /**
         * The root namespace for the DreamSpace system.
         */
        // ------------------------------------------------------------------------------------------------------------------------
        /** The current version of the DreamSpace system. */
        DreamSpace.version = "0.0.1";
        Object.defineProperty(DreamSpace, "version", { writable: false });
        /** Returns the current user defined application version, or a default version. */
        DreamSpace.getAppVersion = () => DreamSpace.appVersion || "0.0.0";
        if (typeof navigator != 'undefined' && typeof console != 'undefined')
            if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
                console.log("-=< DreamSpace Client OS - v" + DreamSpace.version + " >=- ");
            else
                console.log("%c -=< %cDreamSpace Client OS - v" + DreamSpace.version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");
        // ------------------------------------------------------------------------------------------------------------------------
        DreamSpace.constructor = Symbol("static constructor");
        // ------------------------------------------------------------------------------------------------------------------------
        // ===========================================================================================================================
        // Setup some preliminary settings before the core scope, including the "safe" and "global" 'eval()' functions.
        // =======================================================================================================================
        /** A simple function that does nothing (no operation).
        * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
        * or when replacing the 'DreamSpace.Loader.bootstrap()' function, which should only ever need to be called once.
        */
        function noop(...args) { }
        DreamSpace.noop = noop;
        /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
          * private/protected variables wrapped in closures. Use this to keep 'var' declarations, etc., within a function scope.
          * Note: By default, parameter indexes 0-9 are automatically assigned to parameter identifiers 'p0' through 'p9' for easy reference.
          */
        function safeEval(x, ...args) {
            var params = [];
            for (var i = 0; i <= 9 && i < args.length; ++i)
                params.push("p" + i + " = args[" + i + "]");
            return eval("var " + params.join(', ') + ";\r\n" + x);
        }
        DreamSpace.safeEval = safeEval;
        ;
        // (note: this allows executing 'eval' outside the private DreamSpace scope, but still within a function scope to prevent polluting the global scope,
        //  and also allows passing arguments scoped only to the request).
        /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
          * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
          */
        function globalEval(x) { return (0, eval)(x); }
        DreamSpace.globalEval = globalEval;
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
        })(Environments = DreamSpace.Environments || (DreamSpace.Environments = {}));
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
        })(DebugModes = DreamSpace.DebugModes || (DreamSpace.DebugModes = {}));
        /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values. The default is 'Debug_Run'. */
        DreamSpace.debugMode = typeof DreamSpace.debugMode != 'number' ? DebugModes.Debug_Run : DreamSpace.debugMode;
        /** Returns true if DreamSpace is running in debug mode. */
        function isDebugging() { return DreamSpace.debugMode != DebugModes.Release; }
        DreamSpace.isDebugging = isDebugging;
        // ========================================================================================================================================
        /** Set to true if ES2015+ (aka ES6+) is supported in the browser environment ('class', 'new.target', etc.). */
        DreamSpace.ES6 = (() => { try {
            return globalEval("(function () { return new.target; }, true)");
        }
        catch (e) {
            return false;
        } })();
        /** Set to true if ES2015+ (aka ES6+ - i.e. 'class', 'new.target', etc.) was targeted when this DreamSpace JS code was transpiled. */
        DreamSpace.ES6Targeted = (() => {
            return (class {
            }).toString() == "class { }"; // (if targeting ES6 in the configuration, 'class' will be output as a function instead)
        })();
        // =======================================================================================================================
        /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
        function isEmpty(obj) {
            if (obj === void 0 || obj === null)
                return true;
            // (note 'DontEnum flag' enumeration bug in IE<9 [on toString, valueOf, etc.])
            if (typeof obj == 'string' || Array.isArray(obj))
                return !obj.length;
            if (typeof obj != 'object')
                return isNaN(obj);
            for (var key in obj)
                if (DreamSpace.global.Object.prototype.hasOwnProperty.call(obj, key))
                    return false;
            return true;
        }
        DreamSpace.isEmpty = isEmpty;
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
        DreamSpace.isPage = isPage;
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
        })(Time = DreamSpace.Time || (DreamSpace.Time = {}));
        // ========================================================================================================================
        //var $ICE: IHostBridge_ICE = null;
        // TODO: $ICE loads as a module, and should do this differently.
        //??else
        //??    $ICE = <IHostBridge_ICE>host;
        // ========================================================================================================================
        /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
        * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
        */
        DreamSpace.global = (function () { }.constructor("return this || global"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])
        // ========================================================================================================================
        /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
        * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
        * 'Environments.Worker'.
        * The core of DreamSpace runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
        * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
        * For scripts running on the serve side, this will be set to 'Environments.Server'.
        */
        DreamSpace.Environment = (function () {
            if (typeof navigator !== 'object') {
                // On the server side, create a basic "shell" to maintain some compatibility with some system functions.
                DreamSpace.global.window = {
                    document: { title: "SERVER" }
                };
                DreamSpace.global.navigator = { userAgent: "Mozilla/5.0 (DreamSpace) like Gecko" };
                DreamSpace.global.location = {
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
        DreamSpace.__onInit = __onInit;
        var initCalled;
        /** Initialize the DreamSpace system. This MUST be called before the system can be used.
         * NOTE: This is an ASYNC operation.  This allows any dynamic modules and/or files to
         * complete loading before the system is officially ready to be used.
         * Example usage: "await init();" or "init().then(()=>{...});"
         */
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((initCompleted) => __awaiter(this, void 0, void 0, function* () {
                    if (initCalled)
                        throw "DreamSpace.init() can only be called once.";
                    initCalled = true;
                    var cbs = __onInitCallbacks;
                    for (var i = 0, n = cbs.length; i < n; ++i)
                        yield (cbs[i]() || Promise.resolve());
                    __onInitCallbacks = null; // (make sure init() is not called again)
                    (yield new Promise((resolve_1, reject_1) => { require(["./Logging"], resolve_1, reject_1); })).log("DreamSpace.init()", "Initialized and ready.");
                    initCompleted();
                }));
            });
        }
        DreamSpace.init = init;
        __onInit(() => __awaiter(this, void 0, void 0, function* () {
            var logging = yield new Promise((resolve_2, reject_2) => { require(["./Logging"], resolve_2, reject_2); });
            var path = yield new Promise((resolve_3, reject_3) => { require(["./Path"], resolve_3, reject_3); });
            var log = logging.log, Path = path.Path;
            // ========================================================================================================================================
            // *** At this point the core type system, error handling, and console-based logging are now available. ***
            // ========================================================================================================================================
            log("DreamSpace", "Initializing the DreamSpace system ...");
            DreamSpace.baseURL = Path.fix(DreamSpace.global.siteBaseURL || DreamSpace.baseURL || location.origin); // (example: "https://calendar.google.com/")
            DreamSpace.baseScriptsURL = DreamSpace.global.scriptsBaseURL ? Path.fix(DreamSpace.global.scriptsBaseURL || DreamSpace.baseScriptsURL) : DreamSpace.baseURL + "js/";
            DreamSpace.baseCSSURL = DreamSpace.global.cssBaseURL ? Path.fix(DreamSpace.global.cssBaseURL || DreamSpace.baseCSSURL) : DreamSpace.baseURL + "css/";
            log("DreamSpace.baseURL", DreamSpace.baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using DreamSpace.JS for .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
            log("DreamSpace.baseScriptsURL", DreamSpace.baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");
            if (DreamSpace.global.serverWebRoot)
                log("DreamSpace.serverWebRoot", DreamSpace.global.serverWebRoot + " (typically set server side within the layout view only while debugging to help resolve script source maps)");
            log("DreamSpace", "Core system loaded.");
            // ========================================================================================================================================
        }));
    })(DreamSpace = exports.DreamSpace || (exports.DreamSpace = {}));
    function sealed(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.seal(target);
        if (typeof target.prototype == 'object')
            Object.seal(target.prototype);
        return target;
    }
    exports.sealed = sealed;
    function frozen(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.freeze(target);
        if (typeof target.prototype == 'object')
            Object.freeze(target.prototype);
        return target;
    }
    exports.frozen = frozen;
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
    exports.$ = $;
    // ############################################################################################################################
    /** Returns true if the given type (function) represents a primitive JavaScript type constructor. */
    function isPrimitiveType(o) {
        var symbol = typeof Symbol != 'undefined' ? Symbol : DreamSpace.global.Object; // (not supported in IE11)
        return (o == DreamSpace.global.Object || o == Array || o == Boolean || o == String
            || o == Number || o == symbol || o == Function || o == Date
            || o == RegExp || o == Error);
    }
    exports.isPrimitiveType = isPrimitiveType;
    // ############################################################################################################################
    /** Registers this global module in the global scope. The global 'DreamSpace' namespace is returned, if needed.
     * This helps to support:
     * 1. A single object to store global DreamSpace states, such as the host application version, base paths, etc.
     * 2. A global object to store callback functions for API initialization, such as Google Maps, etc.
     * @param uniqueGlobalVarName The global name to use.  By default this is the constant 'DEFAULT_ROOT_NS_NAME', which uses a NAME + GUID to guarantee no collisions.
     */
    function registerGlobal(uniqueGlobalVarName) {
        if (uniqueGlobalVarName)
            USER_GIVEN_GLOBAL_NS_NAME = uniqueGlobalVarName;
        Object.defineProperty(DreamSpace.global, DreamSpace.globalNamespaceName, { enumerable: false, writable: false, configurable: false, value: DreamSpace });
        // (this locked down, as global paths might be used by APIs after future initialization)
        return DreamSpace;
    }
    exports.registerGlobal = registerGlobal;
});
// ###########################################################################################################################
//# sourceMappingURL=DreamSpace.js.map