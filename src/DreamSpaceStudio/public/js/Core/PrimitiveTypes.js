define(["require", "exports", "./Types", "./Factories", "./System/System", "./AppDomain", "./Globals", "./System/Browser", "./Utilities"], function (require, exports, Types_1, Factories_1, System_1, AppDomain_1, Globals_1, Browser_1, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObjectFactory_1, String_1, Array_1;
    // ###########################################################################################################################
    // Primitive types designed for use with the DreamSpace system.
    // See 'DreamSpace.global' and 'DreamSpace.NativeTypes/NativeStaticTypes' for access to global scope native references and definitions.
    // ###########################################################################################################################
    // Thing that gets passed a function and makes a decorator:
    // =======================================================================================================================
    /** The base type for many DreamSpace classes. */
    let ObjectFactory = ObjectFactory_1 = class ObjectFactory extends Globals_1.DreamSpace.global.Object {
        /**
        * Create a new basic object type.
        * @param value If specified, the value will be wrapped in the created object.
        * @param makeValuePrivate If true, the value will not be exposed, making the value immutable. Default is false.
        */
        static 'new'(value, makeValuePrivate) { return null; }
        /** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
        * constructor function to get new instances, and 'dispose()' to release them when done.
        */
        static init(o, isnew, value, makeValuePrivate) {
            var _o = o;
            if (!isnew)
                o.$__reset();
            if (_o.$__appDomain == void 0 && AppDomain_1.AppDomain)
                _o.$__appDomain = AppDomain_1.AppDomain.default;
            if (_o.$__app == void 0 && AppDomain_1.Application)
                _o.$__app = AppDomain_1.Application.default;
            // ... if a value is given, the behavior changes to latch onto the value ...
            if (value != void 0) {
                if (makeValuePrivate) {
                    o.valueOf = function () { return value; };
                    o.toString = function () { return '' + value; };
                }
                else {
                    o['$__value'] = value;
                }
            }
        }
        // -------------------------------------------------------------------------------------------------------------------
        /** Returns the type information for this object instance. */
        getTypeInfo() {
            if (!this.constructor.$__name && this.constructor.getTypeName)
                this.constructor.getTypeName(this); // (make sure name details exist; if not, this will add it before continuing)
            return this.constructor;
        }
        ;
        /** Returns true if the specified value is equal to this object.
          * The default implementation only compares if the types and references are equal.  Derived types should override this
          * with a new more meaningful implementation where necessary.
          */
        equal(value) {
            return this === value;
        }
        valueOf() { return this.$__value; }
        ;
        toString() { return '' + this; }
        ;
        // -------------------------------------------------------------------------------------------------------------------
        /** Serializes the object's '$__id' value only. */
        getData(data) {
        }
        /** Restores the object's '$__id' value (only works if '$__id' is undefined). */
        setData(data) {
        }
        ///** 
        // * Release the object back into the object pool. 
        // * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        // *                          false to request that child objects remain connected after disposal (not released). This
        // *                          can allow quick initialization of a group of objects, instead of having to pull each one
        // *                          from the object pool each time.
        // */
        //x dispose(release?: boolean): void {
        //    // ... this should be the final code executed in the disposal chain (from the derived types, since it should always be top down [opposite of construction]) ...
        //    var appDomain = (<IDomainObjectInfo><any>this).$__appDomain; // (note: may be set to UNDEFINED if this is called from '{AppDomain}.dispose()')
        //    this.dispose = noop; // (make sure 'appDomain.dispose(object)' doesn't call back; note: this only hides the prototype function)
        //    if (appDomain)
        //        appDomain.dispose(this, release);
        //};
        // -------------------------------------------------------------------------------------------------------------------
        /**
         * Disposes and reinitializes the current instance.
         */
        $__reset() {
            // ... do a dispose and complete wipe ...
            if (this.dispose !== Globals_1.DreamSpace.noop)
                System_1.dispose(this, false); // 'false' also keeps the app domain (see 'dispose()' below), and only removes it from the "active" list.
            //??if (!this.constructor.new)
            //    throw Exception.error("{object}.new", "You need to register the class/type first: see 'AppDomain.registerClass()'.", this);
            var instance = ObjectFactory_1.init.call(this, this, false, ...arguments);
            instance.$__appDomain.objects.addObject(instance);
            delete instance.dispose;
            return this;
        }
        // -------------------------------------------------------------------------------------------------------------------
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
        static getTypeName(object, cacheTypeName = true) {
            this.getTypeName = Types_1.getTypeName;
            return Types_1.getTypeName(object, cacheTypeName);
        }
        /** Returns true if the given object is empty. */
        static isEmpty(obj) {
            this.isEmpty = Globals_1.DreamSpace.isEmpty; // (make future calls use the root namespace function that already exists)
            return Globals_1.DreamSpace.isEmpty(obj);
        }
        // -------------------------------------------------------------------------------------------------------------------
        /**
         * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
         * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
         * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
         *                          false to request that child objects remain connected after disposal (not released). This
         *                          can allow quick initialization of a group of objects, instead of having to pull each one
         *                          from the object pool each time.
         */
        dispose(release) { Factories_1.Types.dispose(this, release); }
    };
    ObjectFactory = ObjectFactory_1 = __decorate([
        Factories_1.factory(this)
    ], ObjectFactory);
    exports.Object = ObjectFactory;
    // =======================================================================================================================
    /**
     * Creates a 'Disposable' type from another base type. This is primarily used to extend primitive types for use as base types to DreamSpace
     * primitives.  This is because Array and String types cannot inherit from the custom 'Object' type AND be instances of the respective primary types.
     * Note: These types are NOT instances of 'DreamSpace.Disposable', since they must have prototype chains that link to other base types.
     * @param {TBaseClass} baseClass The base class to inherit from.
     * @param {boolean} isPrimitiveOrHostBase Set this to true when inheriting from primitive types. This is normally auto-detected, but can be forced in cases
     * where 'new.target' (ES6) prevents proper inheritance from host system base types that are not primitive types.
     * This is only valid if compiling your .ts source for ES5 while also enabling support for ES6 environments.
     * If you compile your .ts source for ES6 then the 'class' syntax will be used and this value has no affect.
     */
    //? * Note 2: 'new' and 'init' functions are NOT implemented. To implement proper defaults, call 'Types.makeFactory()'.
    function makeDisposable(baseClass, isPrimitiveOrHostBase) {
        if (!baseClass) {
            baseClass = Globals_1.DreamSpace.global.Object;
            isPrimitiveOrHostBase = true;
        }
        else if (typeof isPrimitiveOrHostBase == 'undefined')
            isPrimitiveOrHostBase = Types_1.isPrimitiveType(baseClass);
        var cls = class Disposable extends baseClass {
            ///**
            //* Create a new basic object type.
            //* @param value If specified, the value will be wrapped in the created object.
            //* @param makeValuePrivate If true, the value will not be exposed, making the value immutable. Default is false.
            //*/
            //static 'new': (value?: any, makeValuePrivate?: boolean) => IObject;
            ///** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
            //* constructor function to get new instances, and 'dispose()' to release them when done.
            //*/
            //static init: (o: IObject, isnew: boolean, value?: any, makeValuePrivate?: boolean) => void;
            /**
            * Don't create objects using the 'new' operator. Use '{NameSpaces...ClassType}.new()' static methods instead.
            */
            constructor(...args) {
                if (!Globals_1.DreamSpace.ES6Targeted && isPrimitiveOrHostBase)
                    eval("var _super = function() { return null; };"); // (ES6 fix for extending built-in types [calling constructor not supported prior] when compiling for ES5; more details on it here: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work)
                super(...args);
            }
            /**
            * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
            * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
            * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
            *                          false to request that child objects remain connected after disposal (not released). This
            *                          can allow quick initialization of a group of objects, instead of having to pull each one
            *                          from the object pool each time.
            */
            dispose(release) { }
        };
        for (var p in Object.prototype)
            if (Object.prototype.hasOwnProperty(p))
                cls.prototype[p] = Object.prototype[p]; // (make these functions both the same function reference by default)
        return cls;
    }
    exports.makeDisposable = makeDisposable;
    // =======================================================================================================================
    /** Copies over prototype properties from the $Object type to other base primitive types. */
    function _addObjectPrototypeProperties(type) {
        for (var p in Object.prototype)
            if (Object.prototype.hasOwnProperty.call(Object.prototype, p) && p.charAt(0) != "$" && p.charAt(0) != "_")
                if (!(p in type.prototype))
                    type.prototype[p] = Object.prototype[p];
        return type;
    }
    eval("var PrimitiveString = DS.global.String;");
    /* Note: This is a DreamSpace system string object, and not the native JavaScript object. */
    /** Allows manipulation and formatting of text strings, including the determination and location of substrings within strings. */
    let String = String_1 = class String extends Factories_1.Factory(Factories_1.makeFactory(makeDisposable(PrimitiveString))) {
        /**
            * Reinitializes a disposed Delegate instance.
            * @param this The Delegate instance to initialize, or re-initialize.
            * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
            * @param object The instance to bind to the resulting delegate object.
            * @param func The function that will be called for the resulting delegate object.
            */
        static init(o, isnew, value) {
            o.$__value = Globals_1.DreamSpace.global.String(value);
            //??System.String.prototype.constructor.apply(this, arguments);
            // (IE browsers older than v9 do not populate the string object with the string characters)
            //if (Browser.type == Browser.BrowserTypes.IE && Browser.version <= 8)
            o.length = o.$__value.length;
            for (var i = 0; i < o.length; ++i)
                o[i] = o.charAt(i);
        }
        /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
        static replace(source, replaceWhat, replaceWith, ignoreCase) {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string')
                source = "" + source;
            if (typeof replaceWhat !== 'string')
                replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string')
                replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(Utilities_1.Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else if (Browser_1.Browser.type == Browser_1.Browser.BrowserTypes.Chrome)
                return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
            else
                return source.replace(new RegExp(Utilities_1.Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
        }
        /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
        static replaceTags(html, tagReplacement) {
            return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
        }
        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
          * specified fixed length, then the request is ignored, and the given string is returned.
          * @param {any} str The string to pad.
          * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
          * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
          * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
          */
        static pad(str, fixedLength, leftPadChar, rightPadChar) {
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
            lpad = Globals_1.DreamSpace.global.Array(llen).join(lchar); // (https://stackoverflow.com/a/24398129/1236397)
            rpad = Globals_1.DreamSpace.global.Array(rlen).join(rchar);
            return lpad + s + rpad;
        }
        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        static append(source, suffix, delimiter) {
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
        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        static prepend(source, prefix, delimiter) {
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
        /** Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups]). */
        static matches(regex, text) {
            return Utilities_1.Utilities.matches(regex, this.toString());
        }
        /** Splits the lines of the text (delimited by '\r\n', '\r', or '\n') into an array of strings. */
        static getLines(text) {
            var txt = typeof text == 'string' ? text : '' + text;
            return txt.split(/\r\n|\n|\r/gm);
        }
        /** Adds a line number margin to the given text and returns the result. This is useful when display script errors.
         * @param {string} text The text to add line numbers to.
         * @param {Function} lineFilter An optional function to run on every line that should return new line text, or undefined to skip a line.
         */
        static addLineNumbersToText(text, lineFilter) {
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
        /** Replaces one string with another in the current string.
        * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
        * faster in Chrome, and RegEx based 'replace()' in others.
        */
        replaceAll(replaceWhat, replaceWith, ignoreCase) {
            return String_1.replace(this.toString(), replaceWhat, replaceWith, ignoreCase);
        }
        /** Returns an array of all matches of 'regex' in the underlying string, grouped into sub-arrays (string[matches][groups]). */
        matches(regex) {
            return String_1.matches(regex, this.toString());
        }
        toString() { return this.$__value; }
        valueOf() { return this.$__value; }
    };
    String = String_1 = __decorate([
        Factories_1.factory(this)
    ], String);
    exports.String = String;
    // =======================================================================================================================
    /** Represents an array of items.
     * Note: This is a DreamSpace system array object, and not the native JavaScript object. Because it is not native,
     * manually setting an array item by index past the end will not modify the length property (this may changed as
     * new features are introduce in future EcmaScript versions [such as 'Object.observe()' in ES7]).
     */
    class ArrayFactory extends Factories_1.Factory(Factories_1.makeFactory(Globals_1.DreamSpace.global.Array)) {
    }
    exports.Array = ArrayFactory;
    let Array = Array_1 = class Array extends makeDisposable(Globals_1.DreamSpace.global.Array) {
        /** Clears the array and returns it. */
        clear() { this.length = 0; return this; }
        /** The static factory constructor for this type. */
        static [Globals_1.DreamSpace.constructor](f) {
            if (!Globals_1.DreamSpace.ES6) // (if 'class' syntax is not supported then the 'length' property will not behave like an normal array so try to polyfill this somewhat)
                Globals_1.DreamSpace.global.Object.defineProperty(Array_1.prototype, "length", {
                    get: function () { return this._length; },
                    set: function (v) { this._length = +v || 0; Globals_1.DreamSpace.global.Array.prototype.splice(this._length); }
                });
            f.init = (o, isnew, ...items) => {
                if (!Globals_1.DreamSpace.ES6)
                    o._length = 0;
                try {
                    o.push.apply(o, items); // (note: argument limit using this method: http://stackoverflow.com/a/9650855/1236397)
                }
                catch (e) {
                    // (too many items for arguments, need to add each one by one)
                    for (var i = 0, n = items.length; i < n; ++i)
                        o.push(items[i]);
                }
            };
        }
    };
    Array = Array_1 = __decorate([
        Factories_1.usingFactory(ArrayFactory, this)
    ], Array);
    exports.ArrayInstance = Array;
    // =======================================================================================================================
    //if (Object.freeze) {
    //    Object.freeze($Object);
    //    Object.freeze($EventObject);
    //    Object.freeze($Array);
    //    Object.freeze($String);
    //}
    // ====================================================================================================================================
    /** Represents an object that can have a parent object. */
    class DependentObject extends ObjectFactory {
        get parent() { return this.__parent; }
    }
    exports.DependentObject = DependentObject;
});
// =======================================================================================================================
//# sourceMappingURL=PrimitiveTypes.js.map