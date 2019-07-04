/** 
* Designates and registers a class as a factory class type (see also 'Types.__registerType()' for non-factory supported types).
* Any static constructors defined will also be called at this point (use the 'DreamSpace.constructor' symbol to create static constructors if desired).
* 
* @param moduleSpace A reference to the module that contains the factory.
* @param addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
* applied (using the IFunctionInfo interface).
*/
export function factory(moduleSpace: object, addMemberTypeInfo = true) {
    return function (factory: IType & IFactory): any {  Types.__registerFactoryType(factory, factory, moduleSpace, addMemberTypeInfo); return factory; };
}

/** 
* Associates a class with another class that acts as the factory (see also 'Types.__registerType()' for non-factory supported types).
* Any static constructors defined will also be called at this point (use the 'DreamSpace.constructor' symbol to create static constructors if desired).
* This differs from '@factory()' in that it is mainly used when dealing with generic classes (to prevent losing the generic type information).
*
* @param moduleSpace A reference to the module that contains the factory.
* @param addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
* applied (using the IFunctionInfo interface).
*/
export function usingFactory<TFactory extends IFactory>(factory: TFactory, moduleSpace: object, addMemberTypeInfo = true) {
    if (!(<IFactoryTypeInfo><any>factory).$__type)
        throw "usingFactory(factory, ...) error: 'factory' (" + getTypeName(factory) + ") is not a valid factory, or you forgot to use the '@factory()' decorator to register it.";

    return function (cls: IType): any { return <any>Types.__registerFactoryType(cls, factory, moduleSpace, addMemberTypeInfo); };
}

/** Converts a non-factory object type into a factory type. Any missing 'new' and 'init' functions are populated with defaults.
 * This is used on primitive types when making the 'derived primitive types' for the system.
 * WARNING: This adds a 'new()' and 'init()' function to the given type IF THEY DO NOT ALREADY EXIST. If one exists, that one is not added.
 * @param replaceInit If true any existing 'init' function will be replaced with a default. Default is false.
 * @param replaceNew If true any existing 'new' function will be replaced with a default. Default is false.
 */
export function makeFactory<T extends IType = ObjectConstructor>(obj: T, replaceInit = false, replaceNew = false): T & IFactory<T, NewDelegate<InstanceType<T>>, InitDelegate<InstanceType<T>>> {
    (<IFactory><any>obj).new = !replaceNew && (<IFactory><any>obj).new || function (...args: any[]) { return new obj(...args); };
    (<IFactory><any>obj).init = !replaceInit && (<IFactory><any>obj).init || function (o: InstanceType<T> & { [i: string]: any }, isnew: boolean, ...args: any[]) {
        if (isnew) return o; // (else the object is from the cache of disposed objects)
        Utilities.erase(o);
        var newO: { [i: string]: any } = new obj(...args); // (this exists because we cannot assume the developer will create a better 'init()' for their derived factory type - which they should do)
        for (var p in newO)
            if (newO.hasOwnProperty(p))
                o[p] = newO[p];
    };
    return <any>obj;
}

/**
 * Builds and returns a base type to be used with creating type factories. This function stores some type
 * information in static properties for reference.
 * @param {TBaseFactory} baseFactoryType The factory that this factory type derives from.
*/
export function Factory<TBaseFactory extends IFactory & IType = typeof Object>(baseFactoryType?: TBaseFactory)
    : FactoryBaseType<TBaseFactory> {

    if (!(<IFactoryTypeInfo><any>baseFactoryType).$__type)
        throw "'extends Factory(base)' error: 'base' (" + getTypeName(baseFactoryType) + ") is not a factory, or you forgot to use the '@factory()' decorator to register it."
        + " If the base is a generic-type factory, make sure to use '@usingFactory()' on the generic instance class associated with the factory.";

    if (typeof baseFactoryType != 'function')
        baseFactoryType = <any>Object;

    var cls = class FactoryBase extends (<any>baseFactoryType) {
        //x /** Set to true when the object is being disposed. By default this is undefined.  This is only set to true when 'dispose()' is first call to prevent cyclical calls. */
        //x $__disposing?: boolean;
        //x /** Set to true once the object is disposed. By default this is undefined, which means "not disposed".  This is only set to true when disposed, and false when reinitialized. */
        //x $__disposed?: boolean;

        static $__baseFactoryType: TBaseFactory;

        /** References the base factory. */
        static get super(): TBaseFactory { return this.$__baseFactoryType || void 0; } // ('|| void 0' keeps things consistent in case 'null' is given)

        static 'new'(...args: any[]): any { return null; }
        static init?(o: object, isnew: boolean, ...args: any[]): void;

        /**
          * Don't create objects using the 'new' operator. Use '{NameSpaces...ClassType}.new()' static methods instead.
          */
        constructor(...args: any[]) {
            error("FactoryBase", "You cannot create instances of factory types.");
            super();
        }

        ///** 
        // * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
        // * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
        // * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        // *                          false to request that child objects remain connected after disposal (not released). This
        // *                          can allow quick initialization of a group of objects, instead of having to pull each one
        // *                          from the object pool each time.
        // */
        //dispose(release?: boolean): void { Types.dispose(this, release); }
    };

    cls.$__baseFactoryType = <any>baseFactoryType; // (avoiding closures in case that becomes more efficient)

    return <any>cls;
}

