import { SerializedData, ISerializable } from "./System/Serialization";
import { DreamSpace as DS, IFunctionInfo, IDisposable, IType } from "./Globals";
/** The base type for many DreamSpace classes. */
export declare class Object extends DS.global.Object implements IDisposable, ISerializable {
    /**
    * Create a new basic object type.
    * @param value If specified, the value will be wrapped in the created object.
    * @param makeValuePrivate If true, the value will not be exposed, making the value immutable. Default is false.
    */
    static 'new'(value?: any, makeValuePrivate?: boolean): IObject;
    /** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
    * constructor function to get new instances, and 'dispose()' to release them when done.
    */
    static init(o: IObject, isnew: boolean, value?: any, makeValuePrivate?: boolean): void;
    private $__value?;
    /** Returns the type information for this object instance. */
    getTypeInfo(): IFunctionInfo;
    /** Returns true if the specified value is equal to this object.
      * The default implementation only compares if the types and references are equal.  Derived types should override this
      * with a new more meaningful implementation where necessary.
      */
    equal(value: any): boolean;
    valueOf(): any;
    toString(): string;
    /** Serializes the object's '$__id' value only. */
    getData(data: SerializedData): void;
    /** Restores the object's '$__id' value (only works if '$__id' is undefined). */
    setData(data: SerializedData): void;
    /**
     * Disposes and reinitializes the current instance.
     */
    private $__reset;
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
    static getTypeName(object: object, cacheTypeName?: boolean): string;
    /** Returns true if the given object is empty. */
    static isEmpty(obj: any): boolean;
    /**
     * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
     * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
     * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
     *                          false to request that child objects remain connected after disposal (not released). This
     *                          can allow quick initialization of a group of objects, instead of having to pull each one
     *                          from the object pool each time.
     */
    dispose(release?: boolean): void;
}
export interface IObject extends Object {
}
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
export declare function makeDisposable<TBaseClass extends IType = ObjectConstructor>(baseClass: TBaseClass, isPrimitiveOrHostBase?: boolean): {
    new (...args: any[]): {
        /**
        * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
        * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
        * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        *                          false to request that child objects remain connected after disposal (not released). This
        *                          can allow quick initialization of a group of objects, instead of having to pull each one
        *                          from the object pool each time.
        */
        dispose(release?: boolean): void;
    };
} & TBaseClass & IObject;
export interface IAddLineNumbersFilter {
    (lineNumber: number, marginSize: number, paddedLineNumber: string, line: string): string;
}
declare class PrimitiveString extends DS.global.String {
}
declare const String_base: {
    new (): {
        /**
        * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
        * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
        * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        *                          false to request that child objects remain connected after disposal (not released). This
        *                          can allow quick initialization of a group of objects, instead of having to pull each one
        *                          from the object pool each time.
        */
        dispose(release?: boolean): void;
    } & PrimitiveString;
    super: {
        new (...args: any[]): {
            /**
            * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
            * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
            * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
            *                          false to request that child objects remain connected after disposal (not released). This
            *                          can allow quick initialization of a group of objects, instead of having to pull each one
            *                          from the object pool each time.
            */
            dispose(release?: boolean): void;
        };
    } & typeof PrimitiveString & IObject & import("./Globals").IFactory<{
        new (...args: any[]): {
            /**
            * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
            * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
            * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
            *                          false to request that child objects remain connected after disposal (not released). This
            *                          can allow quick initialization of a group of objects, instead of having to pull each one
            *                          from the object pool each time.
            */
            dispose(release?: boolean): void;
        };
    } & typeof PrimitiveString & IObject, import("./Globals").NewDelegate<{
        /**
        * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
        * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
        * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        *                          false to request that child objects remain connected after disposal (not released). This
        *                          can allow quick initialization of a group of objects, instead of having to pull each one
        *                          from the object pool each time.
        */
        dispose(release?: boolean): void;
    } & PrimitiveString>, import("./Globals").InitDelegate<{
        /**
        * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
        * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
        * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        *                          false to request that child objects remain connected after disposal (not released). This
        *                          can allow quick initialization of a group of objects, instead of having to pull each one
        *                          from the object pool each time.
        */
        dispose(release?: boolean): void;
    } & PrimitiveString>>;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    [x: string]: any;
    [x: number]: any;
};
/** Allows manipulation and formatting of text strings, including the determination and location of substrings within strings. */
export declare class String extends String_base {
    /** Returns a new string object instance. */
    static 'new': (value?: any) => IString;
    /**
        * Reinitializes a disposed Delegate instance.
        * @param this The Delegate instance to initialize, or re-initialize.
        * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
        * @param object The instance to bind to the resulting delegate object.
        * @param func The function that will be called for the resulting delegate object.
        */
    static init(o: IString, isnew: boolean, value?: any): void;
    /** Replaces one string with another in a given string.
        * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
        * faster in Chrome, and RegEx based 'replace()' in others.
        */
    static replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string;
    /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
    static replaceTags(html: string, tagReplacement?: string): string;
    /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
      * specified fixed length, then the request is ignored, and the given string is returned.
      * @param {any} str The string to pad.
      * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
      * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
      * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
      */
    static pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string;
    /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
      * Note: If any argument is not a string, the value is converted into a string.
      */
    static append(source: string, suffix?: string, delimiter?: string): string;
    /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
      * Note: If any argument is not a string, the value is converted into a string.
      */
    static prepend(source: string, prefix?: string, delimiter?: string): string;
    /** Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups]). */
    static matches(regex: RegExp, text: string): string[][];
    /** Splits the lines of the text (delimited by '\r\n', '\r', or '\n') into an array of strings. */
    static getLines(text: string): string[];
    /** Adds a line number margin to the given text and returns the result. This is useful when display script errors.
     * @param {string} text The text to add line numbers to.
     * @param {Function} lineFilter An optional function to run on every line that should return new line text, or undefined to skip a line.
     */
    static addLineNumbersToText(text: string, lineFilter?: IAddLineNumbersFilter): string;
    [index: number]: string;
    private $__value?;
    length: number;
    /** Replaces one string with another in the current string.
    * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
    * faster in Chrome, and RegEx based 'replace()' in others.
    */
    replaceAll(replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string;
    /** Returns an array of all matches of 'regex' in the underlying string, grouped into sub-arrays (string[matches][groups]). */
    matches(regex: RegExp): string[][];
    toString(): string;
    valueOf(): any;
}
export interface IString extends String {
}
declare const ArrayFactory_base: {
    new (): {}[];
    super: ArrayConstructor & import("./Globals").IFactory<ArrayConstructor, import("./Globals").NewDelegate<{}[]>, import("./Globals").InitDelegate<{}[]>>;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: any[];
    isArray: (arg: any) => arg is any[];
    from: {
        <T>(arrayLike: ArrayLike<T>): T[];
        <T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
        <T>(iterable: Iterable<T> | ArrayLike<T>): T[];
        <T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
    };
    of: <T>(...items: T[]) => T[];
};
/** Represents an array of items.
 * Note: This is a DreamSpace system array object, and not the native JavaScript object. Because it is not native,
 * manually setting an array item by index past the end will not modify the length property (this may changed as
 * new features are introduce in future EcmaScript versions [such as 'Object.observe()' in ES7]).
 */
declare class ArrayFactory extends ArrayFactory_base {
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
declare const Array_base: {
    new (...args: any[]): {
        /**
        * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
        * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
        * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        *                          false to request that child objects remain connected after disposal (not released). This
        *                          can allow quick initialization of a group of objects, instead of having to pull each one
        *                          from the object pool each time.
        */
        dispose(release?: boolean): void;
    };
} & ArrayConstructor & IObject;
declare class Array<T> extends Array_base<T> {
    [index: number]: T;
    length: number;
    private _length;
    /** Clears the array and returns it. */
    clear(): this;
}
export interface IArray<T = any> extends Array<T> {
}
export { ArrayFactory as Array, Array as ArrayInstance };
/** Represents an object that can have a parent object. */
export declare abstract class DependentObject extends Object {
    readonly parent: DependentObject;
    protected __parent: DependentObject;
}
export interface IDependencyObject extends DependentObject {
}
