// ###########################################################################################################################
/** @module Types Shared types and interfaces, and provides functions for type management. */
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

export class Types { }
/** Contains type-focused utility functions to work with types within the system. */
export namespace Types {
    /** Returns the root type object from nested type objects. Use this to get the root namespace  */
    export function getRoot(type: ITypeInfo): ITypeInfo {
        var _type: ITypeInfo = type.$__fullname ? type : <any>type['constructor']
        if (_type.$__parent) return getRoot(_type.$__parent);
        return _type;
    }

    /** Holds all the types registered globally by calling one of the 'Types.__register???()' functions. Types are not app-domain specific. */
    export declare var __types: { [fullTypeName: string]: ITypeInfo };

    /** 
     * If true the system will automatically track new objects created under this DreamSpace context and store them in 'Types.__trackedObjects'. 
     * The default is false to prevent memory leaks by those unaware of how the DreamSpace factory pattern works.
     * Setting this to true (either here or within a specific AppDomain) means you take full responsibility to dispose all objects you create.
     */
    export var autoTrackInstances = false;
    export declare var __trackedObjects: IDisposable[];

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

        var currentNamespace = <INamespaceInfo & IndexedObject>root;
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
}

/** Returns true if the specified object can be disposed using this DreamSpace system. */
export function isDisposable(instance: IDisposable) {
    if (instance.$__ds != DS) return false;
    return typeof instance.dispose == 'function';
}

/** Returns true if the given type (function) represents a primitive JavaScript type constructor. */
export function isPrimitiveType(o: object) {
    var symbol = typeof Symbol != 'undefined' ? Symbol : Object; // (not supported in IE11)
    return (<object>o == Object || <object>o == Array || <object>o == Boolean || <object>o == String
        || <object>o == Number || <object>o == symbol || <object>o == Function || <object>o == Date
        || <object>o == RegExp || <object>o == Error);
}

// =======================================================================================================================

import { DreamSpace as DS, IDisposable, ITypeInfo, IType, IFunctionInfo, INamespaceInfo } from "./Globals";
import { Object } from "./PrimitiveTypes";
import { log, error, LogTypes } from "./Logging";

export namespace Types {
    //export declare var __nextObjectID: number; // (incremented automatically for each new object instance)
    var __nextObjectID = 0;

    /** Returns the current 'Types.__nextObjectID' value and then increments the property by 1. */
    export function getNextObjectId() { return __nextObjectID++; }

    DS.global.Object.defineProperty(Types, "__types", { configurable: false, writable: false, value: {} });
    DS.global.Object.defineProperty(Types, "__trackedObjects", { configurable: false, writable: false, value: [] });
    DS.global.Object.defineProperty(Types, "__nextObjectID", { configurable: false, get: getNextObjectId });
}

// =======================================================================================================================

// ###########################################################################################################################
// TODO: Consider adding a dependency injection system layer.
