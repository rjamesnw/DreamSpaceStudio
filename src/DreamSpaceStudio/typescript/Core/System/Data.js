"use strict";
// #######################################################################################
// Data IO
// #######################################################################################
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("./Exception");
/** Provides types and utilities for working with formatted data from various sources. */
var Data;
(function (Data) {
    // =============================================================================================
    /** Provides basic functions for working with JSON data. */
    let JSON;
    (function (JSON) {
        // ===================================================================================================================
        /** Converts a JSON string into an object with nested objects as required.
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
                throw Exception_1.Exception.from('Invalid JSON: "' + jsonText + '"');
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
                throw Exception_1.Exception.from("The existing endpoint object is not a valid 'PropertyPathEndpoint' instance.", this);
            endpoint.object = origin;
            endpoint.propertyName = this.namePath[0];
            endpoint.propertyIndex = this.indexes[0];
            endpoint.arguments = this.arguments[0];
            while (i < this.namePath.length) {
                endpoint.object = endpoint.getValue();
                if (endpoint.object === void 0)
                    throw Exception_1.Exception.from("Invalid property path: " + this.__getPathString(i), this);
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
    // =============================================================================================
})(Data || (Data = {}));
exports.default = Data;
//# sourceMappingURL=Data.js.map