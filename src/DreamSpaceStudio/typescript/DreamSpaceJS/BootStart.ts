/*
 * DreamsSpaceJS (DreamSpaceJS.com), (c) Inossis.com
 * License: http://creativecommons.org/licenses/by-nc/4.0/
 * License note: While the core OS (server side) is protected, the client side and modules will be open source to allow community
 *               contributions. The aim is to protect the quality of the system, while also allowing the community to build upon it freely.
 *
 * Description: DreamSpace is an Internet-based operating system style environment.  The idea behind it is similar to a web desktop, but without any UI at all.
 *              The DreamSpace API resides on a web server, and allows other web apps to integrate with it, much like any other social API,
 *              such as those provided by Facebook, Twitter, etc. (without any actual web pages).
 *
 *              This file is just a bootstrap to help load the required modules and dependencies.
 *
 * Purpose: To provide a JS framework for .Net DreamSpace and WebDesktop.org, but also for other web applications in a security enhanced and controlled manner.
 *
 * Note: Good performance rules: http://developer.yahoo.com/performance/rules.html
 * Note: Loading benchmark done using "http://www.webpagetest.org/".
 * Note: Reason for factory object construction (new/init) patterns in DreamSpace: http://www.html5rocks.com/en/tutorials/speed/static-mem-pools/
 */

import { DreamSpace as DS, IDreamSpace as IDS, extendDSNS, namespace } from "./Types";

eval(extendDSNS(() => DreamSpaceCore));

/** The current application version (user defined). */
var appVersion: string;

/**
 * The root namespace for the DreamSpace system.
 */
namespace DreamSpaceCore {
    // ------------------------------------------------------------------------------------------------------------------------

    /** The current version of the DreamSpace system. */
    export var version = "0.0.1";
    Object.defineProperty(DreamSpaceCore, "version", { writable: false });

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

namespace DreamSpaceCore {

    // =======================================================================================================================

    /** The root namespace name as the string constant. */
    export const ROOT_NAMESPACE = "DreamSpace";

    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'DreamSpace.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    export function noop(...args: any[]): any { }

    /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to keep 'var' declarations, etc., within a function scope.
      * Note: By default, parameter indexes 0-9 are automatically assigned to parameter identifiers 'p0' through 'p9' for easy reference.
      */
    export declare function safeEval(x: string, ...args: any[]): any;

    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
      */
    export declare function globalEval(x: string): any;

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

    // =========================================================================================================================================
    // A dump of the functions required by TypeScript in one place.

    var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b: Object) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    /** Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
    * This method takes into account any preset properties that may exist on the derived type's prototype.
    * Note: Extending an already extended derived type will recreate the prototype connection again using a new prototype instance pointing to the given base type.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    export function __extends<DerivedType extends Function, BaseType extends Function>(derivedType: DerivedType, baseType: BaseType, copyStaticProperties = true): DerivedType {
        if (copyStaticProperties)
            extendStatics(derivedType, baseType);
        // ... create a prototype link for the given type ...
        function __() { this.constructor = derivedType; }
        var newProto: Object = baseType === null ? Object.create(baseType) : (__.prototype = baseType.prototype, new (<any>__)());
        // ... copy forward any already defined properties in the derived prototype being replaced, if any, before setting the derived types prototype ...
        for (var p in derivedType.prototype)
            if (derivedType.prototype.hasOwnProperty(p))
                newProto[p] = derivedType.prototype[p];
        // ... set the new prototype ...
        derivedType.prototype = newProto;
        // ... return the extended derived type ...
        return derivedType;
    };

    var __assign = Object.assign || function (t: any) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function __rest(s: any, e: any) {
        var t = <Object>{}, p: any;
        for (p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = <any>Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    function __decorate(decorators: any, target: any, key: any, desc: any) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof (<any>Reflect)['decorate'] === "function") r = (<any>Reflect)['decorate'](decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    function __param(paramIndex: any, decorator: any) {
        return function (target: any, key: any) { decorator(target, key, paramIndex); }
    };

    function __metadata(metadataKey: any, metadataValue: any) {
        if (typeof Reflect === "object" && typeof (<any>Reflect)['metadata'] === "function") return (<any>Reflect)['metadata'](metadataKey, metadataValue);
    };

    function __awaiter(thisArg: any, _arguments: any, P: any, generator: any) {
        return new (P || (P = Promise))(function (resolve: any, reject: any) {
            function fulfilled(value: any) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value: any) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result: any) { result.done ? resolve(result.value) : new P(function (resolve: any) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    function __generator(thisArg: any, body: any) {
        var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: <any[]>[], ops: <any[]>[] }, f: any, y: any, t: any, g: any;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n: any) { return function (v: any) { return step([n, v]); }; }
        function step(op: any) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = <any>0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    function __exportStar(m: any, exports: any) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    function __values(o: any) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    function __read(o: Object, n?: number) {
        var m = typeof Symbol === "function" && o[<any>Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    function __spread() {
        for (var ar: any[] = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    function __await(v: any): any {
        return this instanceof __await ? (this.v = v, this) : new (<any>__await)(v);
    };

    function __asyncGenerator(thisArg: any, _arguments: any[], generator: any) {
        if (!Symbol['asyncIterator']) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i: any, q: any[] = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i;
        function verb(n: any) { if (g[n]) i[n] = function (v: any) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n: any, v: any) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r: any) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value: any) { resume("next", value); }
        function reject(value: any) { resume("throw", value); }
        function settle(f: any, v: any) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    function __asyncDelegator(o: any) {
        var i: any, p: any;
        return i = {}, verb("next"), verb("throw", function (e: any) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n: any, f?: any) { i[n] = o[n] ? function (v: any) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    function __asyncValues(o: any) {
        if (!Symbol['asyncIterator']) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol['asyncIterator']], i: any;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i);
        function verb(n: any) { i[n] = o[n] && function (v: any) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve: any, reject: any, d: any, v: any) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    };

    function __makeTemplateObject(cooked: any, raw: any) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod: any) {
        if (mod && mod.__esModule) return mod;
        var result = <Object>{};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    function __importDefault(mod: any) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    /** 
     * Copies over the helper functions to the target and returns the target.
     * 
     * DreamSpace contains it's own copies of the TypeScript helper functions to help reduce code size. By default the global scope
     * is not polluted with these functions, but you can call this method (without any arguments) to set the functions on the 
     * global scope.
     * 
     * @param {object} target Allows copying the helper functions to a different object instance other than the global scope.
     */
    export function installTypeScriptHelpers(target: Object = global) {
        target['__extends'] = __extends;
        target['__assign'] = __assign;
        target['__rest'] = __rest;
        target['__decorate'] = __decorate;
        target['__param'] = __param;
        target['__metadata'] = __metadata;
        target['__awaiter'] = __awaiter;
        target['__generator'] = __generator;
        target['__exportStar'] = __exportStar;
        target['__values'] = __values;
        target['__read'] = __read;
        target['__spread'] = __spread;
        target['__await'] = __await;
        target['__asyncGenerator'] = __asyncGenerator;
        target['__asyncDelegator'] = __asyncDelegator;
        target['__asyncValues'] = __asyncValues;
        target['__makeTemplateObject'] = __makeTemplateObject;
        target['__importStar'] = __importStar;
        target['__importDefault'] = __importDefault;
        return target;
    }

