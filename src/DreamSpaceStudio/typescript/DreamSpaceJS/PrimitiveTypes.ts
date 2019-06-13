import { Factory, getTypeName, makeFactory, factory, usingFactory, isPrimitiveType, Types } from "./Types";
import { SerializedData, ISerializable } from "./System/Serialization";
import { dispose } from "./System/System";
import { AppDomain, Application, IDomainObjectInfo } from "./System/AppDomain";
import { DreamSpace as DS, IFunctionInfo, ITypeInfo, IDisposable, IClassInfo, IType } from "./Globals";
import { Browser } from "./System/Browser";
import { Utilities } from "./Utilities";

// ###########################################################################################################################
// Primitive types designed for use with the DreamSpace system.
// See 'DreamSpace.global' and 'DreamSpace.NativeTypes/NativeStaticTypes' for access to global scope native references and definitions.
// ###########################################################################################################################
// Thing that gets passed a function and makes a decorator:

// =======================================================================================================================

/** The base type for many DreamSpace classes. */
@factory(this)
export class Object extends DS.global.Object implements IDisposable, ISerializable { // (FACTORY; 'extends DS.global.Object' is only for clarity)
    /**
    * Create a new basic object type.
    * @param value If specified, the value will be wrapped in the created object.
    * @param makeValuePrivate If true, the value will not be exposed, making the value immutable. Default is false.
    */
    static 'new'(value?: any, makeValuePrivate?: boolean): IObject { return null; }

    /** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
    * constructor function to get new instances, and 'dispose()' to release them when done.
    */
    static init(o: IObject, isnew: boolean, value?: any, makeValuePrivate?: boolean): void {
        var _o: IDomainObjectInfo = o;

        if (!isnew)
            o.$__reset();

        if (_o.$__appDomain == void 0 && AppDomain)
            _o.$__appDomain = AppDomain.default;

        if (_o.$__app == void 0 && Application)
            _o.$__app = Application.default;

        // ... if a value is given, the behavior changes to latch onto the value ...
        if (value != void 0) {
            if (makeValuePrivate) {
                o.valueOf = function () { return value; };
                o.toString = function () { return '' + value; };
            } else {
                o['$__value'] = value;
            }
        }
    }

    // -------------------------------------------------------------------------------------------------------------------

    private $__value?: any;

    // -------------------------------------------------------------------------------------------------------------------

    /** Returns the type information for this object instance. */
    getTypeInfo(): IFunctionInfo {
        if (!(<ITypeInfo><any>this.constructor).$__name && (<typeof Object><any>this.constructor).getTypeName)
            (<typeof Object><any>this.constructor).getTypeName(this); // (make sure name details exist; if not, this will add it before continuing)
        return <IFunctionInfo>this.constructor;
    };

    /** Returns true if the specified value is equal to this object.
      * The default implementation only compares if the types and references are equal.  Derived types should override this
      * with a new more meaningful implementation where necessary.
      */
    equal(value: any): boolean {
        return this === value;
    }

    valueOf(): any { return this.$__value; };

    toString(): string { return '' + this; };

    // -------------------------------------------------------------------------------------------------------------------

    /** Serializes the object's '$__id' value only. */
    getData(data: SerializedData): void {
    }

