import { log, error, LogTypes } from "./Logging";
import { Exception } from "./System/Exception";
import { IDomainObjectInfo, IADBridge, AppDomain } from "./System/AppDomain";
import Utilities from "./Utilities";
import Delegate from "./System/System.Delegate";
import { DreamSpace as DS, IDisposable, ITypeInfo, IFactoryTypeInfo, IType, IFactory, IClassInfo, IFunctionInfo, INamespaceInfo, InitDelegate, NewDelegate } from "./Globals";

// ###########################################################################################################################
// Types for event management.
// ###########################################################################################################################

/** Returns the name of a namespace or variable reference at runtime. */
export function nameof(selector: () => any, fullname = false): string {
    var s = '' + selector;
    //var m = s.match(/return\s*([A-Z.]+)/i) || s.match(/=>\s*{?\s*([A-Z.]+)/i) || s.match(/function.*?{\s*([A-Z.]+)/i);
    var m = s.match(/return\s+([A-Z$_.]+)/i) || s.match(/.*?(?:=>|function.*?{)\s*([A-Z.]+)/i);
    var name = m && m[1] || "";
    return fullname ? name : name.split('.').reverse()[0];
}
// (shared here: https://github.com/Microsoft/TypeScript/issues/1579#issuecomment-394551591)

// =========================================================================================================================================

export var FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])

/** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
export function getFunctionName(func: Function): string {
    // ... if an internal name is already set return it now ...
    var name = (<ITypeInfo><any>func).$__name || func['name'];
    if (name == void 0) {
        // ... check the type (this quickly detects internal/native Browser types) ...
        var typeString: string = Object.prototype.toString.call(func);
        // (typeString is formated like "[object SomeType]")
        if (typeString.charAt(0) == '[' && typeString.charAt(typeString.length - 1) == ']')
            name = typeString.substring(1, typeString.length - 1).split(' ')[1];
        if (!name || name == "Function" || name == "Object") { // (a basic function/object was found)
            if (typeof func == 'function') {
                // ... if this has a function text get the name as defined (in IE, Window+'' returns '[object Window]' but in Chrome it returns 'function Window() { [native code] }') ...
                var fstr = Function.prototype.toString.call(func);
                var results = (FUNC_NAME_REGEX).exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                name = (results && results.length > 1) ? results[1] : void 0;
            }
            else name = void 0;
        }
    }
    return name || "";

}

// =======================================================================================================================

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
export function getTypeName(object: object, cacheTypeName = true): string {
    if (object === void 0 || object === null) return void 0;
    typeInfo = <ITypeInfo>object;
    if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
        if (typeof object == 'function')
            if (cacheTypeName)
                return typeInfo.$__name = getFunctionName(object as Function);
            else
                return getFunctionName(object as Function);
        var typeInfo = <ITypeInfo><any>object.constructor;
        if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
            if (cacheTypeName)
                return typeInfo.$__name = getFunctionName(object.constructor);
            else
                return getFunctionName(object.constructor);
        }
        else
            return typeInfo.$__name;
    }
    else return typeInfo.$__name;
}

/** 
 * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known. 
 * @see getTypeName()
 */
export function getFullTypeName(object: object, cacheTypeName = true): string {
    if ((<ITypeInfo>object).$__fullname) return (<ITypeInfo>object).$__fullname;
    return getTypeName(object, cacheTypeName);
}

/** An utility to extend a TypeScript namespace, which returns a string to be executed using 'eval()'.
 * When executed BEFORE the namespace to be added, it creates a pre-existing namespace reference that forces typescript to update.
 * Example 1: extendNS(()=>Local.NS, "Imported.NS");
 * Example 2: extendNS(()=>Local.NS, ()=>Imported.NS);
 * @param selector The local namespace that will extend the target.
 * @param name A selector or dotted identifier path to the target namespace name to extend from.
 */
export function extendNS(selector: () => any, name: string | (() => any)) {
    return "var " + nameof(selector) + " = " + (typeof name == 'function' ? nameof(name) : name) + ";";
}

//x Best to explicitly let TS and packing utilities know of the DS access explicitly. /** An internal utility to extend the 'DS' namespace within DreamSpace modules, which returns a string to be executed using 'eval()'. 
// * It just calls 'extendNS(selector, "DS")'.
// */
//x export function extendDSNS(selector: () => any) { return extendNS(selector, "DS"); }

// ###########################################################################################################################

export namespace Types {
    /** Returns the root type object from nested type objects. Use this to get the root namespace  */
    export function getRoot(type: ITypeInfo): ITypeInfo {
        var _type: ITypeInfo = type.$__fullname ? type : <any>type['constructor']
        if (_type.$__parent) return getRoot(_type.$__parent);
        return _type;
    }

