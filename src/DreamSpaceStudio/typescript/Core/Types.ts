// ###########################################################################################################################
/** @module Types Shared types and interfaces, and provides functions for type management. */
// ###########################################################################################################################

import { DreamSpace as DS, IDisposable, ITypeInfo, IType, IFunctionInfo, INamespaceInfo } from "./DreamSpace";

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

        //? if (!_namespace.$__fullname)
        //?    error("Types.__registerType()", "The specified namespace '" + getTypeName(parentTypeOrNS) + "' is not registered.  Please make sure to call 'namespace()' first at the top of namespace scopes before factories and types are defined.", type);

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

// =======================================================================================================================

import { IObject } from "./PrimitiveTypes";
import { log, error, LogTypes } from "./Logging";
import { getFunctionName, nameof, getTypeName } from "./Utilities";

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
