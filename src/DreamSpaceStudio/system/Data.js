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
            /** Uses a regex by Douglas Crockford to break down the JSON into valid parts. */
            function isJSON(jsonText) {
                if (typeof jsonText !== "string" || !jsonText)
                    return false;
                jsonText = jsonText.trim();
                return /^[\],:{}\s]*$/.test(jsonText.replace(/\\["\\\/bfnrtu]/g, '@').
                    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                    replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
            }
            JSON.isJSON = isJSON;
            /** Converts a JSON string into an object with nested objects as required.
             * The given JSON string is validated first before it is parsed for security reasons. Invalid JSON will throw an exception.
            */
            function toObject(jsonText) {
                if (typeof jsonText !== "string" || !jsonText)
                    return null;
                // ... some browsers (IE) may not be able to handle the whitespace before or after the text ...
                jsonText = jsonText.trim();
                // ... validate the JSON format ...
                // (Note: regex is from "https://github.com/douglascrockford/JSON-js/blob/master/json2.js" [by Douglas Crockford])
                if (isJSON(jsonText)) {
                    // Try to use the native JSON parser first
                    return window && window.JSON && window.JSON.parse ?
                        window.JSON.parse(jsonText) : (new Function("return " + jsonText))();
                }
                else {
                    throw new DS.Exception('Invalid JSON: "' + jsonText + '"');
                }
            }
            JSON.toObject = toObject;
            /** A more powerful version of the built-in JSON.stringify() function that uses the same function to respect the
            * built-in rules while also limiting depth and supporting cyclical references.
            */
            function stringify(val, depth, replacer, space, onGetObjID) {
                depth = isNaN(+depth) ? 1 : depth;
                var recursMap = new WeakMap();
                function _build(val, depth, o, a, r) {
                    return !val || typeof val != 'object' ? val
                        : (r = recursMap.has(val),
                            recursMap.set(val, true),
                            a = Array.isArray(val),
                            r ? (o = onGetObjID && onGetObjID(val) || null) : DS.global.JSON.stringify(val, function (k, v) { if (a || depth > 0) {
                                if (replacer)
                                    v = replacer(k, v);
                                if (!k)
                                    return (a = Array.isArray(v), val = v);
                                !o && (o = a ? [] : {});
                                o[k] = _build(v, a ? depth : depth - 1);
                            } }),
                            o === void 0 ? {} : o);
                }
                return DS.global.JSON.stringify(_build(val, depth), null, space);
            }
            JSON.stringify = stringify;
            /** Attempts to parse a string as JSON and returns the result.  If the value is not a string, or the conversion
             * fails, the value is returned as is. This is used mainly in message queue processing, so JSON can convert to
             * an object by default for the handlers, otherwise the value is sent as is.
            */
            function toObjectOrValue(value) {
                if (typeof value != 'string' || !isJSON(value))
                    return value;
                try {
                    return JSON.toObject(value);
                }
                catch (err) {
                    return value;
                }
            }
            JSON.toObjectOrValue = toObjectOrValue;
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
                    throw new DS.Exception("The existing endpoint object is not a valid 'PropertyPathEndpoint' instance.", this);
                endpoint.object = origin;
                endpoint.propertyName = this.namePath[0];
                endpoint.propertyIndex = this.indexes[0];
                endpoint.arguments = this.arguments[0];
                while (i < this.namePath.length) {
                    endpoint.object = endpoint.getValue();
                    if (endpoint.object === void 0)
                        throw new DS.Exception("Invalid property path: " + this.__getPathString(i), this);
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
        let Validations;
        (function (Validations) {
            function isNumeric(text) {
                return /^[+|-]?\d+\.?\d*$/.test(text);
                //decimal d; return decimal.TryParse(text, out d);
            }
            Validations.isNumeric = isNumeric;
            function isSimpleNumeric(text) {
                // http://derekslager.com/blog/posts/2007/09/a-better-dotnet-regular-expression-tester.ashx
                return /^(?:\+|\-)?\d+\.?\d*$/.test(text);
            }
            Validations.isSimpleNumeric = isSimpleNumeric;
            // ---------------------------------------------------------------------------------------------------------------------
            /// <summary>
            /// Returns true if the string is only letters.
            /// </summary>
            function isAlpha(s) {
                if (s.length == 0)
                    return false;
                for (var i = 0; i < s.length; ++i)
                    if ((s[i] < 'a' || s[i] > 'z') && (s[i] < 'A' || s[i] > 'Z'))
                        return false;
                return true;
            }
            Validations.isAlpha = isAlpha;
            /// <summary>
            /// Returns true if the string is only letters or numbers.
            /// </summary>
            function isAlphaNumeric(s) {
                if (s.length == 0)
                    return false;
                for (var i = 0; i < s.length; i++)
                    if ((s[i] < 'a' || s[i] > 'z') && (s[i] < 'A' || s[i] > 'Z') && (s[i] < '0' || s[i] > '9'))
                        return false;
                return true;
            }
            Validations.isAlphaNumeric = isAlphaNumeric;
            /// <summary>
            /// Returns true if the string is only letters, numbers, or underscores, and the first character is not a number.
            /// This is useful to validate strings to be used as code-based identifiers, database column names, etc.
            /// </summary>
            function isIdent(s) {
                if (s.length == 0 || (s[0] >= '0' && s[0] <= '9'))
                    return false;
                for (var i = 0; i < s.length; i++)
                    if ((s[i] < 'a' || s[i] > 'z') && (s[i] < 'A' || s[i] > 'Z') && (s[i] < '0' || s[i] > '9') && s[i] != '_')
                        return false;
                return true;
            }
            Validations.isIdent = isIdent;
            /// <summary>
            /// Returns true if the string is only numbers.
            /// </summary>
            function isDigits(s) {
                if (s.length == 0)
                    return false;
                for (var i = 0; i < s.length; i++)
                    if (s[i] < '0' || s[i] > '9')
                        return false;
                return true;
            }
            Validations.isDigits = isDigits;
            // ---------------------------------------------------------------------------------------------------------------------
            function isDatePartOnly(date) {
                if (!date)
                    return false;
                var dt = new Date(date);
                if (isNaN(dt))
                    return false;
                date = date.toLowerCase();
                return !date.includes(":") && !date.includes("am") && !date.includes("pm");
            }
            Validations.isDatePartOnly = isDatePartOnly;
            // ---------------------------------------------------------------------------------------------------------------------
            function isTimePartOnly(time) {
                return /(^\s*((([01]?\d)|(2[0-3])):((0?\d)|([0-5]\d))(:((0?\d)|([0-5]\d)))?)\s*$)|(^\s*((([1][0-2])|\d)(:((0?\d)|([0-5]\d)))?(:((0?\d)|([0-5]\d)))?)\s*[apAP][mM]\s*$)/.test(time);
            }
            Validations.isTimePartOnly = isTimePartOnly;
            // ---------------------------------------------------------------------------------------------------------------------
            // (Test Here: http://derekslager.com/blog/posts/2007/09/a-better-dotnet-regular-expression-tester.ashx)
            function isValidURL(url) {
                return !!url && /^(?:http:\/\/|https:\/\/)\w{2,}.\w{2,}/.test(url);
            }
            Validations.isValidURL = isValidURL;
            // ---------------------------------------------------------------------------------------------------------------------
            function isValidEmailAddress(email) {
                if (email) {
                    let nFirstAT = email.indexOf('@');
                    let nLastAT = email.lastIndexOf('@');
                    if ((nFirstAT > 0) && (nLastAT == nFirstAT) && (nFirstAT < (email.length - 1))) {
                        // (address is ok regarding the single @ sign; faster to check that first)
                        return /^(?:[A-Za-z0-9_\-]+\.)*(?:[A-Za-z0-9_\-]+)@(?:[A-Za-z0-9_\-]+)(?:\.[A-Za-z]+)+$/.test(email);
                    }
                }
                return false;
            }
            Validations.isValidEmailAddress = isValidEmailAddress;
            // ---------------------------------------------------------------------------------------------------------------------
            function isValidPhoneNumber(number) {
                return !!number && /^((\+?\d{1,3}(-|.| )?\(?\d\)?(-|.| )?\d{1,5})|(\(?\d{2,6}\)?))(-|.| )?(\d{3,4})(-|.| )?(\d{4})(( x| ext)( |\d)?\d{1,5}){0,1}$/.test(number);
            }
            Validations.isValidPhoneNumber = isValidPhoneNumber;
            // --------------------------------------------------------------------------------------------------------------------- 
            function isValidPasword(password, minCharacters = 8, maxCharacters = 20, requireOneUpperCase = true, requireDigit = true, validSymbols = `~!@#$%^&_-+=|\\:;',./?`) {
                var requiredCharacters = "";
                if (requireOneUpperCase)
                    requiredCharacters += `(?=.*[a-z])(?=.*[A-Z])`;
                else
                    requiredCharacters += `(?=.*[A-Za-z])`;
                if (requireDigit)
                    requiredCharacters += `(?=.*\\d)`;
                if (validSymbols) {
                    validSymbols = DS.StringUtils.replace(DS.StringUtils.replace(validSymbols, `\\`, `\\\\`), ` - `, `\\-`);
                    requiredCharacters += `(?=.*[` + validSymbols + `])`;
                }
                return password && password.length <= maxCharacters
                    && new RegExp(`^.*(?=.{${minCharacters},})${requiredCharacters}.*$`).test(password);
                // http://nilangshah.wordpress.com/2007/06/26/password-validation-via-regular-expression/
                /*
                 * - Must be at least 6 characters.
                 * - Must contain at least one letter, one digit, and one special character.
                 * - Valid special characters are: `~!@#$%^&_-+=|\:;',./?
                 */
            }
            Validations.isValidPasword = isValidPasword;
        })(Validations = Data.Validations || (Data.Validations = {}));
        // ========================================================================================================================
    })(Data = DS.Data || (DS.Data = {}));
})(DS || (DS = {}));
// ############################################################################################################################
//# sourceMappingURL=Data.js.map