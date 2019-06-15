"use strict";
/**
 *  @mdoule Since some plugins require global callbacks, such as when an API gets initialized at some time in the future (i.e. Google Maps, etc.),
 * DreamSpaceJS reserves a global name 'DreamSpace' in the global scope to keep all globals contained in one place.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Globals_1 = require("./Globals");
const Utilities_1 = require("./Utilities");
var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p]; };
/** Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
* This method takes into account any preset properties that may exist on the derived type's prototype.
* Note: Extending an already extended derived type will recreate the prototype connection again using a new prototype instance pointing to the given base type.
* Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
* @param {Function} derivedType The derived type (function) that will extend from a base type.
* @param {Function} baseType The base type (function) to extend to the derived type.
* @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
*/
function __extends(derivedType, baseType, copyStaticProperties = true) {
    if (copyStaticProperties)
        extendStatics(derivedType, baseType);
    // ... create a prototype link for the given type ...
    function __() { this.constructor = derivedType; }
    var newProto = baseType === null ? Object.create(baseType) : (__.prototype = baseType.prototype, new __());
    // ... copy forward any already defined properties in the derived prototype being replaced, if any, before setting the derived types prototype ...
    for (var p in derivedType.prototype)
        if (derivedType.prototype.hasOwnProperty(p))
            newProto[p] = derivedType.prototype[p];
    // ... set the new prototype ...
    derivedType.prototype = newProto;
    // ... return the extended derived type ...
    return derivedType;
}
exports.__extends = __extends;
;
var __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
    }
    return t;
};
function __rest(s, e) {
    var t = {}, p;
    for (p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
            if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
    return t;
}
;
function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect['decorate'] === "function")
        r = Reflect['decorate'](decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
;
function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); };
}
;
function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect['metadata'] === "function")
        return Reflect['metadata'](metadataKey, metadataValue);
}
;
function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
;
function __generator(thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [0, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
}
;
function __exportStar(m, exports) {
    for (var p in m)
        if (!exports.hasOwnProperty(p))
            exports[p] = m[p];
}
;
function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m)
        return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length)
                o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}
;
function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
        return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
            ar.push(r.value);
    }
    catch (error) {
        e = { error: error };
    }
    finally {
        try {
            if (r && !r.done && (m = i["return"]))
                m.call(i);
        }
        finally {
            if (e)
                throw e.error;
        }
    }
    return ar;
}
;
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}
;
function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}
;
function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol['asyncIterator'])
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i;
    function verb(n) { if (g[n])
        i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try {
        step(g[n](v));
    }
    catch (e) {
        settle(q[0][3], e);
    } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length)
        resume(q[0][0], q[0][1]); }
}
;
function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}
;
function __asyncValues(o) {
    if (!Symbol['asyncIterator'])
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol['asyncIterator']], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
}
;
function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
        Object.defineProperty(cooked, "raw", { value: raw });
    }
    else {
        cooked.raw = raw;
    }
    return cooked;
}
;
function __importStar(mod) {
    if (mod && mod.__esModule)
        return mod;
    var result = {};
    if (mod != null)
        for (var k in mod)
            if (Object.hasOwnProperty.call(mod, k))
                result[k] = mod[k];
    result["default"] = mod;
    return result;
}
;
function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
;
/**
 * Copies over the helper functions to the target and returns the target.
 *
 * DreamSpace contains it's own copies of the TypeScript helper functions to help reduce code size. By default the global scope
 * is not polluted with these functions, but you can call this method (without any arguments) to set the functions on the
 * global scope.
 *
 * @param {object} target Allows copying the helper functions to a different object instance other than the global scope.
 */
function installTypeScriptHelpers(target = Globals_1.DreamSpace.global) {
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
exports.installTypeScriptHelpers = installTypeScriptHelpers;
/**
 * Renders the TypeScript helper references in the 'var a=param['a'],b=param['b'],etc.;' format. This is used mainly when executing scripts wrapped in functions.
 * This format allows declaring local function scope helper variables that simply pull references from a given object
 * passed in to a single function parameter.
 *
 * Example: eval("function executeTSCodeInFunctionScope(p){" + renderHelperVarDeclarations("p") + code + "}");
 *
 * Returns an array in the [{declarations string}, {helper object}] format.
 */
function renderHelperVarDeclarations(paramName) {
    var helpers = installTypeScriptHelpers({});
    var decl = "";
    for (var p in helpers)
        decl += (decl ? "," : "var ") + p + "=" + paramName + "['" + p + "']";
    return [decl + ";", helpers];
}
exports.renderHelperVarDeclarations = renderHelperVarDeclarations;
/**
 * Renders the TypeScript helper references to already existing functions into a string to be executed using 'eval()'.
 * This format is used mainly to declare helpers at the start of a module or function body that simply pulls
 * references to the already existing helper functions to help reduce code size.
 *
 * Example: namespace DreamSpace{ eval(renderHelpers()); ...code that may require helpers... }
 *
 * Returns the code to be execute within scope using 'eval()'.
 */
function renderHelpers() {
    var __helpersName = "$__healpers_" + Utilities_1.Utilities.createGUID();
    return "var " + __helpersName + " = " + Globals_1.DreamSpace.globalNamespaceName + ".renderHelperVarDeclarations" + "('" + __helpersName + "[1]'); eval(" + __helpersName + "[0]);";
}
exports.renderHelpers = renderHelpers;
Globals_1.DreamSpace.globalEval(renderHelpers()); // (setup the global helpers to begin with)
//# sourceMappingURL=TSHelpers.js.map