define(["require", "exports", "../Types", "../Logging", "../Globals", "./PrimitiveTypes", "./Exception", "./Collections.IndexedObjectCollection", "./System"], function (require, exports, Types_1, Logging_1, Globals_1, PrimitiveTypes_1, Exception_1, Collections_IndexedObjectCollection_1, System_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AppDomain_1, Application_1;
    // ====================================================================================================================================
    //x export class $DomainObject extends Factory(Object) {
    //    //static ' '?= class FactoryRoot {
    //    //    static DomainObject_factory?: IFactoryType<$DomainObject> = {
    //    //    }
    //    //    /** Used to register DreamSpace classes with the system. See 'AppDomain.registerClass()'. */
    //    //    static __register?: RegisterDelegate = () => $DomainObject.$__completeRegistration($DomainObject,
    //    //        FactoryRoot.DomainObject_factory.new, FactoryRoot.DomainObject_factory.init);
    //    //}
    //    // -------------------------------------------------------------------------------------------------------------------
    //}
    //var factoryRoot = $DomainObject[' ']; // (unfortunately, this is required for now: https://github.com/microsoft/typescript/issues/6606)
    ///** The base type for all DreamSpace classes. Users should normally reference 'System.Object' instead of this lower level object. */
    //export var DomainObject = factoryRoot.__register<$DomainObject, typeof $DomainObject, typeof factoryRoot.DomainObject_factory>();
    // ====================================================================================================================================
    /**
     * Application domains encapsulate applications and confine them to a root working space.  When application scripts are
     * loaded, they are isolated and run in the context of a new global scope.  This protects the main window UI, and also
     * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
     * logins, payment details, etc.
     * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
     */
    let AppDomain = AppDomain_1 = class AppDomain extends Types_1.Factory(PrimitiveTypes_1.DSObject) {
        // ====================================================================================================================================
        //x export class $DomainObject extends Factory(Object) {
        //    //static ' '?= class FactoryRoot {
        //    //    static DomainObject_factory?: IFactoryType<$DomainObject> = {
        //    //    }
        //    //    /** Used to register DreamSpace classes with the system. See 'AppDomain.registerClass()'. */
        //    //    static __register?: RegisterDelegate = () => $DomainObject.$__completeRegistration($DomainObject,
        //    //        FactoryRoot.DomainObject_factory.new, FactoryRoot.DomainObject_factory.init);
        //    //}
        //    // -------------------------------------------------------------------------------------------------------------------
        //}
        //var factoryRoot = $DomainObject[' ']; // (unfortunately, this is required for now: https://github.com/microsoft/typescript/issues/6606)
        ///** The base type for all DreamSpace classes. Users should normally reference 'System.Object' instead of this lower level object. */
        //export var DomainObject = factoryRoot.__register<$DomainObject, typeof $DomainObject, typeof factoryRoot.DomainObject_factory>();
        // ====================================================================================================================================
        /**
         * Application domains encapsulate applications and confine them to a root working space.  When application scripts are
         * loaded, they are isolated and run in the context of a new global scope.  This protects the main window UI, and also
         * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
         * logins, payment details, etc.
         * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
         */
        constructor() {
            super(...arguments);
            /** A type bridge is a object instance who's prototype points to the actual static function object.
              * Each time "{AppDomain}.with()" is used, a bridge is created and cached here under the type name for reuse.
              */
            this.__typeBridges = {};
        }
        /** Constructs an application domain for the specific application instance. */
        static init(o, isnew, application) {
            this.super.init(o, isnew);
            o.$__appDomain = o;
            o.__objects = Collections_IndexedObjectCollection_1.IndexedObjectCollection.new();
            o.__objects.__IDPropertyName = "$__appDomainId";
            o.applications = typeof application == 'object' ? [application] : [];
            //? if (global.Object.freeze)
            //?    global.Object.freeze($this); // (properties cannot be modified once set)
        }
        /** The default system wide application domain.
        * See 'System.Platform.AppDomain' for more details.
        */
        static get default() { return AppDomain_1._default; }
        static set default(value) {
            if (!value || !(value instanceof AppDomain_1))
                Logging_1.error("AppDomain.default", "A valid 'AppDomain' instance is required.");
            this._default = value;
        }
        /**
         * A collection of all objects tracked by this application domain instance (see the 'autoTrackInstances' property).
         * Each object is given an ID value that is unique for this specific AppDomain instance only.
         */
        get objects() { return this.__objects; }
        // (why an object pool? http://www.html5rocks.com/en/tutorials/speed/static-mem-pools/)
        // Note: requires calling '{System.Object}.track()' or setting '{System.AppDomain}.autoTrack=true'.
        /** Returns the default (first) application for this domain. */
        application() {
            if (!this.applications.length)
                throw Exception_1.Exception.error("AppDomain", "This application domain has no application instances.", this);
            return this.applications[0];
        }
        dispose(object, release = true) {
            var _object = object;
            if (arguments.length > 0) {
                Types_1.Types.__disposeValidate(object, "{AppDomain}.dispose()", this);
                // ... make sure 'dispose()' was called on the object for the correct app domain ...
                if (typeof _object.$__appDomain == 'object' && _object.$__appDomain != this)
                    Logging_1.error("{AppDomain}.dispose()", "The given object cannot be disposed by this app domain as it belongs to a different instance.", this);
                _object.$__disposing = true;
                // ... verified that this is the correct domain; remove the object from the "active" list and erase it ...
                if (_object.$__appDomainId >= 0)
                    this.objects.removeObject(_object);
                System_1.dispose(_object, release);
            }
            else {
                // ... dispose was called without parameters, so assume to dispose the app domain ...
                for (var i = this._applications.length - 1; i >= 0; --i)
                    this._applications[i].dispose(release);
                this._applications.length = 0;
            }
            //if (this == $AppDomain.default)
            //    global.close(); // (the default app domain is assumed to be the browser window, so try to close it now)
        }
        ///** Registers a DreamSpace type under a specified namespace and returns the given type reference when done.
        //  * Note: Prototype functions for registered types are also updated to support the ITypeInfo interface.
        //  * @param {object} classModule The class module container to register (the class to register in the module must have the name '$Type').
        //  * @param {modules} parentModules A list of all modules up to the current type, usually starting with 'DreamSpace' as the first module.
        //  * Tip: If code completion is available, hover your mouse cursor over the class type to see the full namespace path.
        //  * @param {boolean} addMemberTypeInfo If true (default), all class member functions on the type (function object) will have type information
        //  * applied (using the IFunctionInfo interface).
        //  */
        //static registerType<T>(type: T, parentModules: object[], addMemberTypeInfo: boolean = true) : T {
        //    // ... get the type name for the class (only available on classes; modules end up being simple objects only) ...
        //    // (note: if 'classType' will be replaced on the last module with a new constructor function)
        //    // ***************
        //    // *************** TODONEXT: Need domain object to handle most of this perhaps, where applicable. ***************
        //    // ***************
        //    if (typeof type !== FUNCTION)
        //        throw Exception.error("registerClass()", "The 'classType' argument is not a valid constructor function.", type); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.
        //    //if (!(type instanceof Object.$__type))
        //    //    throw Exception.error("registerClass()", "Class is not of type 'System.Object'.", type);
        //    var classTypeInfo: ITypeInfo = <any>type;
        //    // ... validate that type info and module info exists, otherwise add/update it ...
        //    var modInfo = <INamespaceInfo><any>classTypeInfo.$__parent;
        //    if (!modInfo || !modInfo.$__name || !modInfo.$__fullname)
        //        this.registerType(type, parentModules, addMemberTypeInfo);
        //    // ... establish the static property definitions ...
        //    //? Property.__completePropertyRegistration(classTypeInfo);
        //    if (!type.prototype.hasOwnProperty("toString"))
        //        type.prototype.toString = function (): string { return (<INamespaceInfo>this).$__fullname; }
        //    //? if (!classType.prototype.hasOwnProperty("valueOf"))
        //    //    classType.prototype.valueOf = function () { return this; };
        //    return (newFunc || initFunc) ? <any>__RegisterFactoryType(type, newFunc, initFunc) : void 0;
        //    // (note: 'factoryDefinition' many not be defined if only registering a class with the AppDomain, where the class completed the factory registration part another way [see DreamSpace primitive types])
        //}
        /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
          * 'ITypeInfo' details will be updated for the object.  This is useful when
          * See also: {AppDomain}.registerType()
          * @param {T} object The object to add to this app domain.
          * @param {{}} parentModule The parent module or scope in which the type exists.
          * @param {{}} parentModule The parent module or scope in which the type exists.
          */
        attachObject(object) {
            //var type: IFunctionInfo = <IFunctionInfo>object.constructor;
            var type = object;
            if (type.$__disposing || type.$__disposed)
                Logging_1.error("attachObject()", "The specified object instance of type '" + Types_1.getFullTypeName(type) + "' is disposed.", type);
            if (!type.$__ds || !type.$__appDomain || !type.dispose)
                Logging_1.error("attachObject()", "The specified type '" + Types_1.getFullTypeName(type) + "' is not valid for this operation. Make sure to use 'DreamSpace.ClassFactory()' to create valid factory types, or make sure the 'IDomainObjectInfo' properties are satisfied.", type);
            if (type.$__appDomain != this)
                Logging_1.error("attachObject()", "The specified object instance of type '" + Types_1.getFullTypeName(type) + "' is already attached to a different application domain.", type);
            this.objects.addObject(object);
            return object;
        }
        /** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
          * as a chain method for getting a new instance from a type.
          * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
          */
        with(type) {
            var typeInfo = type;
            if (!typeInfo.$__parent || !typeInfo.$__name || !typeInfo.$__fullname)
                throw Exception_1.Exception.error("with()", "The specified type has not yet been registered properly. Extend from 'DreamSpace.ClassFactory()' or use utility functions in 'DreamSpace.Types' when creating factory types.", type);
            var bridge = this.__typeBridges[typeInfo.$__fullname];
            if (!bridge) {
                var appDomain = this;
                var bridgeConstructor = function ADBridge() { this.constructor = type.constructor; this.$__appDomain = appDomain; };
                /* This references the type to perform some action on with the select app domain. Any property reference on the bridge is redirected to the class type. */
                bridgeConstructor.prototype = type; // (the bridge works only because "type" has STATIC properties, so a bridge object specific to this AppDomain is created, cached, and used to intercept properties on the targeted type)
                // ... cache the type so this bridge only has to be created once for this type ...
                this.__typeBridges[typeInfo.$__fullname] = bridge = new bridgeConstructor();
            }
            return bridge;
        }
        createApplication(factory, title, description) {
            //if (!Platform.UIApplication)
            //    throw Exception.error("AppDomain.createApplication()", "");
            var appIndex = this.applications.length;
            var newApp = this.with(factory).new(title, description, appIndex);
            this.applications.push(newApp);
            try {
                newApp['_onAddToAppDomain'](this, newApp);
                return newApp;
            }
            catch (ex) {
                this.applications.splice(appIndex, 1);
                throw ex;
            }
        }
    };
    /** A list of all application domains in the system. */
    AppDomain.appDomains = [AppDomain_1.default];
    AppDomain = AppDomain_1 = __decorate([
        Types_1.factory(this)
    ], AppDomain);
    exports.AppDomain = AppDomain;
    //x $AppDomain.prototype.createApplication = function createApplication<TApp extends typeof $Application>(classFactory?: IFactory<TApp>, parent?: Platform.UI.GraphNode, title?: string, description?: string, targetElement?: HTMLElement): TApp {
    //    if (!Platform.UIApplication)
    //        throw Exception.error("AppDomain.createApplication()", "");
    //    return (<$AppDomain>this).with(<any>classFactory || Platform.UIApplication)(parent, title, description, targetElement);
    //};
    // ===================================================================================================================================
    /** Applications wrap window reference targets, and any specified HTML for configuration and display. There can be many
      * applications in a single AppDomain.
      */
    let Application = Application_1 = class Application extends Types_1.Factory(PrimitiveTypes_1.DSObject) {
        // -------------------------------------------------------------------------------------------------------------------------------
        /** The default system wide application domain.
          * See 'System.Platform.AppDomain' for more details.
          */
        static get default() { return this._default; }
        static set default(value) {
            if (!value || !(value instanceof Application_1))
                Logging_1.error("Application.default", "A valid 'Application' instance is required.");
            this._default = value;
        }
        // -------------------------------------------------------------------------------------------------------------------------------
        /** References the current running application that owns the current running environment. */
        static get current() {
            return this._current;
        }
        /** References the application who's window currently has user focus. You can also set this property to change window focus. */
        static get focused() {
            return this._focused;
        }
        static set focused(value) {
            if (this._focused !== value) {
                this._focused = value;
                if (typeof value == 'object' && typeof value.focus == 'function')
                    value.focus();
            }
        }
        // --------------------------------------------------------------------------------------------------------------------------
        /** Returns true if this application is focused. */
        get isFocused() { return this._isFocused; }
        get appID() { return this._appID; }
        get title() { return this._title; }
        get description() { return this._description; }
        get appDomains() { return this._appDomains; }
        /** Returns the default (first) application for this domain. */
        application() {
            if (!this.applications.length)
                throw Exception_1.Exception.error("AppDomain", "This application domain has no application instances.", this);
            return this.applications[0];
        }
        // -------------------------------------------------------------------------------------------------------------------------------
        _onAddToAppDomain(appDomain, app) {
        }
        // -------------------------------------------------------------------------------------------------------------------------------
        /** Try to bring the window for this application to the front. */
        focus() {
        }
        // -------------------------------------------------------------------------------------------------------------------------------
        /** Closes the application by disposing all owned AppDomain instances, which also closes any opened windows, including the application's own window as well. */
        close() {
            // ... close all except "self" ([0]), then close "self" ...
            for (var i = this._appDomains.length - 1; i > 0; --i)
                this._appDomains[i].dispose();
            this._appDomains[0].dispose();
        }
        // -------------------------------------------------------------------------------------------------------------------------------
        static [Globals_1.DreamSpace.constructor](f) {
            f.init = (o, isnew, title, description, appID) => {
                f.super.init(o, isnew);
                o.$__app = o;
                o._title = title;
                o._description = description;
                o._appID = appID;
            };
        }
    };
    Application._current = null;
    // -------------------------------------------------------------------------------------------------------------------------------
    /** A list of all applications in the system. */
    Application.applications = [Application_1._default];
    Application._focused = null;
    Application = Application_1 = __decorate([
        Types_1.factory(this)
    ], Application);
    exports.Application = Application;
    // ===================================================================================================================================
    // Create a default application domain and default application.
    // The default app domain is used for new objects created, and the default application can be used to easily represent the current web application.
    AppDomain.default = AppDomain.new();
    Application.default = Application.new(Globals_1.DreamSpace.global.document.title, "Default Application", 0);
    Globals_1.frozen(AppDomain);
    Globals_1.frozen(Application);
});
// ========================================================================================================================================
//# sourceMappingURL=AppDomain.js.map