// ############################################################################################################################################
// Factory Pattern Types and Functions
// ############################################################################################################################################

import { getFullTypeName, Types as TypesBase, getTypeName, isDisposable } from "./Types";

// ========================================================================================================================================
// Here we extend the Types import to include extra 

export class Types extends TypesBase { }
/** Contains functions to work with types within the system. */
export namespace Types {
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
    export function __new(this: IFactoryTypeInfo, ...args: any[]): NativeTypes.IObject {
        // ... this is the default 'new' function ...
        // (note: this function may be called with an empty object context [of the expected type] and only one '$__appDomain' property, in which '$__shellType' will be missing)

        if (typeof this != 'function' || !this.init && !this.new)
            error("__new(): Constructor call operation on a non-constructor function.", "Using the 'new' operator is only valid on class and class-factory types. Just call the '{FactoryType}.new()' factory *function* without the 'new' operator.", this);

        var bridge = <IADBridge><any>this; // (note: this should be either a bridge, or a class factory object, or undefined)
        var factory = this;
        var classType: IType = factory.$__type;
        //? var classTypeInfo = <ITypeInfo>classType; // TODO: Follow up: cannot do 'IType & ITypeInfo' and still retain the 'new' signature.

        if (typeof classType != 'function')
            error("__new(): Missing class type on class factory.", "The factory '" + getFullTypeName(factory) + "' is missing the internal '$__type' class reference.", this);

        var appDomain = bridge.$__appDomain || AppDomain && AppDomain.default || void 0;
        var instance: NativeTypes.IObject & IDomainObjectInfo;
        var isNew = false;

        // ... get instance from the pool (of the same type!), or create a new one ...
        // 
        var fullTypeName = factory.$__fullname; // (the factory type holds the proper full name)
        var objectPool = fullTypeName && __disposedObjects[fullTypeName];

        if (objectPool && objectPool.length)
            instance = objectPool.pop();
        else {
            instance = <any>new classType();
            isNew = true;
        }

        // ... initialize DreamSpace and app domain references ...
        instance.$__ds = DS;
        instance.$__id = TypesBase.getNextObjectId();
        if (TypesBase.autoTrackInstances && (!appDomain || appDomain.autoTrackInstances === void 0 || appDomain.autoTrackInstances))
            instance.$__globalId = Utilities.createGUID(false);
        if (appDomain)
            instance.$__appDomain = appDomain;
        if ('$__disposing' in instance) instance.$__disposing = false; // (only reset if exists)
        if ('$__disposed' in instance) instance.$__disposed = false; // (only reset if exists)

        // ... insert [instance, isNew] without having to create a new array ...
        // TODO: Clean up the following when ...rest is more widely supported. Also needs testing to see which is actually more efficient when compiled for ES6.
        if (DS.ES6Targeted) {
            if (typeof this.init == 'function')
                if (Delegate)
                    Delegate.fastCall(this.init, this, instance, isNew, ...arguments);
                else
                    this.init.call(this, instance, isNew, ...arguments);
        } else {
            for (var i = arguments.length - 1; i >= 0; --i)
                arguments[2 + i] = arguments[i];
            arguments[0] = instance;
            arguments[1] = isNew;
            arguments.length += 2;
            if (typeof this.init == 'function')
                if (Delegate)
                    Delegate.fastApply(this.init, this, arguments);
                else
                    this.init.apply(this, arguments);
        }

        // ... finally, add this object to the app domain selected, if any ...
        if (appDomain && appDomain.autoTrackInstances)
            appDomain.attachObject(instance);

        return instance;
    }

