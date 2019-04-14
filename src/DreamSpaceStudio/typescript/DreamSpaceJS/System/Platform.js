// ###########################################################################################################################
// Application Domains
// ###########################################################################################################################
define(["require", "exports", "../PrimitiveTypes", "./Exception", "../Types", "./AppDomain"], function (require, exports, PrimitiveTypes_1, Exception_1, Types_1, AppDomain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // =======================================================================================================================
    // Note: DreamSpace.Environments contains the default supported target environments (platforms).
    var Contexts;
    (function (Contexts) {
        /** Creates a new isolated global script environment in the current window for scripts to run in.  An 'IFrame' is used
          * on the client side, and a 'Worker' is used server side. (default) */
        Contexts[Contexts["Secure"] = 0] = "Secure";
        /** Creates a non-isolated global script environment in the current window for scripts to run in.  These script will
          * have access to the host environment. An IFrame is used on the client side, and a new executing context is used
          * server side. */
        Contexts[Contexts["Unsecure"] = 1] = "Unsecure";
        /** Creates a new isolated global script environment in a new window for scripts to run in. On the server side, this
          * is always interpreted as a 'Worker' instance. */
        Contexts[Contexts["SecureWindow"] = 2] = "SecureWindow";
        /** Creates a new isolated global script environment in a new window for scripts to run in.  These script will
          * have access to the host environment. A new executing context is used server side. */
        Contexts[Contexts["UnsecureWindow"] = 3] = "UnsecureWindow";
        /** The local executing context is the target. All scripts loaded into this context become merged with current application. */
        Contexts[Contexts["Local"] = 4] = "Local";
    })(Contexts = exports.Contexts || (exports.Contexts = {}));
    /**
     * A context is a container that manages a reference to a global script environment. Each new context creates a new
     * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
     * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
     * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
     */
    class Context extends Types_1.Factory(PrimitiveTypes_1.Object) {
        constructor() {
            super(...arguments);
            this.x = 1;
        }
        /** Abstract: Cannot create instances of this abstract class. */
        static 'new'() {
            throw Exception_1.Exception.from("You cannot create instances of the abstract Context class.", this);
        }
        static init(o, isnew, context = Contexts.Secure) {
            this.super.init(o, isnew);
            o['_contextType'] = context;
        }
        /** Load a resource (usually a script or page) into this context. */
        load(url) {
            throw Exception_1.Exception.notImplemented("load", this, "Try the default BrowserContext type instead.");
        }
    }
    exports.Context = Context;
    // ========================================================================================================================
    /**
      * Where the Application object represents the base application properties for an AppDomain instance, the UIApplication
      * type, which inherits from Application, represents the UI side.
      * UIApplications encapsulate graph nodes, typically representing HTML, scripts, and modules, and confines them to a root working space.
      * Applications also reference script execution contexts. When application scripts are
      * loaded, they are isolated and run in the context of a new global scope.  This protects the host environment, and also
      * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
      * logins, private information, etc.
      * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
      */
    let UIApplication = class UIApplication extends Types_1.Factory(AppDomain_1.Application) {
        // ========================================================================================================================
        /**
          * Where the Application object represents the base application properties for an AppDomain instance, the UIApplication
          * type, which inherits from Application, represents the UI side.
          * UIApplications encapsulate graph nodes, typically representing HTML, scripts, and modules, and confines them to a root working space.
          * Applications also reference script execution contexts. When application scripts are
          * loaded, they are isolated and run in the context of a new global scope.  This protects the host environment, and also
          * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
          * logins, private information, etc.
          * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
          */
        constructor() {
            super(...arguments);
            this._windows = []; // (a list of windows owned by this application [there is always one entry, which is the application's own window]; note: Windows are also stored in a master window list in the system [where they are created first])
            // ----------------------------------------------------------------------------------------------------------------
        }
        static 'new'(title, appID) { return null; }
        static init(o, isnew, title, description, appID) {
            this.super.init(o, isnew, title, description, appID);
        }
        /** Returns the global context reference for the nested application. Each application gets their own virtual global scope. */
        get global() { return null; }
        // -------------------------------------------------------------------------------------------------------------------
        _onAddToAppDomain(appDomain) {
            for (var i = 0; i < appDomain.applications.length; i++)
                if (appDomain.applications[i]._RootGraphNode == this._RootGraphNode)
                    throw "Cannot add application '" + this.title + "' as another application exists with the same target element.  Two applications cannot render to the same target.";
        }
        // ----------------------------------------------------------------------------------------------------------------
        /** Disposes this UIApplication instance. */
        dispose(release) {
            // ... close all windows ([0] should always be the main application window, which will close last) ...
            for (var i = this._windows.length - 1; i >= 0; --i)
                if (this._windows[i].target != global)
                    this._windows[i].close();
            for (var i = this._windows.length - 1; i >= 0; --i)
                this._windows[i].dispose(release);
            this._windows.length = 0;
            super.dispose();
        }
        ///** Registers a given type by name (constructor function), and creates the function on the last specified module if it doesn't already exist.
        //* @param {Function} type The type (constructor function) to register.
        //* @param {modules} parentModules A list of all modules up to the current type, usually starting with 'DreamSpace' as the first module.
        //* @param {boolean} addMemberTypeInfo If true (default), all member functions of any existing type (function object) will have type information
        //* applied (using the IFunctionInfo interface).
        //*/
        //static registerType<T extends (...args)=>any>(type: string, parentModules: {}[], addMemberTypeInfo?: boolean): T;
        //static registerType(type: Function, parentModules: {}[], addMemberTypeInfo?: boolean): ITypeInfo;
        /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
          * 'ITypeInfo' details will be updated for the object.  This is useful when
          * See also: {AppDomain}.registerType()
          * @param {T} object The object to add to this app domain.
          * @param {{}} parentModule The parent module or scope in which the type exists.
          * @param {{}} parentModule The parent module or scope in which the type exists.
          */
        attachObject(object) {
            if (!type.$__parent || !type.$__name || !type.$__fullname)
                throw Exception_1.Exception.error("with()", "The specified type '" + type.$__name + "' has not yet been registered properly using 'AppDomain.registerType()/.registerClass()'.", type);
            var type = object.constructor;
            this.objects.addObject(object);
            return object;
        }
        //?/** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
        //  * when calling the '{type}.new()' method for creating new instances.
        //  * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
        //  */
        //?with<TClassModule extends IClassModule<Object.$Type>>(classModule: TClassModule): TClassModule {
        //    var typeInfo = <ITypeInfo><any>classModule;
        //    if (!typeInfo.$__parent || !typeInfo.$__name || !typeInfo.$__fullname)
        //        throw Exception.error("with()", "The specified class module has not yet been registered properly using 'AppDomain.registerType()'.", classModule);
        //    var bridge: IADBridge = this.__typeBridges[typeInfo.$__fullname];
        //    if (!bridge) {
        //        var _this = this;
        //        bridge = <any>function ADBridge(): Object { return $Delegate.fastApply(classModule, _this, arguments); };
        //        bridge.prototype = classModule; // (the bridge works only because "type" has STATIC properties, so a bridge object specific to this AppDomain is created, cached, and used)
        //        // ... create a shell type for creating instances of the actual type ...
        //        bridge.$__shellType = <any>(function () { this.constructor = classModule; (<Object.$Type>this).__app = _this; });
        //        bridge.$__shellType.prototype = classModule.$Type.prototype;
        //        this.__typeBridges[typeInfo.$__fullname] = bridge;
        //    }
        //    return <any>bridge;
        //}
        // ----------------------------------------------------------------------------------------------------------------
        /** Try to bring the window for this application to the front. */
        focus() {
        }
    };
    UIApplication = __decorate([
        Types_1.factory(this)
    ], UIApplication);
    exports.UIApplication = UIApplication;
});
// ====================================================================================================================
//# sourceMappingURL=Platform.js.map