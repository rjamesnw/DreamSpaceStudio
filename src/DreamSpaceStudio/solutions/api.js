var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ###########################################################################################################################
// These are functions for bootstrapping the core system.  It helps to set up common types and functions that will be needed,
// such as DS.init() to execute callbacks to finalize to loading process (must be called by the end user).
// ###########################################################################################################################
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
    eval("var DSStaticProperties = DS;");
    class DSStaticProperties {
        static get globalNamespaceName() { return USER_GIVEN_GLOBAL_NS_NAME || DEFAULT_GLOBAL_NS_NAME; }
        static get rootns() { return DS.global[DS.globalNamespaceName]; }
    }
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
    DS.constructor = Symbol("static constructor");
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
        var params = [];
        for (var i = 0; i <= 9 && i < args.length; ++i)
            params.push("p" + i + " = args[" + i + "]");
        return eval("var " + params.join(', ') + ";\r\n" + x);
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
            if (DS.global.Object.prototype.hasOwnProperty.call(obj, key))
                return false;
        return true;
    }
    DS.isEmpty = isEmpty;
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
    DS.global = (function () { }.constructor("return this || global"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])
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
                DS.log("DreamSpace.init()", "Initialized and ready.");
                initCompleted();
            }));
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
})(DS || (DS = {}));
// ###########################################################################################################################
var DS;
(function (DS) {
    /** A common base type for all object that can be tracked by a globally unique ID. */
    class TrackableObject {
        constructor() {
            this._uid = DS.Utilities.createGUID(false);
        }
    }
    DS.TrackableObject = TrackableObject;
})(DS || (DS = {}));
var DS;
(function (DS) {
    // ====================================================================================================================================
    /** Represents an object that can have a parent object. */
    class DependentObject extends DS.TrackableObject {
        get parent() { return this.__parent; }
    }
    DS.DependentObject = DependentObject;
    // =======================================================================================================================
})(DS || (DS = {}));
// ############################################################################################################################################
// Browser detection (for special cases).
// ############################################################################################################################################
var DS;
(function (DS) {
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    let Browser;
    (function (Browser) {
        // (Browser detection is a highly modified version of "http://www.quirksmode.org/js/detect.html".)
        // (Note: This is only required for quirk detection in special circumstances [such as IE's native JSON whitespace parsing issue], and not for object feature support)
        /** A list of browsers that can be currently detected. */
        let BrowserTypes;
        (function (BrowserTypes) {
            /** Browser is not yet detected, or detection failed. */
            BrowserTypes[BrowserTypes["Unknown"] = 0] = "Unknown";
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            BrowserTypes[BrowserTypes["None"] = -1] = "None";
            BrowserTypes[BrowserTypes["IE"] = 1] = "IE";
            BrowserTypes[BrowserTypes["Chrome"] = 2] = "Chrome";
            BrowserTypes[BrowserTypes["FireFox"] = 3] = "FireFox";
            BrowserTypes[BrowserTypes["Safari"] = 4] = "Safari";
            BrowserTypes[BrowserTypes["Opera"] = 5] = "Opera";
            BrowserTypes[BrowserTypes["Netscape"] = 6] = "Netscape";
            BrowserTypes[BrowserTypes["OmniWeb"] = 7] = "OmniWeb";
            BrowserTypes[BrowserTypes["iCab"] = 8] = "iCab";
            BrowserTypes[BrowserTypes["Konqueror"] = 9] = "Konqueror";
            BrowserTypes[BrowserTypes["Camino"] = 10] = "Camino";
        })(BrowserTypes = Browser.BrowserTypes || (Browser.BrowserTypes = {}));
        /** A list of operating systems that can be currently detected. */
        let OperatingSystems;
        (function (OperatingSystems) {
            /** OS is not yet detected, or detection failed. */
            OperatingSystems[OperatingSystems["Unknown"] = 0] = "Unknown";
            OperatingSystems[OperatingSystems["Windows"] = 1] = "Windows";
            OperatingSystems[OperatingSystems["Mac"] = 2] = "Mac";
            OperatingSystems[OperatingSystems["Linux"] = 3] = "Linux";
            OperatingSystems[OperatingSystems["iOS"] = 4] = "iOS";
        })(OperatingSystems = Browser.OperatingSystems || (Browser.OperatingSystems = {}));
        var __browserList = (() => {
            var list = [];
            list[BrowserTypes.Chrome] =
                {
                    name: "Chrome", vendor: "Google", identity: BrowserTypes.Chrome,
                    versions: [{ nameTag: null, versionPrefix: null }] // (list of browser versions; string values default to the browser name if null)
                };
            list[BrowserTypes.OmniWeb] =
                {
                    name: "OmniWeb", vendor: "The Omni Group", identity: BrowserTypes.OmniWeb,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Safari] =
                {
                    name: "Safari", vendor: "Apple", identity: BrowserTypes.Safari,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            list[BrowserTypes.Opera] =
                {
                    name: "Opera", vendor: "Opera Mediaworks", identity: BrowserTypes.Opera,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            if (window.opera)
                Browser.browserVersionInfo = __browserList[BrowserTypes.Opera].versions[0];
            list[BrowserTypes.iCab] =
                {
                    name: "iCab", vendor: "Alexander Clauss", identity: BrowserTypes.iCab,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Konqueror] =
                {
                    name: "Konqueror", vendor: "KDE e.V.", identity: BrowserTypes.Konqueror,
                    versions: [{ nameTag: "KDE", versionPrefix: "Konqueror" }]
                };
            list[BrowserTypes.FireFox] =
                {
                    name: "Firefox", vendor: "Mozilla Foundation", identity: BrowserTypes.FireFox,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Camino] =
                {
                    name: "Camino", vendor: "", identity: BrowserTypes.Camino,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Netscape] =
                {
                    name: "Netscape", vendor: "AOL", identity: BrowserTypes.Netscape,
                    versions: [
                        { nameTag: null, versionPrefix: null },
                        { nameTag: "Mozilla", versionPrefix: "Mozilla", vendor: "Netscape Communications (now AOL)" } // for older Netscapes (4-)
                    ]
                };
            list[BrowserTypes.IE] =
                {
                    name: "Internet Explorer", vendor: "Microsoft", identity: BrowserTypes.IE,
                    versions: [{ nameTag: "MSIE", versionPrefix: "MSIE " }]
                };
            // ... connect the parents and return the static list ...
            for (var i = list.length - 1; i >= 0; --i)
                if (list[i] && list[i].versions)
                    for (var i2 = list[i].versions.length - 1; i2 >= 0; --i2)
                        if (list[i].versions[i2])
                            list[i].versions[i2].parent = list[i];
            return list;
        })();
        var __osList = [
            {
                name: "iPhone",
                identity: OperatingSystems.iOS
            },
            {
                name: "Linux",
                identity: OperatingSystems.Linux
            },
            {
                name: "Win",
                identity: OperatingSystems.Windows
            },
            {
                name: "Mac",
                identity: OperatingSystems.Mac
            }
        ];
        /** Holds a reference to the agent data detected regarding browser name and versions. */
        Browser.browserVersionInfo = null;
        /** Holds a reference to the agent data detected regarding the host operating system. */
        Browser.osInfo = null;
        var __findBrowser = () => {
            var agent = navigator.vendor + "," + navigator.userAgent, bInfo, version, versionPrefix;
            for (var i = 0, n = __browserList.length; i < n; ++i) {
                bInfo = __browserList[i];
                if (bInfo)
                    for (var i2 = 0, n2 = bInfo.versions.length; i2 < n2; ++i2) {
                        version = bInfo.versions[i2];
                        versionPrefix = version.versionPrefix || (bInfo.name + '/');
                        if (version && agent.indexOf(version.nameTag || bInfo.name) != -1 && agent.indexOf(versionPrefix) != -1)
                            return version;
                    }
            }
            return null;
        };
        var __findOS = () => {
            var osStrData = navigator.platform || navigator.userAgent;
            for (var i = 0, n = __osList.length; i < n; ++i)
                if (osStrData.indexOf(__osList[i].name) != -1)
                    return __osList[i];
        };
        var __detectVersion = (versionInfo) => {
            var versionStr = navigator.userAgent + " / " + navigator.appVersion;
            var versionPrefix = versionInfo.versionPrefix || (versionInfo.parent.name + "/");
            var index = versionStr.indexOf(versionPrefix);
            if (index == -1)
                return -1;
            return parseFloat(versionStr.substring(index + versionPrefix.length));
        };
        /** The name of the detected browser. */
        Browser.name = "";
        /** The browser's vendor. */
        Browser.vendor = "";
        /** The operating system detected. */
        Browser.os = OperatingSystems.Unknown;
        /** The browser version detected. */
        Browser.version = -1;
        /** Set to true if ES2015 (aka ES6) is supported ('class', 'new.target', etc.). */
        Browser.ES6 = DS.ES6;
        // (Note: For extension of native types, the DreamSpace behavior changes depending on ES6 support due to the new 'new.target' feature changing how called native constructors behave)
        /** The type of browser detected. */
        Browser.type = (() => {
            var browserType = BrowserTypes.Unknown, browserInfo;
            if (DS.Environment == DS.Environments.Browser) {
                if (!Browser.browserVersionInfo)
                    Browser.browserVersionInfo = __findBrowser();
                browserInfo = Browser.browserVersionInfo.parent;
                Browser.osInfo = __findOS();
                browserType = browserInfo.identity;
                Browser.name = browserInfo.name;
                Browser.vendor = Browser.browserVersionInfo.vendor || Browser.browserVersionInfo.parent.vendor;
                browserType = browserInfo != null ? browserInfo.identity : BrowserTypes.Unknown;
                Browser.version = __detectVersion(Browser.browserVersionInfo);
                Browser.os = Browser.osInfo != null ? Browser.osInfo.identity : OperatingSystems.Unknown;
            }
            else
                browserType = BrowserTypes.None;
            return browserType;
        })();
        // -----------------------------------------------------------------------------------------------------------------------------------
    })(Browser = DS.Browser || (DS.Browser = {}));
})(DS || (DS = {}));
// ############################################################################################################################################
// ############################################################################################################################
// Data IO
// ############################################################################################################################
var DS;
(function (DS) {
    /** Provides types and utilities for working with formatted data from various sources. */
    let Data;
    (function (Data) {
        // ========================================================================================================================
        /** Provides basic functions for working with JSON data. */
        let JSON;
        (function (JSON) {
            // ===================================================================================================================
            /** Converts a JSON string into an object with nested objects as required.
             * The given JSON string is validated first before it is parsed for security reasons. Invalid JSON will throw an exception.
            */
            function ToObject(jsonText) {
                if (typeof jsonText !== "string" || !jsonText)
                    return null;
                // ... some browsers (IE) may not be able to handle the whitespace before or after the text ...
                jsonText = jsonText.trim();
                // ... validate the JSON format ...
                // (Note: regex is from "https://github.com/douglascrockford/JSON-js/blob/master/json2.js" [by Douglas Crockford])
                if (/^[\],:{}\s]*$/.test(jsonText.replace(/\\["\\\/bfnrtu]/g, '@').
                    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                    // Try to use the native JSON parser first
                    return window && window.JSON && window.JSON.parse ?
                        window.JSON.parse(jsonText) : (new Function("return " + jsonText))();
                }
                else {
                    throw DS.Exception.from('Invalid JSON: "' + jsonText + '"');
                }
            }
            JSON.ToObject = ToObject;
            // ===================================================================================================================
        })(JSON = Data.JSON || (Data.JSON = {}));
        // =============================================================================================
        class PropertyPathEndpoint {
            constructor(object, propertyName, propertyIndex, parameters) {
                this.object = object;
                this.propertyName = propertyName;
                this.propertyIndex = propertyIndex;
                this.arguments = this.arguments;
            }
            /** Returns the value referenced by the associated endpoint information. */
            getValue() {
                if (this.object === void 0)
                    return void 0;
                var value = this.object[this.propertyName];
                if (this.arguments) { // (if no parameter list, then only the function value itself will be returned)
                    if (!this.arguments.length)
                        value = value.apply(this.object);
                    else
                        value = value.apply(this.object, this.arguments);
                }
                else if (this.propertyIndex !== void 0) // (note: ignored if the value is a function with parameters)
                    value = value[this.propertyIndex];
                return value;
            }
        }
        Data.PropertyPathEndpoint = PropertyPathEndpoint;
        /** Holds details about the value source or target of a binding. */
        class PropertyPath {
            // ---------------------------------------------------------------------------------------------------------------
            constructor(origin, path) {
                this.origin = origin;
                this.parsePath(path);
            }
            // ---------------------------------------------------------------------------------------------------------------
            /** Parses the specified path string and updates this PropertyPath instance with the details. */
            parsePath(path) {
                if (path) {
                    if (typeof path != 'string')
                        path = '' + path;
                    // ... use the native regex to parse out the path parts (including the symbols) ...
                    var parts = path.match(PropertyPath.__PathPartRegEx);
                    var lastQuote = ""; // (the end quote must match this if a quote is found)
                    var pname, index, arg;
                    for (var i = 0, n = parts.length; i < n; ++i) {
                    }
                }
                return this;
            }
            // ---------------------------------------------------------------------------------------------------------------
            /** Reconstructs the property path string using the internal path array details. */
            __getPathString(level) {
                var path = "", pname, args, index;
                for (var i = 0, n = this.namePath.length; i < n && i <= level; ++i) {
                    pname = this.namePath[i];
                    if (pname)
                        path = path ? path + "." + pname : pname;
                    args = this.arguments[i];
                    if (args) { // (if no parameter list, then only the function value itself is being referenced)
                        if (!args.length)
                            path += "()";
                        else
                            path += "(" + this.arguments.join(",") + ")";
                    }
                    else {
                        index = this.indexes[i];
                        if (index !== void 0) // (note: ignored if the value is a function with parameters)
                            path += "[" + index + "]";
                    }
                }
                return path;
            }
            /** Traverses the property path information and returns the final endpoint details.
            * @param {object} origin The root object to begin the traversal on.  If an object was supplied to the constructor,
            * then this parameter is optional; though, it can be used to override that object (for the call only).
            * @param {PropertyPathEndpoint} existingEndpoint An optional existing endpoint instance if available, otherwise leave this undefined.
            */
            getEndpoint(origin, existingEndpoint) {
                if (!this.namePath || !this.namePath.length)
                    return null;
                var i = 0, endpoint = existingEndpoint || new PropertyPathEndpoint();
                if (typeof endpoint.getValue != 'function')
                    throw DS.Exception.from("The existing endpoint object is not a valid 'PropertyPathEndpoint' instance.", this);
                endpoint.object = origin;
                endpoint.propertyName = this.namePath[0];
                endpoint.propertyIndex = this.indexes[0];
                endpoint.arguments = this.arguments[0];
                while (i < this.namePath.length) {
                    endpoint.object = endpoint.getValue();
                    if (endpoint.object === void 0)
                        throw DS.Exception.from("Invalid property path: " + this.__getPathString(i), this);
                    i++;
                    endpoint.propertyName = this.namePath[i];
                    endpoint.propertyIndex = this.indexes[i];
                    endpoint.arguments = this.arguments[i];
                }
                return endpoint;
            }
        }
        // ---------------------------------------------------------------------------------------------------------------
        PropertyPath.__PathPartRegEx = /\[|\]|\(|\)|"|'|\\|\.|[^\[\]\(\)"'\.\\]*/gi;
        Data.PropertyPath = PropertyPath;
        /** The type of binding between object properties (used by System.IO.Data.Binding). */
        let BindingMode;
        (function (BindingMode) {
            /** Updates either the target or source property to the other when either of them change. */
            BindingMode[BindingMode["TwoWay"] = 0] = "TwoWay";
            /** Updates only the target property when the source changes. */
            BindingMode[BindingMode["OneWay"] = 1] = "OneWay";
            /** Inverts OneWay mode so that the source updates when the target changes. */
            BindingMode[BindingMode["OneWayToSource"] = 2] = "OneWayToSource";
            /** Updates only the target property once when bound.  Subsequent source changes are ignored. */
            BindingMode[BindingMode["OneTime"] = 3] = "OneTime";
        })(BindingMode = Data.BindingMode || (Data.BindingMode = {}));
        /** Represents a binding between object properties. */
        class Binding {
            /** Creates a new Binding object to update an object property when another changes.
            * @param {object} source The source object that is the root to which the property path is applied for the binding.
            * @param {string} path The property path to the bound property.
            * @param {string} targetType The expected type of the target .
            * @param {BindingMode} mode The direction of data updates.
            * @param {any} defaultValue A default value to use when binding is unable to return a value, or the value is 'undefined'.
            * Note: If 'defaultValue' is undefined when a property path fails, an error will occur.
            * @param {IValueConverter} converter The converter used to convert values for this binding..
            */
            constructor(source, path, targetType, mode = BindingMode.TwoWay, defaultValue = void 0, converter = null, converterParameter = null) {
                this.propertyPath = new PropertyPath(source, path);
                this.source = source;
                this.targetType = targetType;
                this.mode = mode;
                this.defaultValue = defaultValue;
                this.converter = converter;
                this.converterParameter = converterParameter;
                this.updateEndpoint();
            }
            /** Updates the source endpoint using the current property path settings. */
            updateEndpoint() {
                this.sourceEndpoint = this.propertyPath.getEndpoint();
            }
            /** Returns the value referenced by the source endpoint object, and applies any associated converter. */
            getValue(type = "any", parameter = null) {
                if (!this.sourceEndpoint)
                    this.updateEndpoint();
                if (this.converter && typeof this.converter.convert == 'function')
                    var value = this.converter.convert(this.sourceEndpoint.getValue(), this.targetType, this.converterParameter);
                else
                    var value = this.sourceEndpoint.getValue();
                return value === void 0 ? this.defaultValue : value;
            }
        }
        Data.Binding = Binding;
        // ========================================================================================================================
    })(Data = DS.Data || (DS.Data = {}));
})(DS || (DS = {}));
// ############################################################################################################################
// ###########################################################################################################################
// Callback Delegates (serializable - closures should not be used)
// ###########################################################################################################################
var DS;
(function (DS) {
    // ============================================================================================================================
    ;
    /**
     * Represents a function of a specific object instance.
     * Functions have no reference to any object instance when invoked statically.  This means when used as "handlers" (callbacks)
     * the value of the 'this' reference is either the global scope, or undefined (in strict mode).   Delegates couple the target
     * object instance (context of the function call [using 'this']) with a function reference.  This allows calling a function
     * on a specific object instance by simply invoking it via the delegate. If not used with closures, a delegate may also be
     * serialized.
     * Note: If the target object is undefined, then 'null' is assumed and passed in as 'this'.
     */
    class Delegate {
        /**
        * Reinitializes a disposed Delegate instance.
        * @param o The Delegate instance to initialize, or re-initialize.
        * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
        * @param object The instance to bind to the resulting delegate object.
        * @param func The function that will be called for the resulting delegate object.
        */
        constructor(object, func) {
            if (object === void 0)
                object = null;
            this.object = object;
            this.func = func;
            this.update();
        }
        /** Creates and returns a string that uniquely identifies the combination of the object instance and function for
         * this delegate.  Since every delegate has a unique object ID across an application domain, key strings can help
         * prevent storage of duplicate delegates all pointing to the same target.
         * Note: The underlying object and function must be registered types first.
         * See 'AppDomain.registerClass()/.registerType()' for more information.
         */
        static getKey(object, func) {
            var isstaticctx = Delegate.__validate("getKey()", object, func);
            var id = isstaticctx ? '-1' : object._uid.toString();
            return id + "," + func.$__name; // (note: -1 means "global scope")
        }
        static __validate(callername, object, func) {
            var isstaticctx = object === void 0 || object === null; // ('$__fullname' exists on modules and registered type objects)
            if (!isstaticctx && typeof object._uid != 'number')
                throw DS.Exception.error("Delegate." + callername, "The object for this delegate does not contain a numerical '_uid' value (used as a global object reference for serialization), or '$__fullname' value (for static type references).  See 'AppDomain.registerClass()'.", this);
            return isstaticctx;
        }
        //? static readonly $Type = $Delegate;
        [DS.constructor](factory) {
            /** Generates "case" statements for function templates.  The function template is converted into a string, the resulting cases get inserted,
              * and the compiled result is returned.  This hard-codes the logic for greatest speed, and if more parameters are need, can easily be expanded.
            */
            function makeCases(argsIndexStart, caseCountMax, func, funcName, contextStr, argsStr) {
                var ftext = func.toString();
                var matchRegex = /^.*case 1:.*/m;
                var cases = "", argtext = "";
                for (var i = argsIndexStart, n = argsIndexStart + caseCountMax; i < n; ++i)
                    cases += "case " + (1 + i) + ": return " + funcName + "(" + contextStr + (argtext += argsStr + "[" + i + "], ") + "this);\r\n";
                return DS.safeEval("(" + ftext.replace(matchRegex, cases) + ")");
            }
            // TODO: Look into using the "...spread" operator for supported browsers, based on support: https://goo.gl/a5tvW1
            factory.fastApply = makeCases(0, 20, function (func, context, args) {
                if (!arguments.length)
                    throw DS.Exception.error("Delegate.fastApply()", "No function specified.");
                if (typeof func !== 'function')
                    throw DS.Exception.error("Delegate.fastApply()", "Function object expected.");
                if (arguments.length == 1 || context == void 0 && (args == void 0 || !args.length))
                    return func();
                switch (args.length) {
                    case 1: return func.call(context, args[0]); /* (this line is matched by the regex and duplicated as needed) */
                    default: return func.apply(context, args); /* (no arguments supplied) */
                }
            }, "func.call", "context, ", "args");
            factory.fastCall = makeCases(0, 20, function (func, context) {
                if (!arguments.length)
                    throw DS.Exception.error("Delegate.fastCall()", "No function specified.");
                if (typeof func !== 'function')
                    throw DS.Exception.error("Delegate.fastApply()", "Function object expected.");
                var restArgsLength = arguments.length - 2; /* (subtract func and context parameters from the count to get the "...rest" args) */
                if (arguments.length == 1 || context == void 0 && !restArgsLength)
                    return func();
                switch (restArgsLength) {
                    case 1: return func.call(context, arguments[0]); /* (this line is matched by the regex and duplicated as needed) */
                    default: return func.apply(context, arguments); /* (no arguments supplied) */
                }
            }, "func.call", "context, ", "arguments");
            Delegate.prototype.invoke = makeCases(0, 20, function () {
                var $this = this;
                if (!arguments.length)
                    return $this.func(this.object, this);
                var context = (arguments[0] === void 0) ? $this : arguments[0];
                switch (arguments.length) {
                    case 1: return $this.func(context, arguments[1], this);
                    default: return $this.func.apply(this, [context].concat(arguments, this));
                }
            }, "$this.func", "context, ", "arguments");
            var call = function () {
                var $this = this;
                if (!arguments.length)
                    return $this.func(this.object, this);
                switch (arguments.length) {
                    case 1: return $this.func($this.object, arguments[1], this);
                    default: return $this.func.apply(this, [$this.object].concat(arguments, this));
                }
            };
            Delegate.prototype.call = ((DS.Browser.type != DS.Browser.BrowserTypes.IE) ?
                makeCases(0, 20, call, "$this.func", "$this.object, ", "arguments")
                : makeCases(0, 20, call, "$this.__boundFunc", "", "arguments"));
            var apply = function (context, argsArray) {
                var $this = this;
                if (arguments.length == 1) { // (only array given)
                    argsArray = context;
                    context = $this.object;
                }
                else if (arguments.length > 1 && $this.apply != $this.__apply)
                    return $this.__apply(context, argsArray); // (only the non-bound version can handle context changes)
                if (argsArray == void 0 || !argsArray.length)
                    return $this.invoke(context, this);
                switch (argsArray.length) {
                    case 1: return $this.func(context, argsArray[0], this);
                    default: return $this.func.apply(this, [context].concat(argsArray, this));
                }
            };
            Delegate.prototype.__apply = makeCases(0, 20, apply, "$this.func", "context, ", "args"); // (keep reference to the non-bound version as a fallback for user defined contexts)
            Delegate.prototype.apply = ((DS.Browser.type != DS.Browser.BrowserTypes.IE) ? Delegate.prototype.__apply : makeCases(0, 20, apply, "$this.__boundFunc", "", "args")); // (note: bound functions are faster in IE)
        }
        /** A read-only key string that uniquely identifies the combination of object instance and function in this delegate.
        * This property is set for new instances by default.  Calling 'update()' will update it if necessary.
        */
        get key() { return this.__key; }
        //? private static $this_REPLACE_REGEX = /([^A-Za-z$_\.])this([^A-Za-z$_])/gm;
        /** If the 'object' or 'func' properties are modified directly, call this function to update the internal bindings. */
        update() {
            if (typeof this.func != 'function')
                DS.Exception.error("Delegate", "The function value is not a function:\r\n {Delegate}.func = " + this.func, this.func);
            if (this.func.bind)
                this.__boundFunc = this.func.bind(this, this.object); // (this can be faster in some cases [i.e. IE])
            if (this.object instanceof Object)
                this.__key = Delegate.getKey(this.object, this.func); // (this also validates the properties first)
            else
                this.__key = void 0;
            return this;
        }
        ///** Attempts to serialize the delegate.  This can only succeed if the underlying object reference is registered with 
        //* an 'AppDomain', and the underlying function reference implements 'IFunctionInfo' (for the '$__name' property).  Be
        //* careful when using function closures, as only the object ID and function name are stored. The object ID and function
        //* name are used to look up the object context and function when loading from saved data.
        //*/
        //? getData(data: SerializedData): void {
        //    var isstatic = Delegate['__validate']("getData()", this.object, this.func);
        //    if (!isstatic)
        //        data.addValue("id", (<ITrackableObject><any>this.object)._uid);
        //    data.addValue("ft", this.__functionText);
        //}
        ///**
        // * Load this delegate from serialized data (See also: getData()).
        // * @param data
        // */
        //? setData(data: SerializedData): void {
        //    var objid = data.getNumber("id");
        //    this.object = (<ITrackableObject><any>this).$__appDomain.objects.getObjectForceCast<TObj>(objid);
        //    this.__functionText = data.getValue("ft");
        //    this.update();
        //    // TODO: Consider functions that implement ITypeInfo, and use that if they are registered.
        //}
        equal(value) {
            return typeof value == 'object' && value instanceof Delegate
                && value.object === this.object && value.func === this.func;
        }
    }
    // ============================================================================================================================
})(DS || (DS = {}));
// ############################################################################################################################
var DS;
(function (DS) {
    var base_log = DS.log; // (need a reference to the basic root level log function)
    /** Contains diagnostic based functions, such as those needed for logging purposes. */
    let Diagnostics;
    (function (Diagnostics) {
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        var __logItemsSequenceCounter = 0;
        var __logCaptureStack = [];
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        class LogItem {
            constructor(parent, title, message, type = DS.LogTypes.Normal, outputToConsole = true) {
                // --------------------------------------------------------------------------------------------------------------------------
                /** The parent log item. */
                this.parent = null;
                /** The sequence count of this log item. */
                this.sequence = __logItemsSequenceCounter++; // (to maintain correct ordering, as time is not reliable if log items are added too fast)
                this.marginIndex = void 0;
                if (title === void 0 || title === null) {
                    if (DS.isEmpty(message))
                        DS.error("LogItem()", "A message is required if no title is given.", this);
                    title = "";
                }
                else if (typeof title != 'string')
                    if (title.$__fullname)
                        title = title.$__fullname;
                    else
                        title = title.toString && title.toString() || title.toValue && title.toValue() || "" + title;
                if (message === void 0 || message === null)
                    message = "";
                else
                    message = message.toString && message.toString() || message.toValue && message.toValue() || "" + message;
                this.parent = parent;
                this.title = title;
                this.message = message;
                this.time = Date.now(); /*ms*/
                this.type = type;
                if (console && outputToConsole) { // (if the console object is supported, and the user allows it for this item, then send this log message to it now)
                    var _title = title, margin = ""; // (modify a copy so we can continue to pass along the unaltered title text)
                    if (_title.charAt(title.length - 1) != ":")
                        _title += ": ";
                    else
                        _title += " ";
                    while (parent) {
                        parent = parent.parent;
                        margin += "  ";
                    }
                    if (DS.TimeSpan) {
                        var time = DS.TimeSpan.utcTimeToLocalTime(this.time);
                        var consoleText = time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)
                            + " " + margin + _title + this.message;
                    }
                    else
                        consoleText = (new Date()).toLocaleTimeString() + " " + margin + _title + this.message; // TODO: Make a utility function to format Date() similar to hh:mm:ss
                    base_log(null, consoleText, type, void 0, false, false);
                }
            }
            write(message, type = DS.LogTypes.Normal, outputToConsole = true) {
                var logItem = new LogItem(this, null, message, type);
                if (!this.subItems)
                    this.subItems = [];
                this.subItems.push(logItem);
                return this;
            }
            log(title, message, type = DS.LogTypes.Normal, outputToConsole = true) {
                var logItem = new LogItem(this, title, message, type, outputToConsole);
                if (!this.subItems)
                    this.subItems = [];
                this.subItems.push(logItem);
                return logItem;
            }
            /** Causes all future log writes to be nested under this log entry.
            * This is usually called at the start of a block of code, where following function calls may trigger nested log writes. Don't forget to call 'endCapture()' when done.
            * The current instance is returned to allow chaining function calls.
            * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
            */
            beginCapture() {
                //? if (__logCaptureStack.indexOf(this) < 0)
                __logCaptureStack.push(this);
                return this;
            }
            /** Undoes the call to 'beginCapture()', activating any previous log item that called 'beginCapture()' before this instance.
            * See 'beginCapture()' for more details.
            * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
            */
            endCapture() {
                //var i = __logCaptureStack.lastIndexOf(this);
                //if (i >= 0) __logCaptureStack.splice(i, 1);
                var item = __logCaptureStack.pop();
                if (item != null)
                    throw DS.Exception.from("Your calls to begin/end log capture do not match up. Make sure the calls to 'endCapture()' match up to your calls to 'beginCapture()'.", this);
            }
            toString() {
                var time = DS.TimeSpan && DS.TimeSpan.utcTimeToLocalTime(this.time) || null;
                var timeStr = time && (time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)) || "" + new Date(this.time).toLocaleTimeString();
                var txt = "[" + this.sequence + "] (" + timeStr + ") " + this.title + ": " + this.message;
                return txt;
            }
            // --------------------------------------------------------------------------------------------------------------------------
            static [DS.constructor](factory) {
                //factory.init = (o, isnew) => { // not dealing with private properties, so this is not needed!
                //};
            }
        }
        Diagnostics.LogItem = LogItem;
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        Diagnostics.__logItems = [];
        function log(title, message, type = DS.LogTypes.Normal, outputToConsole = true) {
            if (__logCaptureStack.length) {
                var capturedLogItem = __logCaptureStack[__logCaptureStack.length - 1];
                var lastLogEntry = capturedLogItem.subItems && capturedLogItem.subItems.length && capturedLogItem.subItems[capturedLogItem.subItems.length - 1];
                if (lastLogEntry)
                    return lastLogEntry.log(title, message, type, outputToConsole);
                else
                    return capturedLogItem.log(title, message, type, outputToConsole); //capturedLogItem.log("", "");
            }
            var logItem = new LogItem(null, title, message, type, outputToConsole);
            Diagnostics.__logItems.push(logItem);
            return logItem;
        }
        Diagnostics.log = log;
        function getLogAsHTML() {
            var i, n;
            var orderedLogItems = [];
            var item;
            var logHTML = "<div>\r\n", cssClass = "", title, icon, rowHTML, titleHTML, messageHTML, marginHTML = "";
            var logItem, lookAheadLogItem;
            var time;
            var cssAndIcon;
            var margins = [""];
            var currentMarginIndex = 0;
            function cssAndIconFromLogType_text(type) {
                var cssClass, icon;
                switch (type) {
                    case DS.LogTypes.Success:
                        cssClass = "text-success";
                        icon = "&#x221A;";
                        break;
                    case DS.LogTypes.Info:
                        cssClass = "text-info";
                        icon = "&#x263C;";
                        break;
                    case DS.LogTypes.Warning:
                        cssClass = "text-warning";
                        icon = "&#x25B2;";
                        break;
                    case DS.LogTypes.Error:
                        cssClass = "text-danger";
                        icon = "<b>(!)</b>";
                        break;
                    default:
                        cssClass = "";
                        icon = "";
                }
                return { cssClass: cssClass, icon: icon };
            }
            function reorganizeEventsBySequence(logItems) {
                var i, n;
                for (i = 0, n = logItems.length; i < n; ++i) {
                    logItem = logItems[i];
                    logItem.marginIndex = void 0;
                    orderedLogItems[logItem.sequence] = logItem;
                    if (logItem.subItems && logItem.subItems.length)
                        reorganizeEventsBySequence(logItem.subItems);
                }
            }
            function setMarginIndexes(logItem, marginIndex = 0) {
                var i, n;
                if (marginIndex && !margins[marginIndex])
                    margins[marginIndex] = margins[marginIndex - 1] + "&nbsp;&nbsp;&nbsp;&nbsp;";
                logItem.marginIndex = marginIndex;
                // ... reserve the margins needed for the child items ...
                if (logItem.subItems && logItem.subItems.length) {
                    for (i = 0, n = logItem.subItems.length; i < n; ++i)
                        setMarginIndexes(logItem.subItems[i], marginIndex + 1);
                }
            }
            // ... reorganize the events by sequence ...
            reorganizeEventsBySequence(Diagnostics.__logItems);
            // ... format the log ...
            for (i = 0, n = orderedLogItems.length; i < n; ++i) {
                logItem = orderedLogItems[i];
                if (!logItem)
                    continue;
                rowHTML = "";
                if (logItem.marginIndex === void 0)
                    setMarginIndexes(logItem);
                marginHTML = margins[logItem.marginIndex];
                cssAndIcon = cssAndIconFromLogType_text(logItem.type);
                if (cssAndIcon.icon)
                    cssAndIcon.icon += "&nbsp;";
                if (cssAndIcon.cssClass)
                    messageHTML = cssAndIcon.icon + "<strong>" + DS.StringUtils.replace(logItem.message, "\r\n", "<br />\r\n") + "</strong>";
                else
                    messageHTML = cssAndIcon.icon + logItem.message;
                if (logItem.title)
                    titleHTML = logItem.title + ": ";
                else
                    titleHTML = "";
                time = DS.TimeSpan.utcTimeToLocalTime(logItem.time);
                rowHTML = "<div class='" + cssAndIcon.cssClass + "'>"
                    + time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds) + "&nbsp;"
                    + marginHTML + titleHTML + messageHTML + "</div>" + rowHTML + "\r\n";
                logHTML += rowHTML + "</ br>\r\n";
            }
            logHTML += "</div>\r\n";
            return logHTML;
        }
        Diagnostics.getLogAsHTML = getLogAsHTML;
        function getLogAsText() {
            //??var logText = "";
            //??for (var i = 0, n = __logItems.length; i < n; ++i)
            //??    logText += String.replaceTags(__logItems[i].title) + ": " + String.replaceTags(__logItems[i].message) + "\r\n";
            return DS.StringUtils.replaceTags(DS.StringUtils.replace(getLogAsHTML(), "&nbsp;", " "));
        }
        Diagnostics.getLogAsText = getLogAsText;
        // ========================================================================================================================
    })(Diagnostics = DS.Diagnostics || (DS.Diagnostics = {}));
    // ############################################################################################################################
    // Basic Window hooks for client-side diagnostics (CTRL+~ to dump the log).
    // TODO: Consider opening the load in either a popup or overlay (user's choice).
    if (!isNode && typeof window !== 'undefined') {
        // If a window error event callback is available, hook into it to provide some visual feedback in case of errors.
        // (Note: Supports the Bootstrap UI, though it may not be available if an error occurs too early)
        window.onerror = function (eventOrMessage, source, fileno) {
            // ... create a log entry of this first ...
            Diagnostics.log("window.onerror", eventOrMessage + " in '" + source + "' on line " + fileno + ".", DS.LogTypes.Error);
            // ... make sure the body is visible ...
            document.body.style.display = ""; // (show the body in case it's hidden)
            // ... format the error ...
            if (typeof eventOrMessage !== 'string')
                eventOrMessage = "" + eventOrMessage;
            var msgElement = document.createElement("div");
            msgElement.innerHTML = "<button type='button' class='close' data-dismiss='alert'>&times;</button><strong>"
                + eventOrMessage.replace(/\r\n/g, "<br/>\r\n") + "<br/>\r\nError source: '" + source + "' on line " + fileno + "<br/>\r\n</strong>\r\n";
            msgElement.className = "alert alert-danger";
            document.body.appendChild(msgElement);
        };
        // Add a simple keyboard hook to display debug information.
        document.onkeypress = document.onkeydown = function (e) {
            var keyCode;
            var evt = e ? e : window.event;
            if (evt.type == "keydown") {
                keyCode = evt.keyCode;
            }
            else {
                keyCode = evt.charCode ? evt.charCode : evt.keyCode;
            }
            if (keyCode == 192 && evt.ctrlKey && DS.debugMode) { // (CTRL+~) key
                var body = document.getElementById("main");
                if (body)
                    body.style.display = ""; // (show the main element if hidden)
                var headerDiv = document.createElement("h1");
                headerDiv.innerHTML = "<h1><a name='__dslog__' id='__dslog__'>DreamSpace Log:</a></h1>\r\n";
                var div = document.createElement("div");
                div.innerHTML = Diagnostics.getLogAsHTML();
                document.body.appendChild(headerDiv);
                document.body.appendChild(div);
                headerDiv.onclick = () => { alert("DreamSpace Log: \r\n" + Diagnostics.getLogAsText()); };
                location.hash = "#__dslog__";
            }
        };
    }
})(DS || (DS = {}));
// ############################################################################################################################
var DS;
(function (DS) {
    // =======================================================================================================================
    /** Returns the call stack for a given error object. */
    function getErrorCallStack(errorSource) {
        if (!errorSource || !errorSource.stack)
            return [];
        var _e = errorSource;
        if (_e.stacktrace && _e.stack)
            return _e.stacktrace.split(/\n/g); // (opera provides one already good to go) [note: can also check for 'global["opera"]']
        var callstack = [];
        var isCallstackPopulated = false;
        var stack = _e.stack || _e.message;
        if (stack) {
            var lines = stack.split(/\n/g);
            if (lines.length) {
                // ... try to extract stack details only (some browsers include other info) ...
                for (var i = 0, len = lines.length; i < len; ++i)
                    if (/.*?:\d+:\d+/.test(lines[i]))
                        callstack.push(lines[i]);
                // ... if there are lines, but nothing was added, then assume this is a special unknown stack format and just dump it as is ...
                if (lines.length && !callstack.length)
                    callstack.push.apply(callstack, lines);
                isCallstackPopulated = true;
            }
        }
        if (!isCallstackPopulated && arguments.callee) { //(old IE and Safari - fall back to traversing the call stack by caller reference [note: this may become depreciated])
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
        }
        return callstack;
    }
    DS.getErrorCallStack = getErrorCallStack;
    /** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
      * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
      */
    function getErrorMessage(errorSource) {
        if (typeof errorSource == 'string')
            return errorSource;
        else if (typeof errorSource == 'object') {
            if (DS.Diagnostics && DS.Diagnostics.LogItem && errorSource instanceof DS.Diagnostics.LogItem) {
                return errorSource.toString();
            }
            else if ('message' in errorSource) { // (this should support both 'Exception' AND 'Error' objects)
                var errorInfo = errorSource;
                var error = errorSource instanceof Error ? errorSource : errorSource instanceof ErrorEvent ? errorSource.error : null;
                var msg = '' + (errorInfo.message || errorInfo.reason || errorInfo.type);
                var fname = errorInfo instanceof Function ? DS.getTypeName(errorInfo, false) : errorInfo.functionName;
                var sourceLocation = errorInfo.fileName || errorInfo.filename || errorInfo.url;
                if (fname)
                    msg = "(" + fname + ") " + msg;
                var lineno = errorInfo.lineno !== void 0 ? errorInfo.lineno : errorInfo.lineNumber;
                var colno = errorInfo.colno !== void 0 ? errorInfo.colno : errorInfo.columnNumber;
                if (lineno !== void 0) {
                    msg += "\r\non line " + lineno + ", column " + colno;
                    if (sourceLocation !== void 0)
                        msg += ", of file '" + sourceLocation + "'";
                }
                else if (sourceLocation !== void 0)
                    msg += "\r\nin file '" + sourceLocation + "'";
                var stack = getErrorCallStack(error);
                if (stack && stack.length)
                    msg += "\r\nStack trace:\r\n" + stack.join("\r\n") + "\r\n";
                return msg;
            }
            else
                return '' + errorSource;
        }
        else
            return '' + errorSource;
    }
    DS.getErrorMessage = getErrorMessage;
    // ========================================================================================================================================
})(DS || (DS = {}));
// ############################################################################################################################
// Types for error management.
// ############################################################################################################################
var DS;
(function (DS) {
    /**
     * The Exception object is used to record information about errors that occur in an application.
     * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
     */
    class Exception extends Error {
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        /** Records information about errors that occur in the application.
        * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
        * @param {string} message The error message.
        * @param {object} source An object that is associated with the message, or null.
        * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
        */
        constructor(message, source, log) {
            super();
            this.message = message;
            this.source = source;
            this.stack = (new Error()).stack;
            if (log || log === void 0)
                DS.Diagnostics.log("Exception", message, DS.LogTypes.Error);
        }
        /** Returns the current call stack. */
        static printStackTrace() {
            var callstack = [];
            var isCallstackPopulated = false;
            try {
                throw "";
            }
            catch (e) {
                if (e.stack) { //Firefox
                    var lines = e.stack.split('\n');
                    for (var i = 0, len = lines.length; i < len; ++i) {
                        if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                            callstack.push(lines[i]);
                        }
                    }
                    //Remove call to printStackTrace()
                    callstack.shift();
                    isCallstackPopulated = true;
                }
                else if (DS.global["opera"] && e.message) { //Opera
                    var lines = e.message.split('\n');
                    for (var i = 0, len = lines.length; i < len; ++i) {
                        if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                            var entry = lines[i];
                            //Append next line also since it has the file info
                            if (lines[i + 1]) {
                                entry += ' at ' + lines[i + 1];
                                i++;
                            }
                            callstack.push(entry);
                        }
                    }
                    //Remove call to printStackTrace()
                    callstack.shift();
                    isCallstackPopulated = true;
                }
            }
            if (!isCallstackPopulated) { //IE and Safari
                var currentFunction = arguments.callee.caller;
                while (currentFunction) {
                    var fn = currentFunction.toString();
                    var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                    callstack.push(fname);
                    currentFunction = currentFunction.caller;
                }
            }
            return callstack;
        }
        static from(message, source = null) {
            // (support LogItem objects natively as the exception message source)
            var createLog = true;
            if (typeof message == 'object' && (message.title || message.message)) {
                createLog = false; // (this is from a log item, so don't log a second time)
                if (source != void 0)
                    message.source = source;
                source = message;
                message = "";
                if (source.title)
                    message += source.title;
                if (source.message) {
                    if (message)
                        message += ": ";
                    message += source.message;
                }
            }
            //var callerFunction = System.Exception.from.caller;
            //var callerFunctionInfo = <ITypeInfo><any>callerFunction;
            //var callerName = getFullTypeName(callerFunctionInfo) || "/*anonymous*/";
            ////var srcName = callerFunction.substring(callerFunction.indexOf("function"), callerFunction.indexOf("("));
            //var args = callerFunction.arguments;
            //var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
            //var callerSignature = (callerName ? "[" + callerName + "(" + _args + ")]" : "");
            //message += (callerSignature ? callerSignature + ": " : "") + message + "\r\n\r\n";
            var caller = this.from.caller;
            while (caller && (caller == Exception.error || caller == Exception.notImplemented || caller == DS.log || caller == DS.error
                || typeof caller.$__fullname == 'string' && caller.$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
                caller = caller.caller; // (skip the proxy functions that call this function)
            if (caller) {
                message += "\r\n\r\nStack:\r\n\r\n";
                var stackMsg = "";
                while (caller) {
                    var callerName = DS.getFullTypeName(caller) || "/*anonymous*/";
                    var args = caller.arguments;
                    var _args = args && args.length > 0 ? DS.global.Array.prototype.join.call(args, ', ') : "";
                    if (stackMsg)
                        stackMsg += "called from ";
                    stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                    caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                }
                message += stackMsg;
            }
            return new Exception(message, source, createLog);
        }
        /**
         * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
         */
        static error(title, message, source) {
            if (DS.Diagnostics && DS.Diagnostics.log) {
                var logItem = DS.Diagnostics.log(title, message, DS.LogTypes.Error);
                return Exception.from(logItem, source);
            }
            else
                return Exception.from(DS.error(title, message, source, false, false), source);
        }
        /**
         * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static notImplemented(functionNameOrTitle, source, message) {
            var msg = "The function is not implemented." + (message ? " " + message : "");
            if (DS.Diagnostics && DS.Diagnostics.log) {
                var logItem = DS.Diagnostics.log(functionNameOrTitle, msg, DS.LogTypes.Error);
                return Exception.from(logItem, source);
            }
            else
                return Exception.from(DS.error(functionNameOrTitle, msg, source, false, false), source);
        }
        /** Returns the error message for this exception instance. */
        toString() { return this.message; }
        valueOf() { return this.message; }
    }
    DS.Exception = Exception;
})(DS || (DS = {}));
// ############################################################################################################################
// ###########################################################################################################################
// These are functions for creating global scope variables/references that eliminate/minimize collisions between conflicting scripts.
// Normally, each manifest and module gets its own local-global scope; however, in some cases, 3rd-party libraries do not 
// expect or support dot-delimited object paths, so unfortunately a root global callback reference may be required in such cases.
// DreamSpace.Globals contains functions to help deal with this as it relates to loading modules.
// Note: There's no need to use any of these functions directly from within manifest and module scripts.  Each has a local reference
// using the identifiers 'this', 'manifest', or 'module' (accordingly), which provides functions for local-global scope storage.
// ###########################################################################################################################
/**
 * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
 * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
 * named index based lookups, so no string concatenation is used, which makes the process many times faster.
 * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
 * property names.  To be safe, make sure to always use the 'DreamSpace.Globals.register()' function.  It can create isolated
 * global variables, and if necessary, also create a safer unique host global scope name.
 */
var DS;
(function (DS) {
    let Globals;
    (function (Globals) {
        /** Internal: used when initializing DreamSpace. */
        var _globals = Globals;
        var _namespaces = {};
        var _nsCount = 1;
        function register(namespace, name, initialValue, asHostGlobal = false) {
            var nsID, nsglobals, alreadyRegistered = false;
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
                    nsglobals[name] = { "global": DS.global, "hostGlobalName": hostGlobalName }; // (any namespace global value referencing the global [window] scope is a redirect to lookup the value name there instead)
                    DS.global[hostGlobalName] = initialValue;
                }
                return hostGlobalName;
            }
            else {
                // ... set and return a namespace global reference (only works for routines that support dot-delimited callback references) ...
                if (!alreadyRegistered)
                    nsglobals[name] = initialValue;
                if (/^[A-Z_\$]+[A-Z0-9_\$]*$/gim.test(name)) // (if 'name' contains invalid identifier characters, then it needs to be referenced by index)
                    return DEFAULT_GLOBAL_NS_NAME + ".Globals." + nsID + "." + name;
                else
                    return DEFAULT_GLOBAL_NS_NAME + ".Globals." + nsID + "['" + name.replace(/'/g, "\\'") + "']";
            }
        }
        Globals.register = register;
        ;
        function exists(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            return name in nsglobals;
        }
        Globals.exists = exists;
        ;
        function erase(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return false;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == DS.global) {
                var hgname = existingValue["hostGlobalName"];
                delete DS.global[hgname];
            }
            return nsglobals[name] === void 0;
        }
        Globals.erase = erase;
        ;
        function clear(namespace) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            for (var name in nsglobals) { // (clear any root globals first before resetting the namespace global instance)
                var existingValue = nsglobals[name];
                if (existingValue && existingValue["global"] == DS.global)
                    delete DS.global[existingValue["hostGlobalName"]];
            }
            _globals[nsID] = {};
            return true;
        }
        Globals.clear = clear;
        ;
        function setValue(namespace, name, value) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
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
            if (existingValue && existingValue["global"] == DS.global) {
                return DS.global[existingValue["hostGlobalName"]] = value;
            }
            else
                return nsglobals[name] = value;
        }
        Globals.setValue = setValue;
        ;
        function getValue(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                throw "The namespace '" + namespace + "' does not exist - did you remember to call 'DreamSpace.Globals.register()' first?";
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return void 0;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == DS.global) {
                return DS.global[existingValue["hostGlobalName"]];
            }
            else
                return nsglobals[name];
        }
        Globals.getValue = getValue;
        ;
    })(Globals = DS.Globals || (DS.Globals = {}));
})(DS || (DS = {}));
// ###########################################################################################################################
// ============================================================================================================================
var DS;
(function (DS) {
    // ------------------------------------------------------------------------------------------------------------------------
    /** Used with 'DreamSpace.log(...)' to write to the host console, if available.
      */
    let LogTypes;
    (function (LogTypes) {
        /** An important or critical action was a success. */
        LogTypes[LogTypes["Success"] = -1] = "Success";
        /** General logging information - nothing of great importance (such as writing messages to developers in the console, or perhaps noting the entry/exit of a section of code), but could be good to know during support investigations. */
        LogTypes[LogTypes["Normal"] = 0] = "Normal";
        /** An important action has started, or important information must be noted (usually not debugging related, but could be good to know during support investigations). */
        LogTypes[LogTypes["Info"] = 1] = "Info";
        /** A warning or non critical error has occurred. */
        LogTypes[LogTypes["Warning"] = 2] = "Warning";
        /** A error has occurred (usually critical). */
        LogTypes[LogTypes["Error"] = 3] = "Error";
        /** Debugging details only. In a live system debugging related log writes are ignored. */
        LogTypes[LogTypes["Debug"] = 4] = "Debug";
        /** Usually used with more verbose logging to trace execution. In a live system debugging related log writes are ignored. */
        LogTypes[LogTypes["Trace"] = 5] = "Trace";
    })(LogTypes = DS.LogTypes || (DS.LogTypes = {}));
    /** Logs the message to the console (if available) and returns the message.
      *  By default errors are thrown instead of being returned.  Set 'throwOnError' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {LogTypes} type The type of message to log.
      * @param {boolean} throwOnError If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    function log(title, message, type = LogTypes.Normal, source, throwOnError = true, useLogger = true) {
        if (title === null && message === null)
            return null;
        if (title !== null)
            title = ('' + title).trim();
        if (message !== null)
            message = ('' + message).trim();
        if (title === "" && message === "")
            return null;
        if (title && typeof title == 'string') {
            var _title = title; // (modify a copy so we can continue to pass along the unaltered title text)
            if (_title.charAt(title.length - 1) != ":")
                _title += ":";
            var compositeMessage = _title + " " + message;
        }
        else
            var compositeMessage = message;
        if (console)
            switch (type) {
                case LogTypes.Success:
                    console.log(compositeMessage);
                    break;
                case LogTypes.Normal:
                    console.log(compositeMessage);
                    break;
                case LogTypes.Info:
                    (console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Warning:
                    (console.warn || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Error:
                    (console.error || console.warn || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Debug:
                    (console.debug || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Trace:
                    (console.trace || console.info || console.log).call(console, compositeMessage);
                    break;
            }
        if (useLogger && DS.Diagnostics) {
            if (type == LogTypes.Error) {
                if (throwOnError)
                    if (DS.Exception) {
                        throw DS.Exception.error(title, message, source); // (logs automatically)
                    }
                    else
                        throw new Error(compositeMessage); // (fallback, then try the diagnostics debugger)
            }
            if (DS.Diagnostics && DS.Diagnostics.log)
                DS.Diagnostics.log(title, message, type, false); // (if 'System.Exception' is thrown it will also auto log and this line is never reached)
        }
        else if (throwOnError && type == LogTypes.Error)
            throw new Error(compositeMessage);
        return compositeMessage;
    }
    DS.log = log;
    /** Logs the error message to the console (if available) and throws the error.
      *  By default errors are thrown instead of being returned.  Set 'throwException' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {boolean} throwException If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    function error(title, message, source, throwException = true, useLogger = true) {
        return log(title, message, LogTypes.Error, source, throwException, useLogger);
    }
    DS.error = error;
    // ------------------------------------------------------------------------------------------------------------------------
})(DS || (DS = {}));
// ============================================================================================================================
var DS;
(function (DS) {
    /** Contains functions for working with URI based paths. */
    let Path;
    (function (Path) {
        /** Parses the URL into 1: protocol (without '://'), 2: username, 3: password, 4: host, 5: port, 6: path, 7: query (without '?'), and 8: fragment (without '#'). */
        Path.URL_PARSER_REGEX = /^[\t\f\v ]*(?:(?:(?:(\w+):\/\/|\/\/)(?:(.*?)(?::(.*?))?@)?([^#?/:~\r\n]*))(?::(\d*))?)?([^#?\r\n]+)?(?:\?([^#\r\n]*))?(?:\#(.*))?/m;
        // (testing: https://regex101.com/r/8qnEdP/5)
        /** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
        function parse(url) {
            if (typeof url != 'string')
                url = DS.Utilities.toString(url);
            var m = url.match(Path.URL_PARSER_REGEX);
            return m && new DS.Uri((m[1] || "").trim(), (m[4] || "").trim(), (+(m[5] || "").trim() || "").toString(), (m[6] || "").trim(), (m[7] || "").trim(), (m[8] || "").trim(), (m[2] || "").trim(), (m[3] || "").trim()) || // (just in case it fails somehow...)
                new DS.Uri(void 0, void 0, void 0, url); // (returns the url as is if this is not a proper absolute path)
        }
        Path.parse = parse;
        /**
           * Appends 'path2' to 'path1', inserting a path separator character (/) if required.
           * Set 'normalizePathSeparators' to true to normalize any '\' path characters to '/' instead.
           */
        function combine(path1, path2, normalizePathSeparators = false) {
            if (typeof path1 != 'string')
                path1 = DS.Utilities.toString(path1);
            if (typeof path2 != 'string')
                path2 = DS.Utilities.toString(path2);
            if (path2.charAt(0) == '~')
                path2 = path2.substr(1);
            if (!path2)
                return path1;
            if (!path1)
                return path2;
            if (path1.charAt(path1.length - 1) != '/' && path1.charAt(path1.length - 1) != '\\')
                path1 += '/';
            var combinedPath = path1 + ((path2.charAt(0) == '/' || path2.charAt(0) == '\\') ? path2.substr(1) : path2);
            return normalizePathSeparators ? combinedPath.split('\\').join('/') : combinedPath;
        }
        Path.combine = combine;
        /** Returns the protocol + host + port parts of the given absolute URL. */
        function getRoot(absoluteURL) {
            return (absoluteURL instanceof DS.Uri ? absoluteURL : parse(absoluteURL)).origin();
        }
        Path.getRoot = getRoot;
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
        function resolve(path, currentResourceURL = DS.global.location.href, baseURL = DS.baseURL) {
            baseURL = DS.Utilities.toString(baseURL).trim();
            currentResourceURL = DS.Utilities.toString(currentResourceURL).trim();
            if (currentResourceURL)
                currentResourceURL = parse(currentResourceURL).getResourceURL();
            path = DS.Utilities.toString(path).trim();
            if (!path)
                return currentResourceURL || baseURL;
            if (path.charAt(0) == '/' || path.charAt(0) == '\\') {
                // ... resolve to the root of the host; determine current or base, whichever is available ...
                var parts = currentResourceURL && parse(currentResourceURL) || null;
                if (parts && (parts.protocol || parts.hostName))
                    return combine(getRoot(parts), path);
                else
                    return combine(getRoot(baseURL), path);
            }
            if (path.charAt(0) == '~')
                return combine(baseURL, path);
            // ... check if path is already absolute with a protocol ...
            var parts = parse(path);
            if (parts.protocol || parts.hostName)
                return path; // (already absolute)
            return combine(currentResourceURL || baseURL, path);
        }
        Path.resolve = resolve;
        // TODO: Consider 'absolute()' function to resolve '..' in paths. Resolve the URL first, then modify the final path.
        /** Fixes a URL by splitting it apart, trimming it, then recombining it along with a trailing forward slash (/) at the end. */
        function fix(url) {
            return parse(url).toString();
        }
        Path.fix = fix;
        // ===================================================================================================================
        /** Returns true if the specified extension is missing from the end of 'pathToFile'.
          * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
          * indirectly via a server side script, or handled in some other special way).
          * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
          */
        function hasFileExt(pathToFile, ext) {
            if (ext.length > 0 && ext.charAt(0) != '.')
                ext = '.' + ext;
            return pathToFile.lastIndexOf(ext) == pathToFile.length - ext.length || pathToFile.indexOf("?") >= 0 || pathToFile.indexOf("#") >= 0;
        }
        Path.hasFileExt = hasFileExt;
        // ==========================================================================================================================
        /** Subtracts the current site's base URL from the given URL and returns 'serverWebRoot' with the remained appended. */
        function map(url) {
            if (url.substr(0, DS.baseURL.length).toLocaleLowerCase() == DS.baseURL.toLocaleLowerCase()) {
                // TODO: Make this more robust by parsing and checked individual URL parts properly (like default vs explicit ports in the URL).
                var subpath = url.substr(DS.baseURL.length);
                return combine(DS.global.serverWebRoot, subpath);
            }
            else
                return parse(url).toString(DS.global.serverWebRoot); // (the origin is not the same, so just assume everything after the URL's origin is the path)
        }
        Path.map = map;
    })(Path = DS.Path || (DS.Path = {}));
})(DS || (DS = {}));
var DS;
(function (DS) {
    // ==========================================================================================================================
    DS.QUERY_STRING_REGEX = /[?|&][a-zA-Z0-9-._]+(?:=[^&#$]*)?/gi;
    /**
      * Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
      * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
      * with all values escaped and ready to be appended to a URI.
      * Note: Call 'Query.new()' to create new instances.
      */
    class Query {
        constructor() {
            // ----------------------------------------------------------------------------------------------------------------
            this.values = {};
            // ---------------------------------------------------------------------------------------------------------------
        }
        /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
        * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
        * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
        */
        static init(o, isnew, query, makeNamesLowercase) {
            if (query)
                if (typeof query == 'object')
                    o.addOrUpdate(query, makeNamesLowercase);
                else {
                    if (typeof query != 'string')
                        query = DS.Utilities.toString(query);
                    var nameValuePairs = query.match(DS.QUERY_STRING_REGEX);
                    var i, n, eqIndex, nameValue;
                    if (nameValuePairs)
                        for (var i = 0, n = nameValuePairs.length; i < n; ++i) {
                            nameValue = nameValuePairs[i];
                            eqIndex = nameValue.indexOf('='); // (need to get first instance of the '=' char)
                            if (eqIndex == -1)
                                eqIndex = nameValue.length; // (whole string is the name)
                            if (makeNamesLowercase)
                                o.values[decodeURIComponent(nameValue).substring(1, eqIndex).toLowerCase()] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                            else
                                o.values[decodeURIComponent(nameValue).substring(1, eqIndex)] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                        }
                }
        }
        // ----------------------------------------------------------------------------------------------------------------
        /**
            * Use to add additional query string values. The function returns the current object to allow chaining calls.
            * Example: add({'name1':'value1', 'name2':'value2', ...});
            * Note: Use this to also change existing values.
            * @param {boolean} newValues An object whose properties will be added to the current query.
            * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
            */
        addOrUpdate(newValues, makeNamesLowercase = false) {
            if (newValues)
                for (var pname in newValues)
                    this.values[makeNamesLowercase ? pname.toLocaleLowerCase() : pname] = newValues[pname];
            return this;
        }
        // ---------------------------------------------------------------------------------------------------------------
        /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
            * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
            * Warning: If the new name already exists, it will be replaced.
            */
        rename(newNames) {
            for (var pname in this.values)
                for (var pexistingname in newNames)
                    if (pexistingname == pname && newNames[pexistingname] && newNames[pexistingname] != pname) { // (&& make sure the new name is actually different)
                        this.values[newNames[pexistingname]] = this.values[pexistingname];
                        delete this.values[pexistingname];
                    }
            return this;
        }
        // ---------------------------------------------------------------------------------------------------------------
        /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
            * Example: remove(['name1', 'name2', 'name3']);
            */
        remove(namesToDelete) {
            if (namesToDelete && namesToDelete.length)
                for (var i = 0, n = namesToDelete.length; i < n; ++i)
                    if (this.values[namesToDelete[i]])
                        delete this.values[namesToDelete[i]];
            return this;
        }
        // ---------------------------------------------------------------------------------------------------------------
        /** Creates and returns a duplicate of this object. */
        clone() {
            var q = Query.new();
            for (var pname in this.values)
                q.values[pname] = this.values[pname];
            return q;
        }
        // ---------------------------------------------------------------------------------------------------------------
        appendTo(uri) {
            return uri.match(/^[^\?]*/g)[0] + this.toString();
        }
        // ---------------------------------------------------------------------------------------------------------------
        /** Returns the specified value, or a default value if nothing was found. */
        getValue(name, defaultValueIfUndefined) {
            var value = this.values[name];
            if (value === void 0)
                value = defaultValueIfUndefined;
            return value;
        }
        /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
        getLCValue(name, defaultValueIfUndefined) {
            var value = this.values[name];
            if (value === void 0)
                value = defaultValueIfUndefined;
            return ("" + value).toLowerCase();
        }
        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
        getUCValue(name, defaultValueIfUndefined) {
            var value = this.values[name];
            if (value === void 0)
                value = defaultValueIfUndefined;
            return ("" + value).toUpperCase();
        }
        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
        getNumber(name, defaultValueIfUndefined) {
            var value = parseFloat(this.values[name]);
            if (value === void 0)
                value = defaultValueIfUndefined;
            return value;
        }
        // ---------------------------------------------------------------------------------------------------------------
        /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
            * The existing value is replaced by the encoded value, and the encoded value is returned.
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
        encodeValue(name) {
            var value = this.values[name], result;
            if (value !== void 0 && value !== null) {
                this.values[name] = result = DS.Encoding.base64Encode(value, DS.Encoding.Base64Modes.URI);
            }
            return result;
        }
        /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
            * The existing value is replaced by the decoded value, and the decoded value is returned.
            */
        decodeValue(name) {
            var value = this.values[name], result;
            if (value !== void 0 && value !== null) {
                this.values[name] = result = DS.Encoding.base64Decode(value, DS.Encoding.Base64Modes.URI);
            }
            return result;
        }
        /** Encode ALL query values (see 'encodeValue()').
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
        encodeAll() {
            for (var p in this.values)
                this.encodeValue(p);
        }
        /** Decode ALL query values (see 'encodeValue()').
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
        decodeAll() {
            for (var p in this.values)
                this.decodeValue(p);
        }
        // ---------------------------------------------------------------------------------------------------------------
        /**
           * Converts the underlying query values to a proper search string that can be appended to a URI.
           * @param {boolean} addQuerySeparator If true (the default) prefixes '?' before the returned query string.
           */
        toString(addQuerySeparator = true) {
            var qstr = "";
            for (var pname in this.values)
                if (this.values[pname] !== void 0)
                    qstr += (qstr ? "&" : "") + encodeURIComponent(pname) + "=" + encodeURIComponent(this.values[pname]);
            return (addQuerySeparator ? "?" : "") + qstr;
        }
    }
    DS.Query = Query;
    // ==========================================================================================================================
    /** This is set automatically to the query for the current page. */
    DS.pageQuery = Query.new(DS.global.location.href);
})(DS || (DS = {}));
// ==========================================================================================================================
var DS;
(function (DS) {
    // ===============================================================================================================================
    /**
     * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
     * implementation designed to work better with the DreamSpace system specifically, and to support parallel loading).
     * Note: It is advised to use 'DreamSpace.Loader.loadResource()' to load resources instead of directly creating resource request objects.
     * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
     * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
     */
    class ResourceRequest {
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        constructor(url, type, async) {
            /**
               * The HTTP request method to use, such as "GET" (the default), "POST", "PUT", "DELETE", etc.  Ignored for non-HTTP(S) URLs.
               *
               */
            this.method = "GET";
            this.$__transformedData = DS.noop;
            /** The response code from the XHR response. */
            this.responseCode = 0; // (the response code returned)
            /** The response code message from the XHR response. */
            this.responseMessage = ""; // (the response code message)
            /** The current request status. */
            this.status = DS.RequestStatuses.Pending;
            /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
            this.messageLog = [];
            /**
             * If true (the default) then a '"_="+Date.now()' query item is added to make sure the browser never uses
             * the cache. To change the variable used, set the 'cacheBustingVar' property also.
             * Note: DreamSpace has its own caching that uses the local storage, where supported.
             */
            this.cacheBusting = ResourceRequest.cacheBusting;
            /** See the 'cacheBusting' property. */
            this.cacheBustingVar = ResourceRequest.cacheBustingVar;
            /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
            * There's also an 'on finally' which should execute on success OR failure, regardless.
            * For each entry, only ONE of any callback type will be set.
            */
            this._promiseChain = [];
            this._promiseChainIndex = 0; // (the current position in the event chain)
            this._parentCompletedCount = 0; // (when this equals the # of 'dependents', the all parent resources have loaded [just faster than iterating over them])
            this._paused = false;
            if (url === void 0 || url === null)
                throw "A resource URL is required.";
            if (type === void 0)
                throw "The resource type is required.";
            if (ResourceRequest._resourceRequestByURL[url])
                return ResourceRequest._resourceRequestByURL[url]; // (abandon this new object instance in favor of the one already existing and returned it)
            this.url = url;
            this.type = type;
            this.async = async;
            this.$__index = ResourceRequest._resourceRequests.length;
            ResourceRequest._resourceRequests.push(this);
            ResourceRequest._resourceRequestByURL[this.url] = this;
        }
        /** See the 'cacheBusting' property. */
        static get cacheBustingVar() { return this._cacheBustingVar || '_v_'; }
        ; // (note: ResourceInfo.cs uses this same default)
        static set cacheBustingVar(value) { this._cacheBustingVar = DS.Utilities.toString(value) || '_v_'; }
        ;
        /** The requested resource URL. If the URL string starts with '~/' then it becomes relative to the content type base path. */
        get url() {
            if (typeof this._url == 'string' && this._url.charAt(0) == "~") {
                var _baseURL = DS.basePathFromResourceType(this.type);
                return DS.Path.resolve(this._url, void 0, _baseURL);
            }
            return this._url;
        }
        set url(value) { this._url = value; }
        /** This gets the transformed response as a result of callback handlers (if any).
          * If no transformations were made, then the value in 'response' is returned as is.
          */
        get transformedResponse() {
            return this.$__transformedData === DS.noop ? this.response : this.$__transformedData;
        }
        /**
         * A progress/error message related to the status (may not be the same as the response message).
         * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
         */
        get message() {
            return this._message;
        }
        set message(value) {
            this._message = value;
            this.messageLog.push(this._message);
            if (this.status == DS.RequestStatuses.Error)
                DS.error("ResourceRequest (" + this.url + ")", this._message, this, false); // (send resource loading error messages to the console to aid debugging)
            else
                DS.log("ResourceRequest (" + this.url + ")", this._message, DS.LogTypes.Normal, this);
        }
        _queueDoNext(data) {
            setTimeout(() => {
                // ... before this, fire any handlers that would execute before this ...
                this._doNext();
            }, 0);
        } // (simulate an async response, in case more handlers need to be added next)
        _queueDoError() { setTimeout(() => { this._doError(); }, 0); } // (simulate an async response, in case more handlers need to be added next)
        _requeueHandlersIfNeeded() {
            if (this.status == DS.RequestStatuses.Error)
                this._queueDoError();
            else if (this.status >= DS.RequestStatuses.Waiting) {
                this._queueDoNext(this.response);
            }
            // ... else, not needed, as the chain is still being traversed, so anything added will get run as expected ...
        }
        /** Triggers a success or error callback after the resource loads, or fails to load. */
        then(success, error) {
            if (success !== void 0 && success !== null && typeof success != 'function' || error !== void 0 && error !== null && typeof error !== 'function')
                throw "A handler function given is not a function.";
            else {
                this._promiseChain.push({ onLoaded: success, onError: error });
                this._requeueHandlersIfNeeded();
            }
            if (this.status == DS.RequestStatuses.Waiting || this.status == DS.RequestStatuses.Ready) {
                this.status = DS.RequestStatuses.Loaded; // (back up)
                this.message = "New 'then' handler added.";
            }
            return this;
        }
        /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
          * the dependant request fires its 'onReady' event.
          * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
          */
        include(request) {
            if (!request._parentRequests)
                request._parentRequests = [];
            if (!this._dependants)
                this._dependants = [];
            request._parentRequests.push(this);
            this._dependants.push(request);
            return request;
        }
        /** Returns a promise that hooks into this request. This is provided to support the async/await semantics.
         * When the 'ready()' or 'catch' events fire, the promise is given the resource request instance in both cases.
         * On success the value should be in either the 'transformedResponse' or 'response' properties of the request instance. */
        asPromise() { return new Promise((res, rej) => { this.ready((h) => { res(h); }); this.catch((h) => { res(h); }); }); }
        /**
         * Add a call-back handler for when the request completes successfully.
         * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
         * @param handler
         */
        ready(handler) {
            if (typeof handler == 'function') {
                if (!this._onReady)
                    this._onReady = [];
                this._onReady.push(handler);
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /** Adds a hook into the resource load progress event. */
        while(progressHandler) {
            if (typeof progressHandler == 'function') {
                if (!this._onProgress)
                    this._onProgress = [];
                this._onProgress.push(progressHandler);
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
        abort() {
            if (this._xhr.readyState > XMLHttpRequest.UNSENT && this._xhr.readyState < XMLHttpRequest.DONE) {
                this._xhr.abort();
            }
        }
        /**
         * Provide a handler to catch any errors from this request.
         */
        catch(errorHandler) {
            if (typeof errorHandler == 'function') {
                this._promiseChain.push({ onError: errorHandler });
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /**
         * Provide a handler which should execute on success OR failure, regardless.
         */
        finally(cleanupHandler) {
            if (typeof cleanupHandler == 'function') {
                this._promiseChain.push({ onFinally: cleanupHandler });
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /**
           * Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
           * order).  Regardless of the start order, all scripts are loaded in parallel.
           * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
           * @param {string} method An optional method to override the default request method set in the 'method' property on this request instance.
           * @param {string} body Optional payload data to send, which overrides any value set in the 'payload' property on this request instance.
           * @param {string} username Optional username value, instead of storing the username in the instance.
           * @param {string} password Optional password value, instead of storing the password in the instance.
           */
        start(method, body, username, password) {
            if (this.async)
                setTimeout(() => { this._Start(method, body, username, password); }, 0);
            else
                this._Start();
            return this;
        }
        _Start(_method, _body, _username, _password) {
            // ... start at the top most parent first, and work down ...
            if (this._parentRequests)
                for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                    this._parentRequests[i].start();
            var url = this.url;
            var xhr = this._xhr;
            function loaded(status, statusText, response, responseType) {
                if (status == 200 || status == 304) {
                    this.response = response;
                    this.status == DS.RequestStatuses.Loaded;
                    this.message = status == 304 ? "Loading completed (from browser cache)." : "Loading completed.";
                    // ... check if the expected mime type matches, otherwise throw an error to be safe ...
                    if (this.type && responseType && this.type != responseType) {
                        this.setError("Resource type mismatch: expected type was '" + this.type + "', but received '" + responseType + "' (XHR type '" + xhr.responseType + "').\r\n");
                    }
                    else {
                        if (!DS.isDebugging && typeof DS.global.Storage !== void 0)
                            try {
                                DS.global.localStorage.setItem("version", DS.version);
                                DS.global.localStorage.setItem("appVersion", DS.getAppVersion());
                                DS.global.localStorage.setItem("resource:" + this.url, this.response);
                                this.message = "Resource cached in local storage.";
                            }
                            catch (e) {
                                // .. failed: out of space? ...
                                // TODO: consider saving to web SQL as well, or on failure (as a backup; perhaps create a storage class with this support). //?
                            }
                        else
                            this.message = "Resource not cached in local storage because of debug mode. Release mode will use local storage to help survive clearing DreamSpace files when temporary content files are deleted.";
                        this._doNext();
                    }
                }
                else {
                    this.setError("There was a problem loading the resource (status code " + status + ": " + statusText + ").\r\n");
                }
            }
            ;
            if (this.status == DS.RequestStatuses.Pending) {
                this.status = DS.RequestStatuses.Loading; // (do this first to protect against any possible cyclical calls)
                this.message = "Loading resource ...";
                // ... this request has not been started yet; attempt to load the resource ...
                // ... 1. see first if this file is cached in the web storage, then load it from there instead ...
                //    (ignore the local caching if in debug or the versions are different)
                if (!DS.isDebugging && typeof DS.global.Storage !== void 0)
                    try {
                        var currentAppVersion = DS.getAppVersion();
                        var versionInLocalStorage = DS.global.localStorage.getItem("version");
                        var appVersionInLocalStorage = DS.global.localStorage.getItem("appVersion");
                        if (versionInLocalStorage && appVersionInLocalStorage && DS.version == versionInLocalStorage && currentAppVersion == appVersionInLocalStorage) {
                            // ... all versions match, just pull from local storage (faster) ...
                            this.response = DS.global.localStorage.getItem("resource:" + this.url); // (should return 'null' if not found)
                            if (this.response !== null && this.response !== void 0) {
                                this.status = DS.RequestStatuses.Loaded;
                                this._doNext();
                                return;
                            }
                        }
                    }
                    catch (e) {
                        // ... not supported? ...
                    }
                // ... 2. check web SQL for the resource ...
                // TODO: Consider Web SQL Database as well. (though not supported by IE yet, as usual, but could help greatly on the others) //?
                // ... 3. if not in web storage, try loading from a DreamSpace core system, if available ...
                // TODO: Message DreamSpace core system for resource data. // TODO: need to build the bridge class first.
                // ... next, determine the best way to load the resource ...
                if (XMLHttpRequest) {
                    if (!this._xhr) {
                        this._xhr = isNode ? new (require("xhr2"))() : new XMLHttpRequest();
                        // ... this script is not cached, so load it ...
                        xhr.onreadystatechange = () => {
                            switch (xhr.readyState) {
                                case XMLHttpRequest.UNSENT: break;
                                case XMLHttpRequest.OPENED:
                                    this.message = "Opened connection ...";
                                    break;
                                case XMLHttpRequest.HEADERS_RECEIVED:
                                    this.message = "Headers received ...";
                                    break;
                                case XMLHttpRequest.LOADING: break; // (this will be handled by the progress event)
                                case XMLHttpRequest.DONE:
                                    loaded(xhr.status, xhr.statusText, xhr.response, xhr.getResponseHeader('content-type'));
                                    break;
                            }
                        };
                        xhr.onerror = (ev) => { this.setError(void 0, ev); this._doError(); };
                        xhr.onabort = () => { this.setError("Request aborted."); };
                        xhr.ontimeout = () => { this.setError("Request timed out."); };
                        xhr.onprogress = (evt) => {
                            this.message = Math.round(evt.loaded / evt.total * 100) + "% loaded ...";
                            if (this._onProgress && this._onProgress.length)
                                this._doOnProgress(evt.loaded / evt.total * 100);
                        };
                        // (note: all event 'on...' properties only available in IE10+)
                    }
                }
            }
            else // (this request was already started)
                return;
            if (xhr && xhr.readyState != 0)
                xhr.abort(); // (abort existing, just in case)
            try {
                // ... check if we need to bust the cache ...
                if (this.cacheBusting) {
                    var bustVar = this.cacheBustingVar;
                    if (bustVar.indexOf(" ") >= 0)
                        DS.log("start()", "There is a space character in the cache busting query name for resource '" + url + "'.", DS.LogTypes.Warning);
                }
                if (!_method)
                    _method = this.method || "GET";
                xhr.open(_method, url, this.async, _username || this.username || void 0, _password || this.password || void 0);
            }
            catch (ex) {
                DS.error("start()", "Failed to load resource from URL '" + url + "': " + (ex.message || ex), this);
            }
            try {
                var payload = _body || this.body;
                if (typeof payload == 'object' && payload.__proto__ == Object.prototype) {
                    // (can't send object literals! convert to something else ...)
                    if (_method == 'GET') {
                        var q = DS.Query.new(payload);
                        payload = q.toString(false);
                    }
                    else {
                        if (this.type == DS.ResourceTypes.Application_JSON) {
                            if (typeof payload == 'object')
                                payload = JSON.stringify(payload);
                            xhr.setRequestHeader("Content-Type", DS.ResourceTypes.Application_JSON + ";charset=UTF-8");
                        }
                        var formData = new FormData(); // TODO: Test if "multipart/form-data" is needed.
                        for (var p in payload)
                            formData.append(p, payload[p]);
                        payload = formData;
                    }
                }
                xhr.send(payload);
            }
            catch (ex) {
                DS.error("start()", "Failed to send request to endpoint for URL '" + url + "': " + (ex.message || ex), this);
            }
            //?if (!this.async && (xhr.status)) doSuccess();
        }
        /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
        pause() {
            if (this.status >= DS.RequestStatuses.Pending && this.status < DS.RequestStatuses.Ready
                || this.status == DS.RequestStatuses.Ready && this._onReady.length)
                this._paused = true;
            return this;
        }
        /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
          * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
          */
        continue() {
            if (this._paused) {
                this._paused = false;
                this._requeueHandlersIfNeeded();
            }
            return this;
        }
        _doOnProgress(percent) {
            // ... notify any handlers as well ...
            if (this._onProgress) {
                for (var i = 0, n = this._onProgress.length; i < n; ++i)
                    try {
                        var cb = this._onProgress[i];
                        if (cb)
                            cb.call(this, this);
                    }
                    catch (e) {
                        this._onProgress[i] = null; // (won't be called again)
                        this.setError("'on progress' callback #" + i + " has thrown an error:", e);
                        // ... do nothing, not important ...
                    }
            }
        }
        setError(message, error) {
            if (error) {
                var errMsg = DS.getErrorMessage(error);
                if (errMsg) {
                    if (message)
                        message += " \r\n";
                    message += errMsg;
                }
            }
            this.status = DS.RequestStatuses.Error;
            this.message = message; // (automatically adds to 'this.messages' and writes to the console)
        }
        _doNext() {
            if (this.status == DS.RequestStatuses.Error) {
                this._doError(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                return;
            }
            if (this._onProgress && this._onProgress.length) {
                this._doOnProgress(100);
                this._onProgress.length = 0;
            }
            for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                if (this._paused)
                    return;
                var handlers = this._promiseChain[this._promiseChainIndex]; // (get all the handlers waiting for the result of this request)
                if (handlers.onLoaded) {
                    try {
                        var data = handlers.onLoaded.call(this, this, this.transformedResponse); // (call the handler with the current data and get the resulting data, if any)
                    }
                    catch (e) {
                        this.setError("An 'onLoaded' handler failed.", e);
                        ++this._promiseChainIndex; // (the success callback failed, so trigger the error chain starting at next index)
                        this._doError();
                        return;
                    }
                    if (typeof data === 'object' && data instanceof ResourceRequest) {
                        // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                        if (data.status == DS.RequestStatuses.Error) {
                            this.setError("Rejected request returned from 'onLoaded' handler.");
                            ++this._promiseChainIndex;
                            this._doError(); // (cascade the error)
                            return;
                        }
                        else {
                            // ... get the data from the request object ...
                            var newResReq = data;
                            if (newResReq.status >= DS.RequestStatuses.Ready) {
                                if (newResReq === this)
                                    continue; // ('self' [this] was returned, so go directly to the next item)
                                data = newResReq.transformedResponse; // (the data is ready, so read now)
                            }
                            else { // (loading is started, or still in progress, so wait; we simply hook into the request object to get notified when the data is ready)
                                newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                    .catch((sender) => { this.setError("Resource returned from next handler has failed to load.", sender); this._doError(); });
                                return;
                            }
                        }
                    }
                    if (data !== void 0)
                        this.$__transformedData = data;
                }
                else if (handlers.onFinally) {
                    try {
                        handlers.onFinally.call(this);
                    }
                    catch (e) {
                        this.setError("Cleanup handler failed.", e);
                        ++this._promiseChainIndex; // (the finally callback failed, so trigger the error chain starting at next index)
                        this._doError();
                    }
                }
            }
            this._promiseChain.length = 0;
            this._promiseChainIndex = 0;
            // ... finished: now trigger any "ready" handlers ...
            if (this.status < DS.RequestStatuses.Waiting)
                this.status = DS.RequestStatuses.Waiting; // (default to this next before being 'ready')
            this._doReady(); // (this triggers in dependency order)
        }
        _doReady() {
            if (this._paused)
                return;
            if (this.status < DS.RequestStatuses.Waiting)
                return; // (the 'ready' event must only trigger after the resource loads, AND all handlers have been called)
            // ... check parent dependencies first ...
            if (this.status == DS.RequestStatuses.Waiting)
                if (!this._parentRequests || !this._parentRequests.length) {
                    this.status = DS.RequestStatuses.Ready; // (no parent resource dependencies, so this resource is 'ready' by default)
                    this.message = "Resource has no dependencies, and is now ready.";
                }
                else // ...need to determine if all parent (dependent) resources are completed first ...
                 if (this._parentCompletedCount == this._parentRequests.length) {
                    this.status = DS.RequestStatuses.Ready; // (all parent resource dependencies are now 'ready')
                    this.message = "*** All dependencies for resource have loaded, and are now ready. ***";
                }
                else {
                    this.message = "Resource is waiting on dependencies (" + this._parentCompletedCount + "/" + this._parentRequests.length + " ready so far)...";
                    return; // (nothing more to do yet)
                }
            // ... call the local 'onReady' event, and then trigger the call on the children as required.
            if (this.status == DS.RequestStatuses.Ready) {
                if (this._onReady && this._onReady.length) {
                    try {
                        for (var i = 0, n = this._onReady.length; i < n; ++i) {
                            this._onReady[i].call(this, this);
                            if (this.status < DS.RequestStatuses.Ready)
                                return; // (a callback changed state so stop at this point as we are no longer ready!)
                        }
                        if (this._paused)
                            return;
                    }
                    catch (e) {
                        this.setError("Error in ready handler.", e);
                        if (DS.isDebugging && (this.type == DS.ResourceTypes.Application_Script || this.type == DS.ResourceTypes.Application_ECMAScript))
                            throw e; // (propagate script errors to the browser for debuggers, if any)
                    }
                }
                if (this._dependants)
                    for (var i = 0, n = this._dependants.length; i < n; ++i) {
                        ++this._dependants[i]._parentCompletedCount;
                        this._dependants[i]._doReady(); // (notify all children that this resource is now 'ready' for use [all events have been run, as opposed to just being loaded])
                        if (this.status < DS.RequestStatuses.Ready)
                            return; // (something changed the "Ready" state so abort!)
                    }
            }
        }
        _doError() {
            if (this._paused)
                return;
            if (this.status != DS.RequestStatuses.Error) {
                this._doNext(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                return;
            }
            for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                if (this._paused)
                    return;
                var handlers = this._promiseChain[this._promiseChainIndex];
                if (handlers.onError) {
                    try {
                        var newData = handlers.onError.call(this, this, this.message); // (this handler should "fix" the situation and return valid data)
                    }
                    catch (e) {
                        this.setError("Error handler failed.", e);
                    }
                    if (typeof newData === 'object' && newData instanceof ResourceRequest) {
                        // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                        if (newData.status == DS.RequestStatuses.Error)
                            return; // (no correction made, still in error; terminate the event chain here)
                        else {
                            var newResReq = newData;
                            if (newResReq.status >= DS.RequestStatuses.Ready)
                                newData = newResReq.transformedResponse;
                            else { // (loading is started, or still in progress, so wait)
                                newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                    .catch((sender) => { this.setError("Resource returned from error handler has failed to load.", sender); this._doError(); });
                                return;
                            }
                        }
                    }
                    // ... continue with the value from the error handler (even if none) ...
                    this.status = DS.RequestStatuses.Loaded;
                    this._message = void 0; // (clear the current message [but keep history])
                    ++this._promiseChainIndex; // (pass on to next handler in the chain)
                    this.$__transformedData = newData;
                    this._doNext();
                    return;
                }
                else if (handlers.onFinally) {
                    try {
                        handlers.onFinally.call(this);
                    }
                    catch (e) {
                        this.setError("Cleanup handler failed.", e);
                    }
                }
            }
            // ... if this is reached, then there are no following error handlers, so throw the existing message ...
            if (this.status == DS.RequestStatuses.Error) {
                var msgs = this.messageLog.join("\r\n· ");
                if (msgs)
                    msgs = ":\r\n· " + msgs;
                else
                    msgs = ".";
                throw new Error("Unhandled error loading resource " + (typeof this.type == 'string' ? DS.ResourceTypes[this.type] : this.type) + " from '" + this.url + "'" + msgs + "\r\n");
            }
        }
        /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
          * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
          * @param {boolean} includeDependentResources Reload all resource dependencies as well.
          */
        reload(includeDependentResources = true) {
            if (this.status == DS.RequestStatuses.Error || this.status >= DS.RequestStatuses.Ready) {
                this.response = void 0;
                this.status = DS.RequestStatuses.Pending;
                this.responseCode = 0;
                this.responseMessage = "";
                this._message = "";
                this.messageLog = [];
                if (includeDependentResources)
                    for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                        this._parentRequests[i].reload(includeDependentResources);
                if (this._onProgress)
                    this._onProgress.length = 0;
                if (this._onReady)
                    this._onReady.length = 0;
                if (this._promiseChain)
                    this._promiseChain.length = 0;
                this.start();
            }
            return this;
        }
    }
    /**
     * If true (the default) then a 'ResourceRequest.cacheBustingVar+"="+Date.now()' query item is added to make sure the browser never uses
     * the cache. To change the variable used, set the 'cacheBustingVar' property also.
     * Each resource request instance can also have its own value set separate from the global one.
     * Note: DreamSpace has its own caching that uses the local storage, where supported.
     */
    ResourceRequest.cacheBusting = true;
    ResourceRequest._cacheBustingVar = '_v_';
    ResourceRequest._resourceRequests = []; // (requests are loaded in parallel, but executed in order of request)
    ResourceRequest._resourceRequestByURL = {}; // (a quick named index lookup into '__loadRequests')
    DS.ResourceRequest = ResourceRequest;
    // ===============================================================================================================================
})(DS || (DS = {}));
var DS;
(function (DS) {
    // ========================================================================================================================================
    /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceExtensions' as well implicitly. */
    let ResourceTypes;
    (function (ResourceTypes) {
        // Application
        ResourceTypes["Application_Script"] = "application/javascript";
        ResourceTypes["Application_ECMAScript"] = "application/ecmascript";
        ResourceTypes["Application_JSON"] = "application/json";
        ResourceTypes["Application_ZIP"] = "application/zip";
        ResourceTypes["Application_GZIP"] = "application/gzip";
        ResourceTypes["Application_PDF"] = "application/pdf";
        ResourceTypes["Application_DefaultFormPost"] = "application/x-www-form-urlencoded";
        ResourceTypes["Application_TTF"] = "application/x-font-ttf";
        // Multipart
        ResourceTypes["Multipart_BinaryFormPost"] = "multipart/form-data";
        // Audio
        ResourceTypes["AUDIO_MP4"] = "audio/mp4";
        ResourceTypes["AUDIO_MPEG"] = "audio/mpeg";
        ResourceTypes["AUDIO_OGG"] = "audio/ogg";
        ResourceTypes["AUDIO_AAC"] = "audio/x-aac";
        ResourceTypes["AUDIO_CAF"] = "audio/x-caf";
        // Image
        ResourceTypes["Image_GIF"] = "image/gif";
        ResourceTypes["Image_JPEG"] = "image/jpeg";
        ResourceTypes["Image_PNG"] = "image/png";
        ResourceTypes["Image_SVG"] = "image/svg+xml";
        ResourceTypes["Image_GIMP"] = "image/x-xcf";
        // Text
        ResourceTypes["Text_CSS"] = "text/css";
        ResourceTypes["Text_CSV"] = "text/csv";
        ResourceTypes["Text_HTML"] = "text/html";
        ResourceTypes["Text_Plain"] = "text/plain";
        ResourceTypes["Text_RTF"] = "text/rtf";
        ResourceTypes["Text_XML"] = "text/xml";
        ResourceTypes["Text_JQueryTemplate"] = "text/x-jquery-tmpl";
        ResourceTypes["Text_MarkDown"] = "text/x-markdown";
        // Video
        ResourceTypes["Video_AVI"] = "video/avi";
        ResourceTypes["Video_MPEG"] = "video/mpeg";
        ResourceTypes["Video_MP4"] = "video/mp4";
        ResourceTypes["Video_OGG"] = "video/ogg";
        ResourceTypes["Video_MOV"] = "video/quicktime";
        ResourceTypes["Video_WMV"] = "video/x-ms-wmv";
        ResourceTypes["Video_FLV"] = "video/x-flv";
    })(ResourceTypes = DS.ResourceTypes || (DS.ResourceTypes = {}));
    /** A map of popular resource extensions to resource enum type names.
      * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
      * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
      * Example 3: DreamSpace.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
      * Example 4: DreamSpace.Loader.getResourceTypeFromExtension(".js");
      */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceTypes' as well implicitly. */
    let ResourceExtensions;
    (function (ResourceExtensions) {
        ResourceExtensions["Application_Script"] = ".js";
        ResourceExtensions["Application_ECMAScript"] = ".es";
        ResourceExtensions["Application_JSON"] = ".json";
        ResourceExtensions["Application_ZIP"] = ".zip";
        ResourceExtensions["Application_GZIP"] = ".gz";
        ResourceExtensions["Application_PDF"] = ".pdf";
        ResourceExtensions["Application_TTF"] = ".ttf";
        // Audio
        ResourceExtensions["AUDIO_MP4"] = ".mp4";
        ResourceExtensions["AUDIO_MPEG"] = ".mpeg";
        ResourceExtensions["AUDIO_OGG"] = ".ogg";
        ResourceExtensions["AUDIO_AAC"] = ".aac";
        ResourceExtensions["AUDIO_CAF"] = ".caf";
        // Image
        ResourceExtensions["Image_GIF"] = ".gif";
        ResourceExtensions["Image_JPEG"] = ".jpeg";
        ResourceExtensions["Image_PNG"] = ".png";
        ResourceExtensions["Image_SVG"] = ".svg";
        ResourceExtensions["Image_GIMP"] = ".xcf";
        // Text
        ResourceExtensions["Text_CSS"] = ".css";
        ResourceExtensions["Text_CSV"] = ".csv";
        ResourceExtensions["Text_HTML"] = ".html";
        ResourceExtensions["Text_Plain"] = ".txt";
        ResourceExtensions["Text_RTF"] = ".rtf";
        ResourceExtensions["Text_XML"] = ".xml";
        ResourceExtensions["Text_JQueryTemplate"] = ".tpl.htm";
        ResourceExtensions["Text_MarkDown"] = ".markdown";
        // Video
        ResourceExtensions["Video_AVI"] = ".avi";
        ResourceExtensions["Video_MPEG"] = ".mpeg";
        ResourceExtensions["Video_MP4"] = ".mp4";
        ResourceExtensions["Video_OGG"] = ".ogg";
        ResourceExtensions["Video_MOV"] = ".qt";
        ResourceExtensions["Video_WMV"] = ".wmv";
        ResourceExtensions["Video_FLV"] = ".flv";
    })(ResourceExtensions = DS.ResourceExtensions || (DS.ResourceExtensions = {}));
    ResourceExtensions['.tpl.html'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
    ResourceExtensions['.tpl'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
    function getResourceTypeFromExtension(ext) {
        if (ext === void 0 || ext === null)
            return void 0;
        var _ext = "" + ext; // (make sure it's a string)
        if (_ext.charAt(0) != '.')
            _ext = '.' + _ext; // (a period is required)
        return ResourceTypes[ResourceExtensions[ext]];
    }
    DS.getResourceTypeFromExtension = getResourceTypeFromExtension;
    let RequestStatuses;
    (function (RequestStatuses) {
        /** The request has not been executed yet. */
        RequestStatuses[RequestStatuses["Pending"] = 0] = "Pending";
        /** The resource failed to load.  Check the request object for the error details. */
        RequestStatuses[RequestStatuses["Error"] = 1] = "Error";
        /** The requested resource is loading. */
        RequestStatuses[RequestStatuses["Loading"] = 2] = "Loading";
        /** The requested resource has loaded (nothing more). */
        RequestStatuses[RequestStatuses["Loaded"] = 3] = "Loaded";
        /** The requested resource is waiting on parent resources to complete. */
        RequestStatuses[RequestStatuses["Waiting"] = 4] = "Waiting";
        /** The requested resource is ready to be used. */
        RequestStatuses[RequestStatuses["Ready"] = 5] = "Ready";
        /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
        RequestStatuses[RequestStatuses["Executed"] = 6] = "Executed";
    })(RequestStatuses = DS.RequestStatuses || (DS.RequestStatuses = {}));
    /**
     * Returns the base path based on the resource type.
     */
    function basePathFromResourceType(resourceType) {
        return (resourceType == ResourceTypes.Application_Script || resourceType == ResourceTypes.Application_ECMAScript) ? DS.baseScriptsURL :
            resourceType == ResourceTypes.Text_CSS ? DS.baseCSSURL : DS.baseURL;
    }
    DS.basePathFromResourceType = basePathFromResourceType;
    // ========================================================================================================================================
})(DS || (DS = {}));
// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    let StringUtils;
    (function (StringUtils) {
        /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
        function replace(source, replaceWhat, replaceWith, ignoreCase) {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string')
                source = "" + source;
            if (typeof replaceWhat !== 'string')
                replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string')
                replaceWith = "" + replaceWith;
            return source.replace(new RegExp(DS.Utilities.escapeRegex(replaceWhat), ignoreCase ? 'gi' : 'g'), replaceWith);
        }
        StringUtils.replace = replace;
        /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
        function replaceTags(html, tagReplacement) {
            return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
        }
        StringUtils.replaceTags = replaceTags;
        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
          * specified fixed length, then the request is ignored, and the given string is returned.
          * @param {any} str The string to pad.
          * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
          * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
          * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
          */
        function pad(str, fixedLength, leftPadChar, rightPadChar) {
            if (str === void 0)
                str = "";
            if (leftPadChar === void 0 || leftPadChar === null)
                leftPadChar = "";
            if (rightPadChar === void 0 || rightPadChar === null)
                rightPadChar = "";
            var s = "" + str, targetLength = fixedLength > 0 ? fixedLength : 0, remainder = targetLength - s.length, lchar = "" + leftPadChar, rchar = "" + rightPadChar, llen, rlen, lpad = "", rpad = "";
            if (remainder <= 0 || (!lchar && !rchar))
                return str;
            if (lchar && rchar) {
                llen = Math.floor(remainder / 2);
                rlen = targetLength - llen;
            }
            else if (lchar)
                llen = remainder;
            else if (rchar)
                rlen = remainder;
            lpad = DS.global.Array(llen).join(lchar); // (https://stackoverflow.com/a/24398129/1236397)
            rpad = DS.global.Array(rlen).join(rchar);
            return lpad + s + rpad;
        }
        StringUtils.pad = pad;
        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        function append(source, suffix, delimiter) {
            if (source === void 0)
                source = "";
            else if (typeof source != 'string')
                source = '' + source;
            if (typeof suffix != 'string')
                suffix = '' + suffix;
            if (typeof delimiter != 'string')
                delimiter = '' + delimiter;
            if (!source)
                return suffix;
            return source + delimiter + suffix;
        }
        StringUtils.append = append;
        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        function prepend(source, prefix, delimiter) {
            if (source === void 0)
                source = "";
            else if (typeof source != 'string')
                source = '' + source;
            if (typeof prefix != 'string')
                prefix = '' + prefix;
            if (typeof delimiter != 'string')
                delimiter = '' + delimiter;
            if (!source)
                return prefix;
            return prefix + delimiter + source;
        }
        StringUtils.prepend = prepend;
        /** Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups]). */
        function matches(regex, text) {
            return DS.Utilities.matches(regex, this.toString());
        }
        StringUtils.matches = matches;
        /** Splits the lines of the text (delimited by '\r\n', '\r', or '\n') into an array of strings. */
        function getLines(text) {
            var txt = typeof text == 'string' ? text : '' + text;
            return txt.split(/\r\n|\n|\r/gm);
        }
        StringUtils.getLines = getLines;
        /** Adds a line number margin to the given text and returns the result. This is useful when display script errors.
        * @param {string} text The text to add line numbers to.
        * @param {Function} lineFilter An optional function to run on every line that should return new line text, or undefined to skip a line.
        */
        function addLineNumbersToText(text, lineFilter) {
            var lines = this.getLines(text);
            var marginSize = lines.length.toString().length + 1; // (used to find the max padding length; +1 for the period [i.e. '  1.'])
            if (lineFilter && typeof lineFilter != 'function')
                lineFilter = null;
            for (var i = 0, n = lines.length, line, _line; i < n; ++i) {
                line = lines[i];
                var lineNumStr = (1 + i) + '.';
                var paddedLineNumStr = this.pad(lineNumStr, marginSize, ' ');
                lines[i] = lineFilter && (_line = lineFilter(1 + i, marginSize, paddedLineNumStr, line)) !== void 0 && _line !== null && _line || paddedLineNumStr + " " + line;
            }
            return lines.join("\r\n");
        }
        StringUtils.addLineNumbersToText = addLineNumbersToText;
    })(StringUtils = DS.StringUtils || (DS.StringUtils = {}));
    // ========================================================================================================================
    let Encoding;
    (function (Encoding) {
        let Base64Modes;
        (function (Base64Modes) {
            /** Use standard Base64 encoding characters. */
            Base64Modes[Base64Modes["Standard"] = 0] = "Standard";
            /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
            Base64Modes[Base64Modes["URI"] = 1] = "URI";
            /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
            * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
            */
            Base64Modes[Base64Modes["Custom"] = 2] = "Custom";
        })(Base64Modes = Encoding.Base64Modes || (Encoding.Base64Modes = {}));
        ;
        Encoding.__64BASE_ENCODING_CHARS_STANDARD = DS.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
        Encoding.__64BASE_ENCODING_CHARS_URI = DS.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_%3D"); // (note: %3D is treaded as one char [an % encoded '='])
        Encoding.__64BASE_ENCODING_CHARS_CUSTOM = Encoding.__64BASE_ENCODING_CHARS_STANDARD;
        // (Note: There must be exactly 65 characters [64 + 1 for padding])
        // (Note: 'String' objects MUST be used in order for the encoding functions to populate the reverse lookup indexes)
        function __CreateCharIndex(str) {
            if (str.length < 65)
                throw DS.Exception.from("65 characters expected for base64 encoding characters (last character is for padding), but only " + str.length + " were specified.", str);
            if (typeof str !== "object" && !(str instanceof String))
                throw DS.Exception.from("The encoding characters must be set in a valid 'String' OBJECT (not as a string VALUE).");
            if (!str['charIndex']) {
                var index = {};
                for (var i = 0, n = str.length; i < n; ++i)
                    index[str[i]] = i;
                str['charIndex'] = index;
            }
        }
        /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
        *                             Exception: If the mode is URI encoding, then padding is false by default.
        */
        function base64Encode(value, mode = Base64Modes.Standard, usePadding) {
            if (value === void 0 || value === null)
                value = "";
            else
                value = "" + value;
            if (value.length == 0)
                return "";
            if (usePadding === void 0)
                usePadding = (mode != Base64Modes.URI);
            var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...
            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);
            // ... determine the character bit depth ...
            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            for (var i = value.length - 1; i >= 0; --i)
                if (value.charCodeAt(i) > 255) {
                    srcCharBitDepth = 16; // (Unicode mode [16-bit])
                    value = DS.global.String.fromCharCode(0) + value; // (note: 0 is usually understood to be a null character, and is used here to flag Unicode encoding [two 0 bytes at the beginning])
                    break;
                }
            var shiftCount = srcCharBitDepth - 1;
            var bitClearMask = (1 << shiftCount) - 1;
            // ... encode the values as a virtual stream of bits, from one buffer to another ...
            var readIndex = 0, readBitIndex = srcCharBitDepth;
            var writeBitIndex = 0;
            var code, bit, baseCode = 0;
            var result = "";
            var paddingLength = usePadding ? (3 - Math.floor(value.length * (srcCharBitDepth / 8) % 3)) : 0;
            if (paddingLength == 3)
                paddingLength = 0;
            while (true) {
                if (readBitIndex == srcCharBitDepth) {
                    if (readIndex >= value.length) {
                        // ... finished ...
                        if (writeBitIndex > 0) // (this will be 0 for strings evenly divisible by 3)
                            result += encodingChars.charAt(baseCode << (6 - writeBitIndex)); // (set remaining code [shift left to fill zeros as per spec])
                        if (usePadding && paddingLength) {
                            var paddingChar = encodingChars.substring(64);
                            while (paddingLength--)
                                result += paddingChar;
                        }
                        break;
                    }
                    readBitIndex = 0;
                    code = value.charCodeAt(readIndex++);
                }
                bit = code >> shiftCount;
                code = (code & bitClearMask) << 1;
                ++readBitIndex;
                baseCode = (baseCode << 1) | bit;
                ++writeBitIndex;
                if (writeBitIndex == 6) {
                    writeBitIndex = 0;
                    result += encodingChars.charAt(baseCode);
                    baseCode = 0;
                }
            }
            return result;
        }
        Encoding.base64Encode = base64Encode;
        /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        */
        function base64Decode(value, mode = Base64Modes.Standard) {
            if (value === void 0 || value === null)
                value = "";
            else
                value = "" + value;
            if (value.length == 0)
                return "";
            var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...
            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);
            // ... determine the character bit depth ...
            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            if (value.charAt(0) == 'A') // (normal ASCII encoded characters will never start with "A" (a 'null' character), so this serves as the Unicode flag)
                srcCharBitDepth = 16;
            var shiftCount = srcCharBitDepth - 1;
            var bitClearMask = (1 << shiftCount) - 1;
            // ... remove the padding characters (not required) ...
            var paddingChar = encodingChars.substring(64);
            while (value.substring(value.length - paddingChar.length) == paddingChar)
                value = value.substring(0, value.length - paddingChar.length);
            var resultLength = Math.floor((value.length * 6) / 8) / (srcCharBitDepth / 8); // (Base64 produces 4 characters for every 3 input bytes)
            // (note: resultLength includes the null char)
            // ... decode the values as a virtual stream of bits, from one buffer to another ...
            var readIndex = 0, readBitIndex = 6;
            var writeBitIndex = 0;
            var code, bit, baseCode = 0;
            var result = "";
            var charCount = 0;
            while (true) {
                if (readBitIndex == 6) {
                    readBitIndex = 0;
                    code = readIndex < value.length ? encodingChars['charIndex'][value.charAt(readIndex++)] : 0;
                    if (code === void 0)
                        throw DS.Exception.from("The value '" + value + "' has one or more invalid characters.  Valid characters for the specified encoding mode '" + Base64Modes[mode] + "' are: '" + encodingChars + "'");
                }
                bit = code >> 5; // (read left most bit; base64 values are always 6 bit)
                code = (code & 31) << 1; // (clear left most bit and shift left)
                ++readBitIndex;
                baseCode = (baseCode << 1) | bit;
                ++writeBitIndex;
                if (writeBitIndex == srcCharBitDepth) {
                    writeBitIndex = 0;
                    if (baseCode) // (should never be 0 [null char])
                        result += DS.global.String.fromCharCode(baseCode);
                    if (++charCount >= resultLength)
                        break; // (all expected characters written)
                    baseCode = 0;
                }
            }
            return result;
        }
        Encoding.base64Decode = base64Decode;
    })(Encoding = DS.Encoding || (DS.Encoding = {}));
    // ========================================================================================================================
    class HTML {
    }
    DS.HTML = HTML;
    (function (HTML) {
        // --------------------------------------------------------------------------------------------------------------------
        // Removes the '<!-- -->' comment sequence from the ends of the specified HTML.
        function uncommentHTML(html) {
            var content = ("" + html).trim();
            var i1 = 0, i2 = content.length;
            if (content.substring(0, 4) == "<!--")
                i1 = 4;
            if (content.substr(content.length - 3) == "-->")
                i2 -= 3;
            if (i1 > 0 || i2 < content.length)
                content = content.substring(i1, i2);
            return content;
        }
        HTML.uncommentHTML = uncommentHTML;
        // --------------------------------------------------------------------------------------------------------------------
        // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
        function getCommentText(html) {
            var content = ("" + html).trim();
            var i1 = content.indexOf("<!--"), i2 = content.lastIndexOf("-->");
            if (i1 < 0)
                i1 = 0;
            if (i2 < 0)
                i2 = content.length;
            return content.substring(i1, i2);
        }
        HTML.getCommentText = getCommentText;
        // --------------------------------------------------------------------------------------------------------------------
        // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
        function getScriptCommentText(html) {
            var content = ("" + html).trim();
            var i1 = content.indexOf("/*"), i2 = content.lastIndexOf("*/");
            if (i1 < 0)
                i1 = 0;
            if (i2 < 0)
                i2 = content.length;
            return content.substring(i1, i2);
        }
        HTML.getScriptCommentText = getScriptCommentText;
        // --------------------------------------------------------------------------------------------------------------------
    })(HTML = DS.HTML || (DS.HTML = {}));
})(DS || (DS = {}));
// ############################################################################################################################
// ###########################################################################################################################
// Types for time management.
// ###########################################################################################################################
var DS;
(function (DS) {
    // =======================================================================================================================
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
        constructor(year, dayOfYear, hours, minutes, seconds, milliseconds) {
            if (arguments.length <= 3)
                this.setTime(year);
            else
                this.setTime(TimeSpan.msFromTime(year, dayOfYear, hours, minutes, seconds, milliseconds));
        }
        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
        /** Returns the time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        static getTimeZoneOffset() { return DS.Time.__localTimeZoneOffset; }
        /** Creates a TimeSpan object from the current value returned by calling 'Date.now()', or 'new Date().getTime()' if 'now()' is not supported. */
        static now() { return Date.now ? new TimeSpan(Date.now()) : TimeSpan.fromDate(new Date()); }
        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
        static utcTimeToLocalYear(timeInMs) {
            return DS.Time.__EpochYear + Math.floor(((timeInMs || 0) - DS.Time.__localTimeZoneOffset) / (DS.Time.__actualDaysPerYear * DS.Time.__millisecondsPerDay));
        }
        static utcTimeToLocalDayOfYear(timeInMs) {
            timeInMs = (timeInMs || 0) - DS.Time.__localTimeZoneOffset;
            var days = TimeSpan.daysSinceEpoch(DS.Time.__EpochYear + Math.floor(timeInMs / (DS.Time.__actualDaysPerYear * DS.Time.__millisecondsPerDay)));
            var timeInMs = timeInMs - days * DS.Time.__millisecondsPerDay;
            return 1 + Math.floor(timeInMs / DS.Time.__millisecondsPerDay);
        }
        static utcTimeToLocalHours(timeInMs) {
            return Math.floor(((timeInMs || 0) - DS.Time.__localTimeZoneOffset) / DS.Time.__millisecondsPerDay % 1 * DS.Time.__hoursPerDay);
        }
        static utcTimeToLocalMinutes(timeInMs) {
            return Math.floor(((timeInMs || 0) - DS.Time.__localTimeZoneOffset) / DS.Time.__millisecondsPerHour % 1 * DS.Time.__minsPerHour);
        }
        static utcTimeToLocalSeconds(timeInMs) {
            return Math.floor(((timeInMs || 0) - DS.Time.__localTimeZoneOffset) / DS.Time.__millisecondsPerMinute % 1 * DS.Time.__secondsPerMinute);
        }
        static utcTimeToLocalMilliseconds(timeInMs) {
            return Math.floor(((timeInMs || 0) - DS.Time.__localTimeZoneOffset) / DS.Time.__millisecondsPerSecond % 1 * DS.Time.__millisecondsPerSecond);
        }
        static utcTimeToLocalTime(timeInMs) {
            return new TimeSpan((timeInMs || 0) - DS.Time.__localTimeZoneOffset);
        }
        /** Creates and returns a TimeSpan that represents the date object.
           * This relates to the 'date.getTime()' function, which returns the internal date span in milliseconds (from Epoch) with the time zone added.
           * See also: fromLocalDateAsUTC().
           */
        static fromDate(date) {
            if (!date.valueOf || isNaN(date.valueOf()))
                return null; // (date is invalid)
            return new TimeSpan(date.getTime()); // (note: 'getTime()' returns the UTC time)
        }
        /**
           * Creates and returns a TimeSpan that represents the date object's localized time as Coordinated Universal Time (UTC).
           * Note: This removes the time zone added to 'date.getTime()' to make a TimeSpan with localized values, but remember that values in a TimeSpan
           * instance always represent UTC time by default.
           * See also: fromDate().
           */
        static fromLocalDateAsUTC(date) {
            if (!date.valueOf || isNaN(date.valueOf()))
                return null; // (date is invalid)
            return TimeSpan.utcTimeToLocalTime(date.getTime()); // (note: 'getTime()' returns the UTC time)
        }
        static __parseSQLDateTime(dateString) {
            dateString = dateString.replace(' ', 'T'); // TODO: Make more compliant.
            var ms = Date.parse(dateString);
            ms += DS.Time.__localTimeZoneOffset;
            return new TimeSpan(ms); // (the parsed date will have the time zone added)
        }
        /** Creates and returns a TimeSpan that represents the specified date string as the local time.
            * Note: The 'Date.parse()' function is used to parse the text, so any ISO-8601 formatted dates (YYYY-MM-DDTHH:mm:ss.sssZ) will be treated as UTC
            * based (no time zone applied). You can detect such cases using 'isISO8601()', or call 'parseLocal()' instead.
            * This function also supports the SQL standard Date/Time format (see 'isSQLDateTime()'), which is not supported in IE (yet).
            */
        static parse(dateString) {
            if (TimeSpan.isSQLDateTime(dateString, true))
                return TimeSpan.__parseSQLDateTime(dateString);
            var ms = Date.parse(dateString);
            if (isNaN(ms))
                return null; // (date is invalid)
            return new TimeSpan(ms); // (the parsed date will have the time zone added)
        }
        ///** Creates and returns a TimeSpan that represents the specified date string as the local time, regardless if an ISO based date is given or not.
        //* This function also supports the SQL standard Date/Time format (see 'isSQLDateTime()'), which is not supported in IE.
        //*/
        //??static parseLocal(dateString: string): TimeSpan {
        //    var ms = Date.parse(dateString);
        //    if (isNaN(ms)) return null; // (date is invalid)
        //    if (TimeSpan.isISO8601(dateString))
        //        ms += TimeSpan.__localTimeZoneOffset;
        //    return new TimeSpan(ms); // (the parsed date will have the time zone added)
        //}
        /** Creates and returns a TimeSpan that represents the specified date string as Coordinated Universal Time (UTC). */
        static parseAsUTC(dateString) {
            var ms = Date.parse(dateString);
            if (isNaN(ms))
                return null; // (date is invalid)
            return TimeSpan.utcTimeToLocalTime(ms);
        }
        /** Returns true if the specified date is in the ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
             * Since JavaScript 'Date' objects parse ISO strings as UTC based (not localized), this function help detect such cases.
             * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time, or date+time+timezone).
             */
        static isISO8601(dateStr) {
            return DS.Time.__ISO8601RegEx.test(dateStr);
        }
        /** Returns true if the specified date is in the standard SQL based Date/Time format (YYYY-MM-DD HH:mm:ss.sss+ZZ).
            * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time).
            * @param (boolean) requireTimeMatch If true, the space delimiter and time part MUST exist for the match, otherwise the date portion is only
            * required.  It's important to note that the date part of the ISO 8601 format is the same as the standard SQL Date/Time, and browsers will
            * treat the date portion of the SQL date as an ISO 8601 date at UTC+0.
            */
        static isSQLDateTime(dateStr, requireTimeMatch = false) {
            return requireTimeMatch ?
                DS.Time.__SQLDateTimeStrictRegEx.test(dateStr)
                : DS.Time.__SQLDateTimeRegEx.test(dateStr);
        }
        /** Calculates the number of leap days since Epoch up to a given year (note: cannot be less than the Epoch year [1970]). */
        static daysSinceEpoch(year) {
            if (year < DS.Time.__EpochYear)
                throw DS.Exception.from("Invalid year: Must be <= " + DS.Time.__EpochYear);
            year = Math.floor(year - DS.Time.__EpochYear); // (NOTE: 'year' is a DIFFERENCE after this, NOT the actual year)
            return 365 * year
                + Math.floor((year + 1) / 4)
                - Math.floor((year + 69) / 100)
                + Math.floor((year + 369) / 400); // (+1, +69, and +369 because the year is delta from Epoch)
        }
        /** Calculates the number of years from the specified milliseconds, taking leap years into account. */
        static yearsSinceEpoch(ms) {
            var mpy = DS.Time.__millisecondsPerYear, mpd = DS.Time.__millisecondsPerDay;
            return DS.Time.__EpochYear + Math.floor((ms - Math.floor((ms + mpy) / (4 * mpy)) * mpd
                - Math.floor((ms + 69 * mpy) / (100 * mpy)) * mpd
                + Math.floor((ms + 369 * mpy) / (400 * mpy)) * mpd) / mpy);
        }
        static isLeapYear(year) {
            return (((year % 4 == 0) && (year % 100 != 0)) || year % 400 == 0);
        }
        static msFromTime(year = DS.Time.__EpochYear, dayOfYear = 1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
            return TimeSpan.daysSinceEpoch(year) * DS.Time.__millisecondsPerDay
                + (dayOfYear - 1) * DS.Time.__millisecondsPerDay
                + hours * DS.Time.__millisecondsPerHour
                + minutes * DS.Time.__millisecondsPerMinute
                + seconds * DS.Time.__millisecondsPerSecond
                + milliseconds;
        }
        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
        /** Returns the time zone as a string in the format "UTC[+/-]####".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getTimeZoneSuffix(timezoneOffsetInMs = DS.Time.__localTimeZoneOffset) {
            var tzInHours = -(timezoneOffsetInMs / DS.Time.__millisecondsPerHour);
            var hours = Math.abs(tzInHours);
            return "UTC" + (tzInHours >= 0 ? "+" : "-")
                + DS.StringUtils.pad(Math.floor(hours), 2, '0')
                + DS.StringUtils.pad(Math.floor(hours % 1 * DS.Time.__minsPerHour), 2, '0');
        }
        /** Returns the ISO-8601 time zone as a string in the format "[+/-]hh:mm:ss.sssZ".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getISOTimeZoneSuffix(timezoneOffsetInMs = DS.Time.__localTimeZoneOffset) {
            var tzInHours = -(timezoneOffsetInMs / DS.Time.__millisecondsPerHour);
            var hours = Math.abs(tzInHours);
            var minutes = Math.abs(hours % 1 * DS.Time.__minsPerHour);
            var seconds = minutes % 1 * DS.Time.__secondsPerMinute;
            return (tzInHours >= 0 ? "+" : "-")
                + DS.StringUtils.pad(hours, 2, '0') + ":"
                + DS.StringUtils.pad(minutes, 2, '0') + ":"
                + DS.StringUtils.pad(Math.floor(seconds), 2, '0') + "."
                + DS.StringUtils.pad(Math.floor(seconds % 1 * 1000), 3, null, '0') // (1000th decimal precision)
                + "Z";
        }
        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
        /** Set the time of this TimeSpan, in milliseconds.
            * Note: This function assumes that milliseconds representing leap year days are included (same as the JavaScript 'Date' object).
            */
        setTime(timeInMs) {
            if (!isNaN(timeInMs)) {
                var ms = this.__ms = timeInMs || 0;
                this.__date = null;
                var daysToYear = TimeSpan.daysSinceEpoch(this.year = TimeSpan.yearsSinceEpoch(ms));
                var msRemaining = ms - daysToYear * DS.Time.__millisecondsPerDay;
                this.dayOfYear = 1 + Math.floor(msRemaining / DS.Time.__millisecondsPerDay);
                msRemaining -= (this.dayOfYear - 1) * DS.Time.__millisecondsPerDay;
                this.hours = Math.floor(msRemaining / DS.Time.__millisecondsPerHour);
                msRemaining -= this.hours * DS.Time.__millisecondsPerHour;
                this.minutes = Math.floor(msRemaining / DS.Time.__millisecondsPerMinute);
                msRemaining -= this.minutes * DS.Time.__millisecondsPerMinute;
                this.seconds = Math.floor(msRemaining / DS.Time.__millisecondsPerSecond);
                msRemaining -= this.seconds * DS.Time.__millisecondsPerSecond;
                this.milliseconds = msRemaining;
            }
            return this;
        }
        /** Returns the internal millisecond total for this TimeSpan.
            * Note:
            */
        getTime() { return this.__ms; }
        add(yearOrTimeInMS = 0, dayOfYearOffset = 0, hoursOffset = 0, minutesOffset = 0, secondsOffset = 0, msOffset = 0) {
            if (arguments.length == 1)
                this.setTime(this.__ms += (yearOrTimeInMS || 0));
            else
                this.setTime(this.__ms += TimeSpan.msFromTime(DS.Time.__EpochYear + yearOrTimeInMS, 1 + dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset));
            return this;
        }
        subtract(yearOrTimeInMS = 0, dayOfYearOffset = 0, hoursOffset = 0, minutesOffset = 0, secondsOffset = 0, msOffset = 0) {
            if (arguments.length == 1)
                this.setTime(this.__ms -= (yearOrTimeInMS || 0));
            else
                this.setTime(this.__ms -= TimeSpan.msFromTime(DS.Time.__EpochYear + yearOrTimeInMS, 1 + dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset));
            return this;
        }
        /** Returns the time span as a string (note: this is NOT a date string).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            * @param {boolean} includeTimezone If true (default), the time zone part is included.
            * Note: This is ignored if 'includeTime' is false.
            */
        toString(includeTime = true, includeMilliseconds = true, includeTimezone = true) {
            if (!this.__localTS)
                this.__localTS = new TimeSpan(this.toValue() - DS.Time.__localTimeZoneOffset);
            var localTS = this.__localTS;
            return "Year " + DS.StringUtils.pad(localTS.year, 4, '0') + ", Day " + DS.StringUtils.pad(localTS.dayOfYear, 3, '0')
                + (includeTime ? " " + DS.StringUtils.pad(localTS.hours, 2, '0') + ":" + DS.StringUtils.pad(localTS.minutes, 2, '0') + ":" + DS.StringUtils.pad(localTS.seconds, 2, '0')
                    + (includeMilliseconds && localTS.milliseconds ? ":" + localTS.milliseconds : "")
                    + (includeTimezone ? " " + TimeSpan.getTimeZoneSuffix() : "")
                    : "");
        }
        /** Returns the time span as a string (note: this is NOT a date string).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            */
        toUTCString(includeTime = true, includeMilliseconds = true) {
            return "Year " + DS.StringUtils.pad(this.year, 4, '0') + ", Day " + DS.StringUtils.pad(this.dayOfYear, 3, '0')
                + (includeTime ? " " + DS.StringUtils.pad(this.hours, 2, '0') + ":" + DS.StringUtils.pad(this.minutes, 2, '0') + ":" + DS.StringUtils.pad(this.seconds, 2, '0')
                    + (includeMilliseconds && this.milliseconds ? ":" + this.milliseconds : "")
                    : "");
        }
        /** Returns the time span as a local string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            * @param {boolean} includeTimezone If true (default), the time zone part is included.
            * Note: This is ignored if 'includeTime' is false.
            */
        toISODateString(includeTime = true, includeMilliseconds = true, includeTimezone = true) {
            if (!this.__date)
                this.__date = new Date(this.toValue());
            return DS.StringUtils.pad(this.__date.getFullYear(), 4, '0') + "-" + DS.StringUtils.pad(1 + this.__date.getMonth(), 2, '0') + "-" + DS.StringUtils.pad(this.__date.getDate(), 2, '0')
                + (includeTime ? "T" + DS.StringUtils.pad(this.__date.getHours(), 2, '0') + ":" + DS.StringUtils.pad(this.__date.getMinutes(), 2, '0') + ":" + DS.StringUtils.pad(this.__date.getSeconds(), 2, '0')
                    + (includeMilliseconds && this.__date.getMilliseconds() ? "." + this.__date.getMilliseconds() : "")
                    + (includeTimezone ? TimeSpan.getISOTimeZoneSuffix() : "")
                    : "");
        }
        /** Returns the time span as a Coordinated Universal Time (UTC) string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
            * To exclude milliseconds, set 'includeMilliseconds' false.
            * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
            * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
            * Note: This is ignored if 'includeTime' is false.
            * @param {boolean} includeTimezone If true (default), the time zone part is included.
            * Note: This is ignored if 'includeTime' is false.
            */
        toUTCISODateString(includeTime = true, includeMilliseconds = true, includeTimezone = true) {
            if (!this.__date)
                this.__date = new Date(this.toValue());
            return DS.StringUtils.pad(this.year, 4, '0') + "-" + DS.StringUtils.pad(1 + this.__date.getUTCMonth(), 2, '0') + "-" + DS.StringUtils.pad(this.__date.getUTCDate(), 2, '0')
                + (includeTime ? "T" + DS.StringUtils.pad(this.hours, 2, '0') + ":" + DS.StringUtils.pad(this.minutes, 2, '0') + ":" + DS.StringUtils.pad(this.seconds, 2, '0')
                    + (includeMilliseconds && this.milliseconds ? "." + this.milliseconds : "")
                    + (includeTimezone ? TimeSpan.getISOTimeZoneSuffix(0) : "")
                    : "");
        }
        toValue() {
            return this.__ms;
        }
    }
    DS.TimeSpan = TimeSpan;
})(DS || (DS = {}));
// ###########################################################################################################################
// Notes:
//   * https://stackoverflow.com/questions/20028945/calculation-of-leap-years-doesnt-seem-to-match-javascript-date
// ############################################################################################################################
var DS;
(function (DS) {
    /** The result of 'Path.parse()', and also helps building URLs manually. */
    class Uri {
        constructor(
        /** Protocol (without '://'). */
        protocol, 
        /** URL host. */
        hostName, 
        /** Host port. */
        port, 
        /** URL path. */
        path, 
        /** Query (without '?'). */
        query, 
        /** Fragment (without '#'). */
        fragment, 
        /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
        username, // (see also: https://goo.gl/94ivpK)
        /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
        password) {
            this.protocol = protocol;
            this.hostName = hostName;
            this.port = port;
            this.path = path;
            this.query = query;
            this.fragment = fragment;
            this.username = username;
            this.password = password;
            if (typeof protocol != 'string')
                protocol = DS.Utilities.toString(protocol);
            if (typeof hostName != 'string')
                hostName = DS.Utilities.toString(hostName);
            if (typeof port != 'string')
                port = DS.Utilities.toString(port);
            if (typeof path != 'string')
                path = DS.Utilities.toString(path);
            if (typeof query != 'string')
                query = DS.Utilities.toString(query);
            if (typeof fragment != 'string')
                fragment = DS.Utilities.toString(fragment);
            if (typeof username != 'string')
                username = DS.Utilities.toString(username);
            if (typeof password != 'string')
                password = DS.Utilities.toString(password);
        }
        /** Returns only  host + port parts combined. */
        host() { return "" + (this.username ? this.username + (this.password ? ":" + this.password : "") + "@" : "") + (this.hostName || "") + (this.port ? ":" + this.port : ""); }
        /** Returns only the protocol + host + port parts combined. */
        origin() {
            var p = this.protocol ? this.protocol + ":" : "", h = this.host();
            return p + (h || p ? "//" + h + "/" : "");
        }
        /**
           * Builds the full URL from the parts specified in this instance while also allowing to override parts.
           * @param {string} origin An optional origin that replaces the protocol+host+port part.
           * @param {string} path An optional path that replaces the current path property value on this instance.
           * @param {string} query An optional query that replaces the current query property value on this instance.
           * This value should not start with a '?', but if exists will be handled correctly.
           * @param {string} fragment An optional fragment that replaces the current fragment property value on this instance.
           * This value should not start with a '#', but if exists will be handled correctly.
           */
        toString(origin, path, query, fragment) {
            // TODO: consider an option to auto-removed default ports based on protocols.
            origin = origin && DS.Utilities.toString(origin) || this.origin();
            path = path && DS.Utilities.toString(path) || this.path;
            query = query && DS.Utilities.toString(query) || this.query;
            fragment = fragment && DS.Utilities.toString(fragment) || this.fragment;
            if (query.charAt(0) == '?')
                query = query.substr(1);
            if (fragment.charAt(0) == '#')
                fragment = fragment.substr(1);
            return DS.Path.combine(origin, path) + (query ? "?" + query : "") + (fragment ? "#" + fragment : "");
        }
        /**
           * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
           * the path to the resource (minus the resource name part).
           * For example, if the path is 'a/b/c' or 'a/b/c.ext' (etc.) then 'a/b/' is returned.
           * This is useful to help remove resource names, such as file names, from the end of a URL path.
           * @param {string} resourceName An optional resource name to append to the end of the resulting path.
           */
        getResourcePath(resourceName) {
            var m = (this.path || "").match(/.*[\/\\]/);
            return (m && m[0] || "") + (resourceName !== void 0 && resourceName !== null ? DS.Utilities.toString(resourceName) : "");
        }
        /**
           * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
           * the path to the resource (minus the resource name part), and optionally appends a new 'resourceName' value.
           * For example, if the current Uri represents 'http://server/a/b/c?a=b#h' or 'http://server/a/b/c.ext?a=b#h' (etc.), and
           * 'resourceName' is "x", then 'http://server/a/b/x?a=b#h' is returned.
           * This is useful to help remove resource names, such as file names, from the end of a URL path.
           * @param {string} resourceName An optional name to append to the end of the resulting path.
           */
        getResourceURL(resourceName) { return this.toString(void 0, this.getResourcePath(resourceName)); }
        /** Returns a new Uri object that represents the 'window.location' object values. */
        static fromLocation() {
            return new Uri(location.protocol, location.hostname, location.port, location.pathname, location.search.substr(1), location.hash.substr(1), location.username, location.password);
        }
    }
    DS.Uri = Uri;
})(DS || (DS = {}));
// ############################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    // ========================================================================================================================
    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    let Time;
    (function (Time) {
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
    /** One or more utility functions to ease development within DreamSpace environments. */
    let Utilities;
    (function (Utilities) {
        // --------------------------------------------------------------------------------------------------------------------
        /**
         * Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups], where
         * 'groups' index 0 is the full matched text, and 1 onwards are any matched groups).
         */
        function matches(regex, text) {
            var matchesFound = [], result;
            if (!regex.global)
                throw new Error("The 'global' flag is required in order to find all matches.");
            regex.lastIndex = 0;
            while ((result = regex.exec(text)) !== null)
                matchesFound.push(result.slice());
            return matchesFound;
        }
        Utilities.matches = matches;
        /**
         * Converts the given value to a string and returns it.  'undefined' (void 0) and null become empty, string types are
         * returned as is, and everything else will be converted to a string by calling 'toString()', or simply '""+value' if
         * 'value.toString' is not a function. If for some reason a call to 'toString()' does not return a string the cycle
         * starts over with the new value until a string is returned.
         * Note: If no arguments are passed in (i.e. 'Utilities.toString()'), then undefined is returned.
         */
        function toString(value) {
            if (arguments.length == 0)
                return void 0;
            if (value === void 0 || value === null)
                return "";
            if (typeof value == 'string')
                return value;
            return typeof value.toString == 'function' ? toString(value.toString()) : "" + value; // ('value.toString()' should be a string, but in case it is not, this will cycle until a string type value is found, or no 'toString()' function exists)
        }
        Utilities.toString = toString;
        // -------------------------------------------------------------------------------------------------------------------
        /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
        function escapeRegex(regExStr) {
            return regExStr.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1"); // TODO: Verify completeness.
        }
        Utilities.escapeRegex = escapeRegex;
        // ------------------------------------------------------------------------------------------------------------------------
        /** This locates names of properties where only a reference and the object context is known.
        * If a reference match is found, the property name is returned, otherwise the result is 'undefined'.
        */
        function getReferenceName(obj, reference) {
            for (var p in obj)
                if (obj[p] === reference)
                    return p;
            return void 0;
        }
        Utilities.getReferenceName = getReferenceName;
        // ------------------------------------------------------------------------------------------------------------------------
        /** Erases all properties on the object, instead of deleting them (which takes longer).
        * @param {boolean} ignore An optional list of properties to ignore when erasing. The properties to ignore should equate to 'true'.
        * This parameter expects an object type because that is faster for lookups than arrays, and developers can statically store these in most cases.
        */
        function erase(obj, ignore) {
            for (var p in obj)
                if ((p != "__proto__" && p != 'constructor' && obj).hasOwnProperty(p))
                    if (!ignore || !ignore[p])
                        obj[p] = void 0;
            return obj;
        }
        Utilities.erase = erase;
        /** Makes a deep copy of the specified value and returns it. If the value is not an object, it is returned immediately.
        * For objects, the deep copy is made by */
        function clone(value) {
            if (typeof value !== 'object')
                return value;
            var newObject, p, rcCount, v;
            if (clone.arguments.length > 1) {
                rcCount = clone.arguments[clone.arguments.length - 1];
                if (value['@__recursiveCheck'] === rcCount)
                    return value; // (this object has already been cloned for this request, which makes it a cyclical reference, so skip)
            }
            else
                rcCount = (value['@__recursiveCheck'] || 0) + 1; // (initially, rcCount will be set to the root __recursiveCheck value, +1, rather than re-creating all properties over and over for each clone request [much faster]) 
            value['@__recursiveCheck'] = rcCount;
            newObject = {};
            for (p in value) { // (note: not using "hasOwnProperty()" here because replicating any inheritance is not supported (nor usually needed), so all properties will be flattened for the new object instance)
                v = value[p];
                if (typeof v !== 'object')
                    newObject[p] = v; // (faster to test and set than to call a function)
                else
                    newObject[p] = clone(v, rcCount);
            }
            return newObject;
        }
        Utilities.clone = clone;
        ;
        // ------------------------------------------------------------------------------------------------------------------------
        /** Dereferences a property path in the form "A.B.C[*].D..." and returns the right most property value, if exists, otherwise
        * 'undefined' is returned.  If path is invalid, an exception will be thrown.
        * @param {string} path The delimited property path to parse.
        * @param {object} origin The object to begin dereferencing with.  If this is null or undefined then it defaults to the global scope.
        * @param {boolean} unsafe If false (default) a fast algorithm is used to parse the path.  If true, then the expression is evaluated at the host global scope (faster).
        *                         The reason for the option is that 'eval' is up to 4x faster, and is best used only if the path is guaranteed not to contain user entered
        *                         values, or ANY text transmitted insecurely.
        *                         Note: The 'eval' used is 'DreamSpace.eval()', which is closed over the global scope (and not the DreamSpace module's private scope).
        *                         'window.eval()' is not called directly in this function.
        */
        function dereferencePropertyPath(path, origin, unsafe = false) {
            if (unsafe)
                return DS.safeEval('p0.' + path, origin); // (note: this is 'DreamSpace.eval()', not a direct call to the global 'eval()')
            if (origin === void 0 || origin === null)
                origin = this !== DS.global ? this : DS.global;
            if (typeof path !== 'string')
                path = '' + path;
            var o = origin, c = '', pc, i = 0, n = path.length, name = '';
            if (n)
                ((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0)
                    ? (name ? (o = o[name], name = '') : (pc == '.' || pc == '[' || pc == ']' && c == ']' ? i = n + 2 : void 0), pc = c)
                    : name += c;
            if (i == n + 2) {
                var msg = new Error("Invalid path: " + path);
                msg.__dereference_origin = origin;
                (console.error || console.log)(msg, origin);
                throw msg;
            }
        } // (performance: http://jsperf.com/ways-to-dereference-a-delimited-property-string)
        Utilities.dereferencePropertyPath = dereferencePropertyPath;
        // ------------------------------------------------------------------------------------------------------------------------
        /** Waits until a property of an object becomes available (i.e. is no longer 'undefined').
          * @param {Object} obj The object for the property.
          * @param {string} propertyName The object property.
          * @param {number} timeout The general amount of timeout to wait before failing, or a negative value to wait indefinitely.
          */
        function waitReady(obj, propertyName, callback, timeout = 60000, timeoutCallback) {
            if (!callback)
                throw "'callback' is required.";
            if (!obj)
                throw "'obj' is required.";
            if (obj[propertyName] !== void 0)
                callback();
            else {
                if (timeout != 0) {
                    if (timeout > 0)
                        timeout--;
                    setTimeout(() => {
                        waitReady(obj, propertyName, callback);
                    }, 1);
                }
                else if (timeoutCallback)
                    timeoutCallback();
            }
        }
        Utilities.waitReady = waitReady;
        // ------------------------------------------------------------------------------------------------------------------------
        /** Helps support cases where 'apply' is missing for a host function object (i.e. IE7 'setTimeout', etc.).  This function
        * will attempt to call '.apply()' on the specified function, and fall back to a work around if missing.
        * @param {Function} func The function to call '.apply()' on.
        * @param {Object} _this The calling object, which is the 'this' reference in the called function (the 'func' argument).
        * Note: This must be null for special host functions, such as 'setTimeout' in IE7.
        * @param {any} args The arguments to apply to given function reference (the 'func' argument).
        */
        function apply(func, _this, args) {
            if (func.apply) {
                return func.apply(_this, args);
            }
            else {
                return Function.prototype.apply.apply(func, [_this, args]);
            }
        }
        Utilities.apply = apply;
        // ------------------------------------------------------------------------------------------------------------------------
        var _guidSeed = (function () {
            var text = DS.global.navigator.userAgent + DS.global.location.href; // TODO: This may need fixing on the server side.
            for (var i = 0, n = text.length, randseed = 0; i < n; ++i)
                randseed += text.charCodeAt(i);
            return randseed;
        })();
        var _guidCounter = 0;
        /**
         * Creates and returns a new version-4 (randomized) GUID/UUID (unique identifier). The uniqueness of the result
         * is enforced by locking the first part down to the current local date/time (not UTC) in milliseconds, along with
         * a counter value in case of fast repetitive calls. The rest of the ID is also randomized with the current local
         * time, along with a checksum of the browser's "agent" string and the current document URL.
         * This function is also supported server side; however, the "agent" string and document location are fixed values.
         * @param {boolean} hyphens If true (default) then hyphens (-) are inserted to separate the GUID parts.
         */
        function createGUID(hyphens = true) {
            var time = (Date.now ? Date.now() : new Date().getTime()) + Time.__localTimeZoneOffset; // (use current local time [not UTC] to offset the random number [there was a bug in Chrome, not sure if it was fixed yet])
            var randseed = time + _guidSeed;
            var hexTime = time.toString(16) + (_guidCounter <= 0xffffffff ? _guidCounter++ : _guidCounter = 0).toString(16), i = hexTime.length, pi = 0;
            var pattern = hyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx', len = pattern.length, result = "", c, r;
            while (pi < len)
                c = pattern[pi++], result += c != 'x' && c != 'y' ? c : i > 0 ? hexTime[--i] : (r = Math.random() * randseed % 16 | 0, c == 'x' ? r : r & 0x3 | 0x8).toString(16);
            return result;
        }
        Utilities.createGUID = createGUID;
    })(Utilities = DS.Utilities || (DS.Utilities = {}));
    // ============================================================================================================================
    /** Returns the name of a namespace or variable reference at runtime. */
    function nameof(selector, fullname = false) {
        var s = '' + selector;
        //var m = s.match(/return\s*([A-Z.]+)/i) || s.match(/=>\s*{?\s*([A-Z.]+)/i) || s.match(/function.*?{\s*([A-Z.]+)/i);
        var m = s.match(/return\s+([A-Z0-9$_.]+)/i) || s.match(/.*?(?:=>|function.*?{)\s*([A-Z0-9$_.]+)/i);
        var name = m && m[1] || "";
        return fullname ? name : name.split('.').reverse()[0];
    }
    DS.nameof = nameof;
    // (shared here: https://github.com/Microsoft/TypeScript/issues/1579#issuecomment-394551591)
    // ============================================================================================================================
    DS.FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])
    /** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
    function getFunctionName(func) {
        // ... if an internal name is already set return it now ...
        var name = func.$__name || func['name'];
        if (name == void 0) {
            // ... check the type (this quickly detects internal/native Browser types) ...
            var typeString = Object.prototype.toString.call(func);
            // (typeString is formated like "[object SomeType]")
            if (typeString.charAt(0) == '[' && typeString.charAt(typeString.length - 1) == ']')
                name = typeString.substring(1, typeString.length - 1).split(' ')[1];
            if (!name || name == "Function" || name == "Object") { // (a basic function/object was found)
                if (typeof func == 'function') {
                    // ... if this has a function text get the name as defined (in IE, Window+'' returns '[object Window]' but in Chrome it returns 'function Window() { [native code] }') ...
                    var fstr = Function.prototype.toString.call(func);
                    var results = (DS.FUNC_NAME_REGEX).exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                    name = (results && results.length > 1) ? results[1] : void 0;
                }
                else
                    name = void 0;
            }
        }
        return name || "";
    }
    DS.getFunctionName = getFunctionName;
    // ############################################################################################################################
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
    function getTypeName(object, cacheTypeName = true) {
        if (object === void 0 || object === null)
            return void 0;
        typeInfo = object;
        if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
            if (typeof object == 'function')
                if (cacheTypeName)
                    return typeInfo.$__name = getFunctionName(object);
                else
                    return getFunctionName(object);
            var typeInfo = object.constructor;
            if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
                if (cacheTypeName)
                    return typeInfo.$__name = getFunctionName(object.constructor);
                else
                    return getFunctionName(object.constructor);
            }
            else
                return typeInfo.$__name;
        }
        else
            return typeInfo.$__name;
    }
    DS.getTypeName = getTypeName;
    /**
     * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known.
     * @see getTypeName()
     */
    function getFullTypeName(object, cacheTypeName = true) {
        if (object.$__fullname)
            return object.$__fullname;
        return getTypeName(object, cacheTypeName);
    }
    DS.getFullTypeName = getFullTypeName;
    /** An utility to extend a TypeScript namespace, which returns a string to be executed using 'eval()'.
     * When executed BEFORE the namespace to be added, it creates a pre-existing namespace reference that forces typescript to update.
     * Example 1: extendNS(()=>Local.NS, "Imported.NS");
     * Example 2: extendNS(()=>Local.NS, ()=>Imported.NS);
     * @param selector The local namespace that will extend the target.
     * @param name A selector or dotted identifier path to the target namespace name to extend from.
     */
    function extendNS(selector, name) {
        return "var " + nameof(selector) + " = " + (typeof name == 'function' ? nameof(name) : name) + ";";
    }
    DS.extendNS = extendNS;
    //x Best to explicitly let TS and packing utilities know of the DS access explicitly. /** An internal utility to extend the 'DS' namespace within DreamSpace modules, which returns a string to be executed using 'eval()'.
    // * It just calls 'extendNS(selector, "DS")'.
    // */
    //x export function extendDSNS(selector: () => any) { return extendNS(selector, "DS"); }
})(DS || (DS = {}));
// ############################################################################################################################
// Notes: 
//   * helper source: https://github.com/Microsoft/tslib/blob/master/tslib.js
// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction that keeps things similar between server and client sides.
var isNode = typeof global == 'object' && global.process && global.process.versions && global.process.versions.node;
/** This is the root to all DreamSpaceJS utilities.
 * These utilities cover most common developer needs when buidling custom components.
 */
var DS;
(function (DS) {
    let IO;
    (function (IO) {
        function get(url, type, method = "GET", data) {
            return new Promise((resolve, reject) => {
                var request = new DS.ResourceRequest(url, type);
                request.ready((req) => { resolve(req.transformedResponse); });
                request.catch((req, err) => { reject(err); });
                request.start();
            });
        }
        IO.get = get;
    })(IO = DS.IO || (DS.IO = {}));
})(DS || (DS = {}));