    /** Restores the object's '$__id' value (only works if '$__id' is undefined). */
    setData(data: SerializedData): void {
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
    private $__reset(): this {
        // ... do a dispose and complete wipe ...
        if (this.dispose !== DS.noop)
            dispose(this, false); // 'false' also keeps the app domain (see 'dispose()' below), and only removes it from the "active" list.
        //??if (!this.constructor.new)
        //    throw Exception.error("{object}.new", "You need to register the class/type first: see 'AppDomain.registerClass()'.", this);
        var instance = <Object & ITypeInfo & IDomainObjectInfo>Object.init.call(this, this, false, ...arguments);
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
    static getTypeName(object: object, cacheTypeName = true): string {
        this.getTypeName = getTypeName;
        return getTypeName(object, cacheTypeName);
    }

    /** Returns true if the given object is empty. */
    static isEmpty(obj: any): boolean {
        this.isEmpty = DS.isEmpty; // (make future calls use the root namespace function that already exists)
        return DS.isEmpty(obj);
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
    dispose(release?: boolean): void { Types.dispose(this, release); }

    // -------------------------------------------------------------------------------------------------------------------
}

export interface IObject extends Object { }

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
export function makeDisposable<TBaseClass extends IType = ObjectConstructor>(baseClass: TBaseClass, isPrimitiveOrHostBase?: boolean) {
    if (!baseClass) {
        baseClass = <any>DS.global.Object;
        isPrimitiveOrHostBase = true;
    }
    else if (typeof isPrimitiveOrHostBase == 'undefined') isPrimitiveOrHostBase = isPrimitiveType(baseClass);

    var cls = class Object extends baseClass implements IDisposable {
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
        constructor(...args: any[]) {
            if (!DS.ES6Targeted && isPrimitiveOrHostBase)
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
        dispose(release?: boolean): void { }
    }

    for (var p in Object.prototype)
        if (Object.prototype.hasOwnProperty(p))
            cls.prototype[p] = Object.prototype[p]; // (make these functions both the same function reference by default)

    return <typeof cls & IObject><any>cls;
}

// =======================================================================================================================

/** Copies over prototype properties from the $Object type to other base primitive types. */
function _addObjectPrototypeProperties<T extends { new(...args: any[]): any }>(type: T): T & IObject {
    for (var p in Object.prototype)
        if (Object.prototype.hasOwnProperty.call(Object.prototype, p) && p.charAt(0) != "$" && p.charAt(0) != "_")
            if (!(p in type.prototype))
                type.prototype[p] = (<any>Object.prototype)[p];
    return <any>type;
}

// =======================================================================================================================

export interface IAddLineNumbersFilter {
    (lineNumber: number, marginSize: number, paddedLineNumber: string, line: string): string;
}

eval("var PrimitiveString = DS.global.String;");
declare class PrimitiveString extends DS.global.String { }

/* Note: This is a DreamSpace system string object, and not the native JavaScript object. */
/** Allows manipulation and formatting of text strings, including the determination and location of substrings within strings. */
@factory(this)
export class String extends Factory(makeFactory(makeDisposable(PrimitiveString))) { // (FACTORY)
    /** Returns a new string object instance. */
    static 'new': (value?: any) => IString;
    /**
        * Reinitializes a disposed Delegate instance.
        * @param this The Delegate instance to initialize, or re-initialize.
        * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
        * @param object The instance to bind to the resulting delegate object.
        * @param func The function that will be called for the resulting delegate object.
        */
    static init(o: IString, isnew: boolean, value?: any): void {
        o.$__value = DS.global.String(value);
        //??System.String.prototype.constructor.apply(this, arguments);
        // (IE browsers older than v9 do not populate the string object with the string characters)
        //if (Browser.type == Browser.BrowserTypes.IE && Browser.version <= 8)
        o.length = o.$__value.length;
        for (var i = 0; i < o.length; ++i) o[i] = o.charAt(i);
    }

    /** Replaces one string with another in a given string.
        * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
        * faster in Chrome, and RegEx based 'replace()' in others.
        */
    static replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string {
        // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
        if (typeof source !== 'string') source = "" + source;
        if (typeof replaceWhat !== 'string') replaceWhat = "" + replaceWhat;
        if (typeof replaceWith !== 'string') replaceWith = "" + replaceWith;
        if (ignoreCase)
            return source.replace(new RegExp(Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
        else
            if (Browser.type == Browser.BrowserTypes.Chrome)
                return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
            else
                return source.replace(new RegExp(Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
    }

    /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
    static replaceTags(html: string, tagReplacement?: string): string {
        return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
    }

    /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
      * specified fixed length, then the request is ignored, and the given string is returned.
      * @param {any} str The string to pad.
      * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
      * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
      * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
      */
    static pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string {
        if (str === void 0) str = "";
        if (leftPadChar === void 0 || leftPadChar === null) leftPadChar = "";
        if (rightPadChar === void 0 || rightPadChar === null) rightPadChar = "";

        var s = "" + str, targetLength = fixedLength > 0 ? fixedLength : 0, remainder = targetLength - s.length,
            lchar = "" + leftPadChar, rchar = "" + rightPadChar,
            llen: number, rlen: number, lpad: string = "", rpad: string = "";

        if (remainder <= 0 || (!lchar && !rchar)) return str;

        if (lchar && rchar) {
            llen = Math.floor(remainder / 2);
            rlen = targetLength - llen;
        }
        else if (lchar) llen = remainder;
        else if (rchar) rlen = remainder;

        lpad = DS.global.Array(llen).join(lchar); // (https://stackoverflow.com/a/24398129/1236397)
        rpad = DS.global.Array(rlen).join(rchar);

        return lpad + s + rpad;
    }

    /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
      * Note: If any argument is not a string, the value is converted into a string.
      */
    static append(source: string, suffix?: string, delimiter?: string): string {
        if (source === void 0) source = "";
        else if (typeof source != 'string') source = '' + source;
        if (typeof suffix != 'string') suffix = '' + suffix;
        if (typeof delimiter != 'string') delimiter = '' + delimiter;
        if (!source) return suffix;
        return source + delimiter + suffix;
    }

    /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
      * Note: If any argument is not a string, the value is converted into a string.
      */
    static prepend(source: string, prefix?: string, delimiter?: string): string {
        if (source === void 0) source = "";
        else if (typeof source != 'string') source = '' + source;
        if (typeof prefix != 'string') prefix = '' + prefix;
        if (typeof delimiter != 'string') delimiter = '' + delimiter;
        if (!source) return prefix;
        return prefix + delimiter + source;
    }

    /** Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups]). */
    static matches(regex: RegExp, text: string): string[][] {
        return Utilities.matches(regex, this.toString());
    }

    /** Splits the lines of the text (delimited by '\r\n', '\r', or '\n') into an array of strings. */
    static getLines(text: string): string[] {
        var txt = typeof text == 'string' ? text : '' + text;
        return txt.split(/\r\n|\n|\r/gm);
    }

    /** Adds a line number margin to the given text and returns the result. This is useful when display script errors. 
     * @param {string} text The text to add line numbers to.
     * @param {Function} lineFilter An optional function to run on every line that should return new line text, or undefined to skip a line.
     */
    static addLineNumbersToText(text: string, lineFilter?: IAddLineNumbersFilter) {
        var lines = this.getLines(text);
        var marginSize = lines.length.toString().length + 1; // (used to find the max padding length; +1 for the period [i.e. '  1.'])
        if (lineFilter && typeof lineFilter != 'function') lineFilter = null;
        for (var i = 0, n = lines.length, line: string, _line: string; i < n; ++i) {
            line = lines[i];
            var lineNumStr = (1 + i) + '.';
            var paddedLineNumStr = this.pad(lineNumStr, marginSize, ' ');
            lines[i] = lineFilter && (_line = lineFilter(1 + i, marginSize, paddedLineNumStr, line)) !== void 0 && _line !== null && _line || paddedLineNumStr + " " + line;
        }
        return lines.join("\r\n");
    }

    [index: number]: string;

    private $__value?: any;
    length: number;

    /** Replaces one string with another in the current string. 
    * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
    * faster in Chrome, and RegEx based 'replace()' in others.
    */
    replaceAll(replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string {
        return String.replace(this.toString(), replaceWhat, replaceWith, ignoreCase);
    }

    /** Returns an array of all matches of 'regex' in the underlying string, grouped into sub-arrays (string[matches][groups]). */
    matches(regex: RegExp): string[][] {
        return String.matches(regex, this.toString());
    }

    toString(): string { return this.$__value; }

    valueOf(): any { return this.$__value; }
    // (NOTE: This is the magic that makes it work, as 'toString()' is called by the other functions to get the string value, and the native implementation only works on a primitive string only.)
}

export interface IString extends String { }

// =======================================================================================================================

/** Represents an array of items.
 * Note: This is a DreamSpace system array object, and not the native JavaScript object. Because it is not native,
 * manually setting an array item by index past the end will not modify the length property (this may changed as
 * new features are introduce in future EcmaScript versions [such as 'Object.observe()' in ES7]).
 */
class ArrayFactory extends Factory(makeFactory(DS.global.Array)) {
    /** Returns a new array object instance. 
      * Note: This is a DreamSpace system array object, and not the native JavaScript object. */
    static 'new': <T = any>(...items: any[]) => Array<T>;
    /**
       * Reinitializes a disposed Delegate instance.
       * @param this The Delegate instance to initialize, or re-initialize.
       * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
       * @param object The instance to bind to the resulting delegate object.
       * @param func The function that will be called for the resulting delegate object.
       */
    static init: <T = any>(o: Array<T>, isnew: boolean, ...items: any[]) => void;
}

@usingFactory(ArrayFactory, this)
class Array<T> extends makeDisposable(DS.global.Array)<T> {
    [index: number]: T;

    length: number;
    private _length: number;

    /** Clears the array and returns it. */
    clear() { this.length = 0; return this; }

    /** The static factory constructor for this type. */
    private static [DS.constructor](f: typeof ArrayFactory) {
        if (!DS.ES6) // (if 'class' syntax is not supported then the 'length' property will not behave like an normal array so try to polyfill this somewhat)
            DS.global.Object.defineProperty(Array.prototype, "length", {
                get: function (this: IArray) { return this._length; },
                set: function (this: IArray, v: number) { this._length = +v || 0; DS.global.Array.prototype.splice(this._length); }
            });

        f.init = (o, isnew, ...items) => {
            if (!DS.ES6) o._length = 0;
            try {
                o.push.apply(o, items); // (note: argument limit using this method: http://stackoverflow.com/a/9650855/1236397)
            } catch (e) {
                // (too many items for arguments, need to add each one by one)
                for (var i = 0, n = items.length; i < n; ++i)
                    o.push(items[i]);
            }
        };
    }
}

export interface IArray<T = any> extends Array<T> { }
export { ArrayFactory as Array, Array as ArrayInstance }; // (EXPORT FACTORY)

// =======================================================================================================================

//if (Object.freeze) {
//    Object.freeze($Object);
//    Object.freeze($EventObject);
//    Object.freeze($Array);
//    Object.freeze($String);
//}

// ====================================================================================================================================

/** Represents an object that can have a parent object. */
export abstract class DependentObject extends Object {
    get parent() { return this.__parent; }
    protected __parent: DependentObject; // (note: EvenDispatcher expects '__parent' chains also)
}

export interface IDependencyObject extends DependentObject { }

// =======================================================================================================================