    /** 
     * Renders the TypeScript helper references in the 'var a=param['a'],b=param['b'],etc.;' format. This is used mainly when executing scripts wrapped in functions.
     * This format allows declaring local function scope helper variables that simply pull references from a given object
     * passed in to a single function parameter.
     * 
     * Example: eval("function executeTSCodeInFunctionScope(p){"+renderHelperVars("p")+code+"}");
     * 
     * Returns the code to be execute within scope using 'eval()'.
     */
    export function renderHelperVarDeclarations(paramName: string): [string, object] {
        var helpers = installTypeScriptHelpers({});
        var decl = "";
        for (var p in helpers)
            decl += (decl ? "," : "var ") + p + "=" + paramName + "['" + p + "']";
        return [decl + ";", helpers];
    }

    /** 
     * Renders the TypeScript helper references to already existing functions into a string to be executed using 'eval()'. 
     * This format is used mainly to declare helpers at the start of a namespace or function body that simply pull
     * references to the already existing helper functions to help reduce code size.
     * 
     * Example: namespace DreamSpace{ eval(renderHelpers()); ...code that may require helpers... }
     * 
     * Returns an array in the [{declarations string}, {helper object}] format.
     */
    export function renderHelpers() {
        return "var __helpers = " + ROOT_NAMESPACE + "." + getFunctionName(renderHelperVarDeclarations) + "('__helpers[1]'); eval(__helpers[0]);";
    }

    // ========================================================================================================================================
}

DreamSpaceCore.safeEval = function (exp: string, p0?: any, p1?: any, p2?: any, p3?: any, p4?: any, p5?: any, p6?: any, p7?: any, p8?: any, p9?: any): any { return eval(exp); };
// (note: this allows executing 'eval' outside the private DreamSpace scope, but still within a function scope to prevent polluting the global scope,
//  and also allows passing arguments scoped only to the request).

DreamSpaceCore.globalEval = function (exp: string): any { return (<any>0, eval)(exp); };
// (note: indirect 'eval' calls are always globally scoped; see more: http://perfectionkills.com/global-eval-what-are-the-options/#windoweval)

namespace DreamSpaceCore { // (the core scope)

    eval(renderHelpers());

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

    // ------------------------------------------------------------------------------------------------------------------------

    /**
     * Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups], where
     * 'groups' index 0 is the full matched text, and 1 onwards are any matched groups).
     */
    export function matches(regex: RegExp, text: string): string[][] {
        var matchesFound: string[][] = [], result: RegExpExecArray;
        if (!regex.global) throw new Error("The 'global' flag is required in order to find all matches.");
        regex.lastIndex = 0;
        while ((result = regex.exec(text)) !== null)
            matchesFound.push(result.slice());
        return matchesFound;
    }

    /** 
     * Converts the given value to a string and returns it.  'undefined' (void 0) and null become empty, string types are
     * returned as is, and everything else will be converted to a string by calling 'toString()', or simply '""+value' if
     * 'value.toString' is not a function. If for some reason a call to 'toString()' does not return a string the cycle
     * starts over with the new value until a string is returned.
     * Note: If no arguments are passed in (i.e. 'DreamSpace.toString()'), then DreamSpace.ROOT_NAMESPACE is returned, which should be the string "DreamSpace".
     */
    export function toString(value?: any): string {
        if (arguments.length == 0) return ROOT_NAMESPACE;
        if (value === void 0 || value === null) return "";
        if (typeof value == 'string') return value;
        return typeof value.toString == 'function' ? toString(value.toString()) : "" + value;
    }

    // ========================================================================================================================================

    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    export namespace Time {
        namespace("DreamSpace", "Time");

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
}

// ========================================================================================================================================

type DreamSpace = typeof DreamSpaceCore;
export interface IDreamSpace extends IDS, DreamSpace { }

var DreamSpace = <IDreamSpace>DS;
export default DreamSpace;