    /** 
     * Called to register factory types for a class (see also 'Types.__registerType()' for non-factory supported types).
     * This method should be called AFTER a factory type is fully defined.
     * 
     * @param {IType} factoryType The factory type to associate with the type.
     * @param {modules} moduleSpace A list of all namespaces up to the current type, usually starting with 'DreamSpace' as the first namespace.
     * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
     * applied (using the IFunctionInfo interface).
    */
    export function __registerFactoryType<TClass extends IType, TFactory extends IFactory>
        (instanceType: TClass, factoryType: TFactory, moduleSpace: object, addMemberTypeInfo = true) {

        if (!(<IFactoryTypeInfo><any>factory).$__type)
            throw "__registerFactoryType() error: 'factoryType' (" + getTypeName(factoryType) + ") is not a valid factory, or you forgot to use the '@factory()' decorator to register it."
            + " If the base is a generic-type factory, make sure to use '@usingFactory()' on the generic instance class associated with the factory.";

        var _instanceType = <IFactory<TClass> & IClassInfo & IType & Object><any>instanceType;
        var factoryTypeInfo = <IFactoryTypeInfo & Object><any>factoryType;

        if (typeof factoryType !== 'function')
            error("__registerFactoryType()", "The 'factoryType' argument is not a valid constructor function.", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

        if (typeof moduleSpace != 'object')
            error("__registerFactoryType()", "No module space reference was specified for factory type '" + getFullTypeName(factoryType) + "', which is required. If the type is in the global scope, then use 'DreamSpace.global' or other global reference.", factoryType);

        //x if (!(<ITypeInfo>moduleSpace).$__fullname)
        //x     error("__registerFactoryType()", "The specified namespace given for factory type '" + getFullTypeName(factoryType) + "' is not registered. Please call 'namespace()' to register it first (before the factory is defined).", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

        if (typeof _instanceType == 'undefined')
            error("__registerFactoryType()", "Factory instance type '" + getFullTypeName(factoryType) + ".$__type' is not defined.", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

        if (typeof _instanceType != 'function')
            error("__registerFactoryType()", "'" + getFullTypeName(factoryType) + ".$__type' is not a valid constructor function.", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

        // ... register type information first BEFORER we call any static constructor (so it is available to the user)s ...

        // TODO: (NOTE: this call takes the instance type, which may also be the factory type; if not a factory, then it should have a reference to one)
        var registeredFactory = TypesBase.__registerType(instanceType, moduleSpace, addMemberTypeInfo);

        factoryTypeInfo.$__type = _instanceType; // (the class type AND factory type should both have a reference to each other)
        _instanceType.$__factoryType = factoryTypeInfo; // (a properly registered class that supports the factory pattern should have a reference to its underlying factory type)

        var registeredFactoryType = TypesBase.__registerType(_instanceType, factoryType, addMemberTypeInfo);

        //x .. finally, update the class static properties also with the values set on the factory from the previous line (to be thorough) ...

        //x classType.$__fullname = factoryTypeInfo.$__fullname + "." + classType.$__name; // (the '$__fullname' property on a class should allow absolute reference back to it [note: '__proto__' could work here also due to static inheritance])

        // ... if the user supplied a static constructor then call it now before we do anything more ...
        // (note: the static constructor may be where 'new' and 'init' factory functions are provided, so we MUST call them first before we hook into anything)

        if (typeof (<any>factoryTypeInfo)[<any>DS.constructor] == 'function')
            (<any>factoryTypeInfo)[<any>DS.constructor].call(_instanceType);

        if (typeof (<any>_instanceType)[<any>DS.constructor] == 'function')
            (<any>_instanceType)[<any>DS.constructor](factoryType);

        // ... hook into the 'init' and 'new' factory methods ...
        // (note: if no 'init()' function is specified, just call the base by default)

        if (_instanceType.init)
            error(getFullTypeName(_instanceType), "You cannot create a static 'init' function directly on a class that implements the factory pattern (which could also create inheritance problems).");

        var originalInit = typeof factoryType.init == 'function' ? factoryType.init : null; // (take user defined, else set to null)

        factoryType.init = <any>function _initProxy(this: IFactoryTypeInfo) {
            this.$__initCalled = true; // (flag that THIS init function was called on THIS factory type)
            originalInit && originalInit.apply(this, arguments);
            if (this.$__baseFactoryType && !this.$__baseFactoryType.$__initCalled)
                error(getFullTypeName(_instanceType) + ".init()", "You did not call 'this.super.init()' to complete the initialization chain.");
            // TODO: Once parsing of function parameters are in place we can detect this, but for now require it)
            factoryType.init = originalInit; // (everything is ok here, so bypass this check next time)
        };

        //x if (classType.new)
        //x     error(getFullTypeName(classType), "You cannot create a static 'new' function directly on a class that implements the factory pattern (which could also create inheritance problems).");

        var originalNew = typeof factoryType.new == 'function' ? factoryType.new : null; // (take user defined, else set to null)

        if (!originalNew)
            factoryType.new = __new; // ('new' is missing, so just use the default handler)
        else
            factoryType.new = <any>function _firstTimeNewTest() {
                var result = originalNew.apply(factoryType, arguments) || void 0;
                // (did the user supply a valid 'new' function that returned an object type?)
                if (result === void 0 || result === null) {
                    // (an object is required, otherwise this is not valid or only a place holder; if so, revert to the generic 'new' implementation)
                    factoryType.new = __new;
                    return factoryType.new.apply(factoryType, arguments);
                }
                else if (typeof result != 'object')
                    error(getFullTypeName(_instanceType) + ".new()", "An object instance was expected, but instead a value of type '" + (typeof result) + "' was received.");

                // (else the call returned a valid value, so next time, just default directly to the user supplied factory function)
                factoryType.new = originalNew;
                return result;
            };

        return factoryType;
    }

    var __nonDisposableProperties = <IDomainObjectInfo>{
        $__globalId: <any>true,
        $__appDomain: <any>true,
        $__disposing: true,
        $__disposed: true,
        dispose: <any>false
    };

    /** Used internally to validate that an object can be disposed. */
    export function __disposeValidate(object: IDisposable, title: string, source?: any) {
        if (typeof object != 'object') error(title, "The argument given is not an object.", source);
        if (!object.$__ds) error(title, "The object instance '" + getFullTypeName(object) + "' is not a DreamSpace created object.", source);
        if (object.$__ds != DS) error(title, "The object instance '" + getFullTypeName(object) + "' was created in a different DreamSpace instance and cannot be disposed by this one.", source); // (if loaded as a module perhaps, where other instance may exist [just in case])
        if (typeof object.dispose != 'function') error(title, "The object instance '" + getFullTypeName(object) + "' does not contain a 'dispose()' function.", source);
        if (!isDisposable(object)) error(title, "The object instance '" + getFullTypeName(object) + "' is not disposable.", source);
    }

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
    export function dispose(object: IDisposable, release: boolean = true): void {
        var _object: IDomainObjectInfo = <any>object;

        __disposeValidate(_object, "dispose()", Types);

        if (_object !== void 0) {
            // ... remove the object from the app domain "active" list and then erase it ...

            var appDomain = _object.$__appDomain;

            if (appDomain && !_object.$__disposing) { // (note: '$__disposing' is set to 'true' when '{AppDomain}.dispose()' is called; otherwise they did not call it via the domain instance)
                appDomain.dispose(_object, release);
                return;
            }

            Utilities.erase(object, <any>__nonDisposableProperties);

            _object.$__disposing = false;
            _object.$__disposed = true;

            if (release) {
                // ... place the object into the disposed objects list ...

                var type: ITypeInfo = <any>_object.constructor;

                if (!type.$__fullname)
                    error("dispose()", "The object type is not registered.  Please see one of the AppDomain 'registerClass()/registerType()' functions for more details.", object);

                var disposedObjects = __disposedObjects[type.$__fullname];

                if (!disposedObjects)
                    __disposedObjects[type.$__fullname] = disposedObjects = [];

                disposedObjects.push(_object);
            }
        }
    }
}

// ========================================================================================================================================

import { error } from "./Logging";
import { Utilities } from "./Utilities";
import { Object } from "./PrimitiveTypes";
import { IDomainObjectInfo, IADBridge, AppDomain } from "./AppDomain";
import { Delegate } from "./System/Delegate";
import { DreamSpace as DS, IDisposable, ITypeInfo, IFactory, IType, IFactoryTypeInfo, IClassInfo, NewDelegate, InitDelegate, FactoryBaseType } from "./Globals";

export namespace Types {
    /** Holds all disposed objects that can be reused. */
    export declare var __disposedObjects: { [fulltypename: string]: IDomainObjectInfo[]; }; // (can be reused by any AppDomain instance! [global pool for better efficiency])
    DS.global.Object.defineProperty(Types, "__disposedObjects", { configurable: false, writable: false, value: {} });
}
// ========================================================================================================================================
