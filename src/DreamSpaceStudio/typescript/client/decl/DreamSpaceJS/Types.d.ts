/** @module Types Shared types and interfaces, and provides functions for type management. */
import { IDomainObjectInfo } from "./System/AppDomain";
import { IDisposable, ITypeInfo, IFactoryTypeInfo, IType, IFactory, InitDelegate, NewDelegate } from "./Globals";
import { Object } from "./PrimitiveTypes";
/** Returns the name of a namespace or variable reference at runtime. */
export declare function nameof(selector: () => any, fullname?: boolean): string;
export declare var FUNC_NAME_REGEX: RegExp;
/** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
export declare function getFunctionName(func: Function): string;
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
export declare function getTypeName(object: object, cacheTypeName?: boolean): string;
/**
 * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known.
 * @see getTypeName()
 */
export declare function getFullTypeName(object: object, cacheTypeName?: boolean): string;
/** An utility to extend a TypeScript namespace, which returns a string to be executed using 'eval()'.
 * When executed BEFORE the namespace to be added, it creates a pre-existing namespace reference that forces typescript to update.
 * Example 1: extendNS(()=>Local.NS, "Imported.NS");
 * Example 2: extendNS(()=>Local.NS, ()=>Imported.NS);
 * @param selector The local namespace that will extend the target.
 * @param name A selector or dotted identifier path to the target namespace name to extend from.
 */
