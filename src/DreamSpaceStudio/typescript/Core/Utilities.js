"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Globals_1 = require("./Globals");
// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
/** One or more utility functions to ease development within DreamSpace environments. */
class Utilities {
}
exports.Utilities = Utilities;
(function (Utilities) {
    // ------------------------------------------------------------------------------------------------------------------------
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
            return Globals_1.DreamSpace.safeEval('p0.' + path, origin); // (note: this is 'DreamSpace.eval()', not a direct call to the global 'eval()')
        if (origin === void 0 || origin === null)
            origin = this !== Globals_1.DreamSpace.global ? this : Globals_1.DreamSpace.global;
        if (typeof path !== 'string')
            path = '' + path;
        var o = origin, c = '', pc, i = 0, n = path.length, name = '';
        if (n)
            ((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0)
                ? (name ? (o = o[name], name = '') : (pc == '.' || pc == '[' || pc == ']' && c == ']' ? i = n + 2 : void 0), pc = c)
                : name += c;
        if (i == n + 2)
            throw Exception_1.Exception.from("Invalid path: " + path, origin);
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
        var text = navigator.userAgent + location.href; // TODO: This may need fixing on the server side.
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
        var time = (Date.now ? Date.now() : new Date().getTime()) + Globals_1.DreamSpace.Time.__localTimeZoneOffset; // (use current local time [not UTC] to offset the random number [there was a bug in Chrome, not sure if it was fixed yet])
        var randseed = time + _guidSeed;
        var hexTime = time.toString(16) + (_guidCounter <= 0xffffffff ? _guidCounter++ : _guidCounter = 0).toString(16), i = hexTime.length, pi = 0;
        var pattern = hyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx', len = pattern.length, result = "", c, r;
        while (pi < len)
            c = pattern[pi++], result += c != 'x' && c != 'y' ? c : i > 0 ? hexTime[--i] : (r = Math.random() * randseed % 16 | 0, c == 'x' ? r : r & 0x3 | 0x8).toString(16);
        return result;
    }
    Utilities.createGUID = createGUID;
})(Utilities || (Utilities = {}));
exports.Utilities = Utilities;
// ------------------------------------------------------------------------------------------------------------------------
const Exception_1 = require("./System/Exception");
// ------------------------------------------------------------------------------------------------------------------------
/**
 * This is a special override to the default TypeScript '__extends' code for extending types in the DreamSpace system.
 * It's also a bit more efficient given that the 'extendStatics' part is run only once and cached and not every time '__extends' is called.
 * Note: This property simply references 'DreamSpace.Utilities.extend'.
 */
// ------------------------------------------------------------------------------------------------------------------------
// Notes: 
//   * helper source: https://github.com/Microsoft/tslib/blob/master/tslib.js
//# sourceMappingURL=Utilities.js.map