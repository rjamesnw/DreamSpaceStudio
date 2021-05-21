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
        /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
        function escapeRegex(regExStr) {
            return regExStr.replace(/([-[\]{}()*+?.,\\/^$|#])/g, "\\$1"); // TODO: Verify completeness.
        }
        Utilities.escapeRegex = escapeRegex;
        // --------------------------------------------------------------------------------------------------------------------
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
        // --------------------------------------------------------------------------------------------------------------------
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
        let RecursionMode;
        (function (RecursionMode) {
            /** Don't detect cyclical cloning. */
            RecursionMode[RecursionMode["None"] = 0] = "None";
            /** Detect cyclical cloning by writing to the object and testing for instances already cloned. */
            RecursionMode[RecursionMode["Fast"] = 1] = "Fast";
            /** Same as 'Fast', except the special added property used to detect recursion is deleted. This is a much slower process, but cleans the added property from the original object. */
            RecursionMode[RecursionMode["Clean"] = 2] = "Clean";
        })(RecursionMode = Utilities.RecursionMode || (Utilities.RecursionMode = {}));
        /** Makes a deep copy of the specified value and returns it. If the value is not an object, it is returned immediately.
        * @param value The view to clone.
        * @param recursionMode The method used to detect recursion (defaults to RecursionMode.Fast).
        */
        function clone(value, recursionMode = RecursionMode.Fast) {
            if (typeof value !== 'object')
                return value;
            var newObject, p, rcCount, v;
            if (recursionMode == RecursionMode.Fast || recursionMode == RecursionMode.Clean) {
                if (arguments.length == 3) {
                    rcCount = arguments[2];
                    if (value['@__recursiveCheck'] === rcCount)
                        return value; // (this object has already been cloned for this request, which makes it a cyclical reference, so skip)
                }
                else
                    rcCount = (value['@__recursiveCheck'] || 0) + 1; // (initially, rcCount will be set to the root __recursiveCheck value, +1, rather than re-creating all properties over and over for each clone request [much faster]) 
                value['@__recursiveCheck'] = rcCount;
            }
            newObject = {};
            for (p in value) { // (note: not using "hasOwnProperty()" here because replicating any inheritance is not supported (nor usually needed), so all properties will be flattened for the new object instance)
                v = value[p];
                if (typeof v !== 'object')
                    newObject[p] = v; // (faster to test and set than to call a function)
                else
                    newObject[p] = clone(v, recursionMode, rcCount);
            }
            if (recursionMode == RecursionMode.Clean)
                delete value['@__recursiveCheck'];
            return newObject;
        }
        Utilities.clone = clone;
        ;
        // --------------------------------------------------------------------------------------------------------------------
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
        function dereferencePropertyPath(path, origin, unsafe = false) {
            if (unsafe)
                return DS.safeEval('p0.' + path, origin); // (note: this is 'DreamSpace.eval()', not a direct call to the global 'eval()')
            if (origin === void 0 || origin === null)
                origin = this !== DS.global ? this : DS.global;
            if (typeof path !== 'string')
                path = DS.StringUtils.toString(path);
            var c, pc, i = 0, n = path.length, name = '', q;
            while (i <= n)
                ((c = path[i++]) == '.' || c == '[' || c == ']' || c == "'" || c == '"' || c == void 0) ?
                    (c == q && path[i] == ']' ? q = '' : q ?
                        name += c : name ? (origin ? origin = origin[name] : i = n + 2, name = '')
                        : (pc == '[' && (c == '"' || c == "'") ? q = c : pc == '.' || pc == '[' || pc == ']' && c == ']' || pc == '"' || pc == "'" ? i = n + 2 : void 0), pc = c)
                    : name += c;
            if (i == n + 2) {
                var msg = new Error("Invalid path: " + path);
                msg.__dereference_origin = origin;
                (console.error || console.log)(msg, origin);
                throw msg;
            }
            return origin;
        } // (performance: http://jsperf.com/ways-to-dereference-a-delimited-property-string)
        Utilities.dereferencePropertyPath = dereferencePropertyPath;
        // --------------------------------------------------------------------------------------------------------------------
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
        // --------------------------------------------------------------------------------------------------------------------
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
        // --------------------------------------------------------------------------------------------------------------------
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
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns the name of a namespace or variable reference at runtime.
         * @param selector A lambda that references the name to return as a string.
         * @param fullname If false (the default) then only the name after the last dot reference is returned, otherwise the whole path reference is returned as a string.
         */
        function nameof(selector, fullname = false) {
            var s = '' + selector;
            //var m = s.match(/return\s*([A-Z.]+)/i) || s.match(/=>\s*{?\s*([A-Z.]+)/i) || s.match(/function.*?{\s*([A-Z.]+)/i);
            var m = s.match(/return\s+([A-Z0-9$_.]+)/i) || s.match(/.*?(?:=>|function.*?{)\s*([A-Z0-9$_.]+)/i);
            var name = m && m[1] || "";
            return fullname ? name : name.split('.').reverse()[0];
        }
        Utilities.nameof = nameof;
        // (shared here: https://github.com/Microsoft/TypeScript/issues/1579#issuecomment-394551591)
        // --------------------------------------------------------------------------------------------------------------------
        Utilities.FUNC_NAME_REGEX = /^(?:function|class)\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])
        /** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
        function getFunctionName(func) {
            // ... if an internal name is already set return it now ...
            var name = func.$__name || func['name'];
            if (name == void 0) {
                // ... check the type (this quickly detects internal/native Browser types) ...
                var typeString = Object.prototype.toString.call(func);
                // (typeString is formated like "[object SomeType]")
                if (typeString.charAt(0) == '[' && typeString.charAt(typeString.length - 1) == ']') // (ex: '[object Function]')
                    name = typeString.substring(1, typeString.length - 1).split(' ')[1];
                if (!name || name == "Function" || name == "Object") { // (a basic function/object was found)
                    if (typeof func == 'function') { // (same result for 'class' types also)
                        // ... if this has a function text get the name as defined (in IE, Window+'' returns '[object Window]' but in Chrome it returns 'function Window() { [native code] }') ...
                        var fstr = Function.prototype.toString.call(func);
                        var results = (Utilities.FUNC_NAME_REGEX).exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                        name = (results && results.length > 1) ? results[1] : void 0;
                    }
                    else
                        name = void 0;
                }
            }
            return name || "";
        }
        Utilities.getFunctionName = getFunctionName;
        // --------------------------------------------------------------------------------------------------------------------
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
        Utilities.getTypeName = getTypeName;
        /**
         * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known.
         * @see getTypeName()
         */
        function getFullTypeName(object, cacheTypeName = true) {
            if (object.$__fullname)
                return object.$__fullname;
            return getTypeName(object, cacheTypeName);
        }
        Utilities.getFullTypeName = getFullTypeName;
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
        Utilities.extendNS = extendNS;
        //x Best to explicitly let TS and packing utilities know of the DS access explicitly. /** An internal utility to extend the 'DS' namespace within DreamSpace modules, which returns a string to be executed using 'eval()'.
        // * It just calls 'extendNS(selector, "DS")'.
        // */
        //x export function extendDSNS(selector: () => any) { return extendNS(selector, "DS"); }
        function ciIndexOf(arr, value) {
            if (arr && arr.length > 0)
                for (var i = 0, n = arr.length; i < n; ++i)
                    if (arr[i] === value || typeof arr[i] == 'string' && typeof value == 'string' && arr[i].toLowerCase() == value.toLowerCase())
                        return i;
            return -1;
        }
        Utilities.ciIndexOf = ciIndexOf;
        Utilities.sensitivePropertiesFilter = "pass|secret|key";
        /** Use in places to prevent logging sensitive data; this does a partial name match, so 'pass' matches 'password; as well. */
        function hideSensitiveData(text) {
            return DS.StringUtils.toString(text).replace(new RegExp('(".*?(?:' + Utilities.sensitivePropertiesFilter + ').*?":\s*)(".*?")', 'gi'), '$1"******"');
        }
        Utilities.hideSensitiveData = hideSensitiveData;
        /** Attempts to parse a string as JSON and returns the result.  If the value is not a string, or the conversion fails,
         * the value is returned as is.
         * This is used mainly to convert JSON strings to objects, while allowing all other values to pass through as is.
         */
        function parseJsonElseKeepAsIs(value) {
            try {
                if (typeof value == 'string' && DS.Data.JSON.isJSON(value))
                    return DS.Data.JSON.toObject(value);
            }
            catch (err) {
                return value;
            }
        }
        Utilities.parseJsonElseKeepAsIs = parseJsonElseKeepAsIs;
        function getPropertiesOfType(o, typeNames, ownProperties = false) {
            var _p = [];
            if (Array.isArray(typeNames))
                for (let p in o) {
                    if ((!ownProperties || Object.prototype.hasOwnProperty.call(o, p)) && typeNames.indexOf(typeof o[p]) >= 0)
                        _p.push(p);
                }
            else
                for (let p in o)
                    if ((!ownProperties || Object.prototype.hasOwnProperty.call(o, p)) && typeof o[p] == typeNames)
                        _p.push(p);
            return _p;
        }
        Utilities.getPropertiesOfType = getPropertiesOfType;
        // --------------------------------------------------------------------------------------------------------------------
        /**
         * Returns true if the value equates to 'true', 'yes', 'y', 1, 'ok', 'pass', 'on'.
         * Returns false if the value equates to 'fase', 'no', 'n', 0, 'cancel', 'fail', 'off'.
         * Note: This does NOT use "truthy" or "falsy" to equate true and false. The value has to be explicitly stated.
         * @param value The value to check for true or false meanings.
         * @param defaultValue The default boolean value if nothing is a match.
         */
        function toBoolean(value, defaultValue) {
            if (typeof value == 'boolean')
                return value;
            var txt = ('' + DS.nud(value, "")).toLowerCase(); // (convert to string and test for 'true' state equivalent)
            if (txt == "true" || txt == "yes" || txt == "y" || txt == "1" || txt == "ok" || txt == "pass" || txt == "on")
                return true;
            if (txt == "false" || txt == "no" || txt == "n" || txt == "0" || txt == "cancel" || txt == "fail" || txt == "off")
                return false;
            return defaultValue;
        }
        Utilities.toBoolean = toBoolean;
    })(Utilities = DS.Utilities || (DS.Utilities = {}));
})(DS || (DS = {}));
// ############################################################################################################################
// Notes: 
//   * helper source: https://github.com/Microsoft/tslib/blob/master/tslib.js
//# sourceMappingURL=Utilities.js.map