export declare function extendNS(selector: () => any, name: string | (() => any)): string;
/** Contains functions to work with types within the system. */
export declare namespace Types {
    /** Returns the root type object from nested type objects. Use this to get the root namespace  */
    function getRoot(type: ITypeInfo): ITypeInfo;
    /** Holds all the types registered globally by calling one of the 'Types.__register???()' functions. Types are not app-domain specific. */
    var __types: {
        [fullTypeName: string]: ITypeInfo;
    };
    /** Holds all disposed objects that can be reused. */
    var __disposedObjects: {
        [fulltypename: string]: IDomainObjectInfo[];
    };
    /**
     * If true the system will automatically track new objects created under this DreamSpace context and store them in 'Types.__trackedObjects'.
     * The default is false to prevent memory leaks by those unaware of how the DreamSpace factory pattern works.
     * Setting this to true (either here or within a specific AppDomain) means you take full responsibility to dispose all objects you create.
     */
    var autoTrackInstances: boolean;
    var __trackedObjects: IDisposable[];
    var __nextObjectID: number;
    /** Returns 'Types.__nextObjectID' and increments the value by 1. */
    function getNextObjectId(): number;
    /**
      * Used in place of the constructor to create a new instance of the underlying object type for a specific domain.
      * This allows the reuse of disposed objects to prevent garbage collection hits that may cause the application to lag, and
      * also makes sure the object is associated with an application domain. Reducing lag due to GC collection is an
      * important consideration when development games, which makes the DreamSpaceJS system a great way to get started quickly.
      *
      * Objects that derive from 'System.Object' should register the type and supply a custom 'init' function instead of a
      * constructor (in fact, only a default constructor should exist). This is done by creating a static property on the class
      * that uses 'TypeFactory.__RegisterFactoryType()' to register the type.
      *
      * Performance note: When creating thousands of objects continually, proper DreamSpace object disposal (and subsequent
      * cache of the instances) means the GC doesn't have to keep engaging to clear up the abandoned objects.  While using
      * the 'new' operator may be faster than using "{type}.new()" factory function at first, the application actually
      * becomes very lagged while the GC keeps eventually kicking in. This is why DreamSpace objects are cached and reused as
      * much as possible, and why you should try to refrain from using the 'new', operator, or any other operation that
      * creates objects that the GC has to manage by blocking the main thread.
      */
    function __new(this: IFactoryTypeInfo, ...args: any[]): NativeTypes.IObject;
    /**
     * Called to register factory types for a class (see also 'Types.__registerType()' for non-factory supported types).
     * This method should be called AFTER a factory type is fully defined.
     *
     * @param {IType} factoryType The factory type to associate with the type.
     * @param {modules} moduleSpace A list of all namespaces up to the current type, usually starting with 'DreamSpace' as the first namespace.
     * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
     * applied (using the IFunctionInfo interface).
    */
    function __registerFactoryType<TClass extends IType, TFactory extends IFactory>(instanceType: TClass, factoryType: TFactory, moduleSpace: object, addMemberTypeInfo?: boolean): TFactory;
    /**
     * Registers a given type (constructor function) in a specified namespace and builds some relational type properties.
     *
     * Note: DO NOT use this to register factory types.  You must used '__registerFactoryType()' for those.
     *
     * @param {IType} type The type (constructor function) to register.
     * @param {modules} parentNamespaces A list of all modules up to the current type, usually starting with 'DreamSpace' as the first module.
     * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type will have type information applied (using the IFunctionInfo interface).
     * @param {boolean} exportName (optional) The name exported from the namespace for this type. By default the type (class) name is assumed.
     * If the name exported from the namespace is different, specify it here.
     */
    function __registerType<T extends IType, TParentTypeOrNamespace extends object>(type: T, parentTypeOrNS: TParentTypeOrNamespace, addMemberTypeInfo?: boolean): T;
    /**
     * Registers nested namespaces and adds type information.
     * @param {IType} namespaces A list of namespaces to register.
     * @param {IType} type An optional type (function constructor) to specify at the end of the name space list.
     */
    function __registerNamespace(root: {}, ...namespaces: string[]): ITypeInfo;
    /** Used internally to validate that an object can be disposed. */
    function __disposeValidate(object: IDisposable, title: string, source?: any): void;
    /** Disposes a specific object in this AppDomain instance.
     * When creating thousands of objects continually, object disposal (and subsequent cache of the instances) means the GC doesn't have
     * to keep engaging to clear up the abandoned objects.  While using the "new" operator may be faster than using "{type}.new()" at
     * first, the application actually becomes very lagged while the GC keeps eventually kicking in.  This is why DreamSpace objects are
     * cached and reused as much as possible.
     * @param {object} object The object to dispose and release back into the "disposed objects" pool.
     * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
     *                          false to request that child objects remain associated after disposal (not released). This
     *                          can allow quick initialization of a group of objects, instead of having to pull each one
     *                          from the object pool each time.
     */
    function dispose(object: IDisposable, release?: boolean): void;
}
/** Returns true if the specified object can be disposed using this DreamSpace system. */
export declare function isDisposable(instance: IDisposable): boolean;
/** Returns true if the given type (function) represents a primitive JavaScript type constructor. */
export declare function isPrimitiveType(o: object): boolean;
declare type ExcludeNewInit<T extends {
    new (...args: any[]): any;
}> = {
    [P in Exclude<keyof T, 'new' | 'init'>]: T[P];
};
declare type FactoryBaseType<T extends IType> = {
    new (): InstanceType<T>;
    /** A reference to the parent type derived from for convenience. */
    super: T;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & ExcludeNewInit<T>;
/** Converts a non-factory object type into a factory type. Any missing 'new' and 'init' functions are populated with defaults.
 * This is used on primitive types when making the 'derived primitive types' for the system.
 * WARNING: This adds a 'new()' and 'init()' function to the given type IF THEY DO NOT ALREADY EXIST. If one exists, that one is not added.
 * @param replaceInit If true any existing 'init' function will be replaced with a default. Default is false.
 * @param replaceNew If true any existing 'new' function will be replaced with a default. Default is false.
 */
export declare function makeFactory<T extends IType = ObjectConstructor>(obj: T, replaceInit?: boolean, replaceNew?: boolean): T & IFactory<T, NewDelegate<InstanceType<T>>, InitDelegate<InstanceType<T>>>;
/**
 * Builds and returns a base type to be used with creating type factories. This function stores some type
 * information in static properties for reference.
 * @param {TBaseFactory} baseFactoryType The factory that this factory type derives from.
*/
export declare function Factory<TBaseFactory extends IFactory & IType = typeof Object>(baseFactoryType?: TBaseFactory): FactoryBaseType<TBaseFactory>;
/**
* Designates and registers a class as a factory class type (see also 'Types.__registerType()' for non-factory supported types).
* Any static constructors defined will also be called at this point (use the 'DreamSpace.constructor' symbol to create static constructors if desired).
*
* @param moduleSpace A reference to the module that contains the factory.
* @param addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
* applied (using the IFunctionInfo interface).
*/
export declare function factory(moduleSpace: object, addMemberTypeInfo?: boolean): (factory: IType<object> & IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>>) => any;
/**
* Associates a class with another class that acts as the factory (see also 'Types.__registerType()' for non-factory supported types).
* Any static constructors defined will also be called at this point (use the 'DreamSpace.constructor' symbol to create static constructors if desired).
* This differs from '@factory()' in that it is mainly used when dealing with generic classes (to prevent losing the generic type information).
*
* @param moduleSpace A reference to the module that contains the factory.
* @param addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
* applied (using the IFunctionInfo interface).
*/
export declare function usingFactory<TFactory extends IFactory>(factory: TFactory, moduleSpace: object, addMemberTypeInfo?: boolean): (cls: IType<any>) => any;
export {};
