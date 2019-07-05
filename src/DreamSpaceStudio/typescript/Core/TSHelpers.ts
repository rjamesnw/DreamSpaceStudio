/** 
 *  @mdoule Since some plugins require global callbacks, such as when an API gets initialized at some time in the future (i.e. Google Maps, etc.),
 * DreamSpaceJS reserves a global name 'DreamSpace' in the global scope to keep all globals contained in one place.
 */

import { DreamSpace as DS, DEFAULT_GLOBAL_NS_NAME } from "./DreamSpace";
import { Utilities } from "./Utilities";

var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b: Object) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

/**
 * Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
 * This method takes into account any preset properties that may exist on the derived type's prototype.
 * This is a special override to the default TypeScript '__extends' code for extending types in the DreamSpace system.
 * It's also a bit more efficient given that the 'extendStatics' part is run only once and cached and not every time '__extends' is called.
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
export function installTypeScriptHelpers(target: Object = DS.global) {
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
 * Example: eval("function executeTSCodeInFunctionScope(p){" + renderHelperVarDeclarations("p") + code + "}");
 *
 * Returns an array in the [{declarations string}, {helper object}] format.
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
 * This format is used mainly to declare helpers at the start of a module or function body that simply pulls
 * references to the already existing helper functions to help reduce code size.
 * 
 * Example: namespace DreamSpace{ eval(renderHelpers()); ...code that may require helpers... }
 *
 * Returns the code to be execute within scope using 'eval()'.
 */
export function renderHelpers() {
    var __helpersName = "$__healpers_" + Utilities.createGUID();
    return "var " + __helpersName + " = " + DS.globalNamespaceName + ".renderHelperVarDeclarations" + "('" + __helpersName + "[1]'); eval(" + __helpersName + "[0]);";
}

DS.globalEval(renderHelpers()); // (setup the global helpers to begin with)