    /** Holds all the types registered globally by calling one of the 'Types.__register???()' functions. Types are not app-domain specific. */
    export declare var __types: { [fullTypeName: string]: ITypeInfo };
    Object.defineProperty(Types, "__types", { configurable: false, writable: false, value: {} });

    /** Holds all disposed objects that can be reused. */
    export declare var __disposedObjects: { [fulltypename: string]: IDomainObjectInfo[]; }; // (can be reused by any AppDomain instance! [global pool for better efficiency])
    Object.defineProperty(Types, "__disposedObjects", { configurable: false, writable: false, value: {} });

    /** 
     * If true the system will automatically track new objects created under this DreamSpace context and store them in 'Types.__trackedObjects'. 
     * The default is false to prevent memory leaks by those unaware of how the DreamSpace factory pattern works.
     * Setting this to true (either here or within a specific AppDomain) means you take full responsibility to dispose all objects you create.
     */
    export var autoTrackInstances = false;
    export declare var __trackedObjects: IDisposable[];
    Object.defineProperty(Types, "__trackedObjects", { configurable: false, writable: false, value: [] });

    export declare var __nextObjectID: number; // (incremented automatically for each new object instance)
    var ___nextObjectID = 0;
    Object.defineProperty(Types, "__nextObjectID", { configurable: false, get: () => ___nextObjectID });

    /** Returns 'Types.__nextObjectID' and increments the value by 1. */
    export function getNextObjectId() { return ___nextObjectID++; }

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
        var classTypeInfo = <ITypeInfo>classType; // TODO: Follow up: cannot do 'IType & ITypeInfo' and still retain the 'new' signature.

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
        instance.$__corext = DS;
        instance.$__id = getNextObjectId();
        if (autoTrackInstances && (!appDomain || appDomain.autoTrackInstances === void 0 || appDomain.autoTrackInstances))
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

