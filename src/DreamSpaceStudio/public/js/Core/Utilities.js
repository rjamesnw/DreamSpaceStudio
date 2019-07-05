// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
define(["require", "exports", "./DreamSpace"], function (require, exports, DreamSpace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                return DreamSpace_1.DreamSpace.safeEval('p0.' + path, origin); // (note: this is 'DreamSpace.eval()', not a direct call to the global 'eval()')
            if (origin === void 0 || origin === null)
                origin = this !== DreamSpace_1.DreamSpace.global ? this : DreamSpace_1.DreamSpace.global;
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
            var text = DreamSpace_1.DreamSpace.global.navigator.userAgent + DreamSpace_1.DreamSpace.global.location.href; // TODO: This may need fixing on the server side.
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
            var time = (Date.now ? Date.now() : new Date().getTime()) + DreamSpace_1.DreamSpace.Time.__localTimeZoneOffset; // (use current local time [not UTC] to offset the random number [there was a bug in Chrome, not sure if it was fixed yet])
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
    // ============================================================================================================================
    /** Returns the name of a namespace or variable reference at runtime. */
    function nameof(selector, fullname = false) {
        var s = '' + selector;
        //var m = s.match(/return\s*([A-Z.]+)/i) || s.match(/=>\s*{?\s*([A-Z.]+)/i) || s.match(/function.*?{\s*([A-Z.]+)/i);
        var m = s.match(/return\s+([A-Z0-9$_.]+)/i) || s.match(/.*?(?:=>|function.*?{)\s*([A-Z0-9$_.]+)/i);
        var name = m && m[1] || "";
        return fullname ? name : name.split('.').reverse()[0];
    }
    exports.nameof = nameof;
    // (shared here: https://github.com/Microsoft/TypeScript/issues/1579#issuecomment-394551591)
    // ============================================================================================================================
    exports.FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])
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
                    var results = (exports.FUNC_NAME_REGEX).exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                    name = (results && results.length > 1) ? results[1] : void 0;
                }
                else
                    name = void 0;
            }
        }
        return name || "";
    }
    exports.getFunctionName = getFunctionName;
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
    exports.getTypeName = getTypeName;
    /**
     * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known.
     * @see getTypeName()
     */
    function getFullTypeName(object, cacheTypeName = true) {
        if (object.$__fullname)
            return object.$__fullname;
        return getTypeName(object, cacheTypeName);
    }
    exports.getFullTypeName = getFullTypeName;
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
    exports.extendNS = extendNS;
});
//x Best to explicitly let TS and packing utilities know of the DS access explicitly. /** An internal utility to extend the 'DS' namespace within DreamSpace modules, which returns a string to be executed using 'eval()'.
// * It just calls 'extendNS(selector, "DS")'.
// */
//x export function extendDSNS(selector: () => any) { return extendNS(selector, "DS"); }
// ############################################################################################################################
// Notes: 
//   * helper source: https://github.com/Microsoft/tslib/blob/master/tslib.js
//# sourceMappingURL=Utilities.js.map