    ///** 
    //x * Called internally once registration is finalized (see also end of 'AppDomain.registerClass()').
    //x * 
    //x * @param {IType} type The type (constructor function) to register.
    //x * @param {IType} factoryType The factory type to associated with the type.
    //x * @param {modules} parentModules A list of all modules up to the current type, usually starting with 'DreamSpace' as the first module.
    //x * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
    //x * applied (using the IFunctionInfo interface).
    //*/
    //x export function __registerFactoryType<TClass extends IType<object>, TFactory extends IFactory<object>>(type: TClass, factoryType: new () => TFactory, parentModules: object[], addMemberTypeInfo = true): TClass & TFactory {

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
        (instanceType: TClass, factoryType: TFactory, moduleSpace: Object, addMemberTypeInfo = true) {

        var _instanceType = <IFactory<TClass> & IClassInfo & IType><any>instanceType;
        var factoryTypeInfo = <IFactoryTypeInfo><any>factoryType;

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

        var registeredFactory = __registerType(factoryType, moduleSpace, addMemberTypeInfo);

        //x factoryTypeInfo.$__type = <any>classType; // (the class type AND factory type should both have a reference to the underlying type)

        //x classType.$__type = <any>classType; // (the class type AND factory type should both have a reference to the underlying type)
        _instanceType.$__factoryType = factoryTypeInfo; // (a properly registered class that supports the factory pattern should have a reference to its underlying factory type)
        //x _instanceType.$__baseFactoryType = factoryTypeInfo.$__baseFactoryType;

        var registeredFactoryType = __registerType(_instanceType, factoryType, addMemberTypeInfo);

        //x .. finally, update the class static properties also with the values set on the factory from the previous line (to be thorough) ...

        //x classType.$__fullname = factoryTypeInfo.$__fullname + "." + classType.$__name; // (the '$__fullname' property on a class should allow absolute reference back to it [note: '__proto__' could work here also due to static inheritance])

        // ... if the user supplied a static constructor then call it now before we do anything more ...
        // (note: the static constructor may be where 'new' and 'init' factory functions are provided, so we MUST call them first before we hook into anything)

        if (typeof factoryType[DS.constructor] == 'function')
            factoryType[DS.constructor].call(_instanceType);

        if (typeof _instanceType[DS.constructor] == 'function')
            _instanceType[DS.constructor](factoryType);

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
    export function __registerType<T extends IType, TParentTypeOrNamespace extends object>(type: T, parentTypeOrNS: TParentTypeOrNamespace, addMemberTypeInfo = true): T {

        var _namespace = <ITypeInfo>parentTypeOrNS;

        if (!_namespace.$__fullname)
            error("Types.__registerType()", "The specified namespace '" + getTypeName(parentTypeOrNS) + "' is not registered.  Please make sure to call 'namespace()' first at the top of namespace scopes before factories and types are defined.", type);

        // ... register the type with the parent namespace ...

        var _type = __registerNamespace(parentTypeOrNS, getTypeName(type));

        // ... scan the type's prototype functions and update the type information (only function names at this time) ...
        // TODO: Consider parsing the function parameters as well and add this information for developers.

        if (addMemberTypeInfo) {
            var prototype = type['prototype'], func: IFunctionInfo;

            for (var pname in prototype)
                if (pname != 'constructor' && pname != '__proto__') {
                    func = <IFunctionInfo>prototype[pname];
                    if (typeof func == 'function') {
                        func.$__argumentTypes = []; // TODO: Add function parameters if specified as parameter comments.
                        func.$__fullname = _type.$__fullname + ".prototype." + pname;
                        func.$__name = pname;
                        func.$__parent = _type;
                        if (!func.name)
                            (<any>func).name = pname; // (may not be supported or available, so try to set it [normally this is read-only])
                    }
                }
        }

        // ... register the type ...
        // (all registered type names will be made available here globally, since types are not AppDomain specific)

        __types[_type.$__fullname] = _type;

        return type;
    }

    /**
     * Registers nested namespaces and adds type information.
     * @param {IType} namespaces A list of namespaces to register.
     * @param {IType} type An optional type (function constructor) to specify at the end of the name space list.
     */
    export function __registerNamespace(root: {}, ...namespaces: string[]): ITypeInfo {
        function exception(msg: String) {
            return error("Types.__registerNamespace(" + rootTypeName + ", " + namespaces.join() + ")", "The namespace/type name '" + nsOrTypeName + "' " + msg + "."
                + " Please double check you have the correct namespace/type names.", root);
        }

        if (!root) root = DS.global;

        var rootTypeName = getTypeName(root);
        var nsOrTypeName = rootTypeName;
        log("Registering namespace for root '" + rootTypeName + "'", namespaces.join());

        var currentNamespace = <INamespaceInfo>root;
        var fullname = (<ITypeInfo>root).$__fullname || "";

        if (root != DS.global && !fullname)
            exception("has not been registered in the type system. Make sure to call 'namespace()' at the top of namespace scopes before defining classes.");

        for (var i = 0, n = namespaces.length; i < n; ++i) {
            nsOrTypeName = namespaces[i];
            var trimmedName = nsOrTypeName.trim();
            if (!nsOrTypeName || !trimmedName) exception("is not a valid namespace name. A namespace must not be empty or only whitespace");
            nsOrTypeName = trimmedName; // (storing the trimmed name at this point allows showing any whitespace-only characters in the error)
            if (root == DS && nsOrTypeName == "DreamSpace") exception("is not valid - 'DreamSpace' must not exist as a nested name under DreamSpace");

            var subNS = <INamespaceInfo>currentNamespace[nsOrTypeName];
            if (!subNS) exception("cannot be found under namespace '" + currentNamespace.$__fullname + "'");

            fullname = fullname ? fullname + "." + nsOrTypeName : nsOrTypeName;

            subNS.$__parent = <INamespaceInfo>currentNamespace; // (each namespace will have a reference to its parent namespace [object], and its local and full type names; note: the DreamSpace parent will be pointing to 'DreamSpace.global')
            subNS.$__name = nsOrTypeName; // (the local namespace name)
            subNS.$__fullname = fullname; // (the fully qualified namespace name for this namespace)
            (currentNamespace.$__namespaces || (currentNamespace.$__namespaces = [])).push(subNS);

            currentNamespace = subNS;
        }

        log("Registered namespace for root '" + rootTypeName + "'", fullname, LogTypes.Info);

        return currentNamespace;
    }

    var __nonDisposableProperties = <IDomainObjectInfo>{
        $__globalId: <any>true,
        $__appDomain: <any>true,
        $__disposing: true,
        $__disposed: true,
        dispose: <any>false
    };

    export function __disposeValidate(object: IDisposable, title: string, source?: any) {
        if (typeof object != 'object') error(title, "The argument given is not an object.", source);
        if (!object.$__corext) error(title, "The object instance '" + getFullTypeName(object) + "' is not a DreamSpace created object.", source);
        if (object.$__corext != DS) error(title, "The object instance '" + getFullTypeName(object) + "' was created in a different DreamSpace instance and cannot be disposed by this one.", source); // (if loaded as a module perhaps, where other instance may exist [just in case])
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

            Utilities.erase(object, __nonDisposableProperties);

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

export interface IClassFactory { }

/** A 'Disposable' base type that implements 'IDisposable', which is the base for all DreamSpace objects that can be disposed. */
export class Disposable implements IDisposable {
    /** 
     * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
     * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
     * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
     *                          false to request that child objects remain connected after disposal (not released). This
     *                          can allow quick initialization of a group of objects, instead of having to pull each one
     *                          from the object pool each time.
     */
    dispose(release?: boolean): void { Types.dispose(this, release); }
}

/** Returns true if the specified object can be disposed using this DreamSpace system. */
export function isDisposable(instance: IDisposable) {
    if (instance.$__corext != DS) return false;
    return typeof instance.dispose == 'function';
}

/** Returns true if the given type (function) represents a primitive type constructor. */
export function isPrimitiveType(o: object) {
    var symbol = typeof Symbol != 'undefined' ? Symbol : Object; // (not supported in IE11)
    return (<object>o == Object || <object>o == Array || <object>o == Boolean || <object>o == String
        || <object>o == Number || <object>o == symbol || <object>o == Function || <object>o == Date
        || <object>o == RegExp || <object>o == Error);
}

/** 
 * Creates a 'Disposable' type from another base type. This is primarily used to extend primitive types.
 * Note: These types are NOT instances of 'DreamSpace.Disposable', since they must have prototype chains that link to other base types.
 * @param {TBaseClass} baseClass The base class to inherit from.
 * @param {boolean} isPrimitiveOrHostBase Set this to true when inheriting from primitive types. This is normally auto-detected, but can be forced in cases
 * where 'new.target' (ES6) prevents proper inheritance from host system base types that are not primitive types.
 * This is only valid if compiling your .ts source for ES5 while also enabling support for ES6 environments. 
 * If you compile your .ts source for ES6 then the 'class' syntax will be used and this value has no affect.
 */
export function makeDisposable<TBaseClass extends IType=ObjectConstructor>(baseClass: TBaseClass, isPrimitiveOrHostBase?: boolean) {
    if (!baseClass) {
        baseClass = <any>DS.global.Object;
        isPrimitiveOrHostBase = true;
    }
    else if (typeof isPrimitiveOrHostBase == 'undefined') isPrimitiveOrHostBase = isPrimitiveType(baseClass);

    var cls = class Disposable extends baseClass implements IDisposable {
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
    cls.prototype.dispose = Disposable.prototype.dispose; // (make these functions both the same function reference by default)
    return cls;
}
type ExcludeNewInit<T extends { new(...args: any[]): any }> = { [P in Exclude<keyof T, 'new' | 'init'>]: T[P] };
type FactoryBaseType<T extends IType> =
    {
        new(): InstanceType<T>;
        /** A reference to the parent type derived from for convenience. */
        super: T;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
    }
    & ExcludeNewInit<T>;
//function Factory<T extends IType, K extends keyof T>(base: T): FactoryBaseType<T> { return <any>base; }

/** Converts a non-factory object type into a factory type.
 * This is used on primitive types when making the 'derived primitive types' for the system.
 * WARNING: This adds a 'new()' and 'init()' function to the given type IF THEY DO NOT ALREADY EXIST. If one exists, that one is not added.
 */
export function makeFactory<T extends IType = ObjectConstructor>(obj: T): T & IFactory<T, NewDelegate<InstanceType<T>>, InitDelegate<InstanceType<T>>> {
    (<IFactory><any>obj).new = (<IFactory><any>obj).new || function (...args: any[]) { return new obj(...args); };
    (<IFactory><any>obj).init = (<IFactory><any>obj).init || function (o: InstanceType<T> & { [i: string]: any }, isnew: boolean, ...args: any[]) {
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
export function Factory<TBaseFactory extends IType>(baseFactoryType: TBaseFactory & IFactory)
    : FactoryBaseType<TBaseFactory> {

    if (typeof baseFactoryType != 'function')
        baseFactoryType = <any>DS.global.Object;

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

/** 
* Designates and registers a class as a factory class type (see also 'Types.__registerType()' for non-factory supported types).
* Any static constructors defined will also be called at this point (use the 'DreamSpace.constructor' symbol to create static constructors if desired).
* 
* @param moduleSpace A reference to the module that contains the factory.
* @param addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
* applied (using the IFunctionInfo interface).
*/
export function factory(moduleSpace: object, addMemberTypeInfo = true) {
    return function (factory: IType & IFactory): any { return <any>Types.__registerFactoryType(factory, factory, moduleSpace, addMemberTypeInfo); };
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
    return function (cls: IType): any { return <any>Types.__registerFactoryType(cls, factory, moduleSpace, addMemberTypeInfo); };
}

// =======================================================================================================================

// ###########################################################################################################################
// TODO: Consider adding a dependency injection system layer.
