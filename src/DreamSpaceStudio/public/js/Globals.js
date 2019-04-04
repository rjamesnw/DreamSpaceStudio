// ###########################################################################################################################
// These are functions for creating global scope variables/references that eliminate/minimize collisions between conflicting scripts.
// Normally, each manifest and module gets its own local-global scope; however, in some cases, 3rd-party libraries do not 
// expect or support dot-delimited object paths, so unfortunately a root global callback reference may be required in such cases.
// DreamSpace.Globals contains functions to help deal with this as it relates to loading modules.
// Note: There's no need to use any of these functions directly from within manifest and module scripts.  Each has a local reference
// using the identifiers 'this', 'manifest', or 'module' (accordingly), which provides functions for local-global scope storage.
// ###########################################################################################################################
/** The root namespace name as a string constant. */
const $__ROOT_DREAMSPACE_NAMESPACE_NAME = "DreamSpace";
/**
 * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
 * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
 * named index based lookups, so no string concatenation is used, which makes the process many times faster.
 * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
 * property names.  To be safe, make sure to always use the 'DreamSpace.Globals.register()' function.  It can create isolated
 * global variables, and if necessary, also create a safer unique host global scope name.
 */
var DreamSpace;
(function (DreamSpace) {
    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    DreamSpace.global = (function () { }.constructor("return this"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])
    DreamSpace.host = (() => {
        // ... make sure the host object is valid for at least checking client/server/studio states
        if (typeof DreamSpace.host !== 'object' || typeof DreamSpace.host.isClient == 'undefined' || typeof DreamSpace.host.isServer == 'undefined' || typeof DreamSpace.host.isStudio == 'undefined')
            return new __NonDreamSpaceHost__();
        else
            return DreamSpace.host; // (running in a valid host (or emulator? ;) )
    })();
    let Globals;
    (function (Globals) {
        /** Internal: used when initializing DreamSpace. */
        var _globals = Globals;
        var _namespaces = {};
        var _nsCount = 1;
        function register(namespace, name, initialValue, asHostGlobal = false) {
            var nsID, nsglobals, alreadyRegistered = false;
            if (typeof namespace == 'object' && namespace.url)
                namespace = namespace.url;
            if (!(namespace in _namespaces))
                _namespaces[namespace] = nsID = '_' + _nsCount++;
            else {
                nsID = _namespaces[namespace];
                alreadyRegistered = true;
            }
            nsglobals = _globals[nsID];
            if (!nsglobals)
                _globals[nsID] = nsglobals = {};
            //?if (name in nsglobals)
            //?    throw System.Exception.from("The global variable name '" + name + "' already exists in the global namespace '" + namespace + "'.", namespace);
            if (asHostGlobal) {
                // ... set and return a host global reference ...
                var hostGlobalName = "_" + $__ROOT_DREAMSPACE_NAMESPACE_NAME + nsID + "_" + name;
                if (!alreadyRegistered) {
                    nsglobals[name] = { "global": DreamSpace.global, "hostGlobalName": hostGlobalName }; // (any namespace global value referencing the global [window] scope is a redirect to lookup the value name there instead)
                    DreamSpace.global[hostGlobalName] = initialValue;
                }
                return hostGlobalName;
            }
            else {
                // ... set and return a namespace global reference (only works for routines that support dot-delimited callback references) ...
                if (!alreadyRegistered)
                    nsglobals[name] = initialValue;
                if (/^[A-Z_\$]+[A-Z0-9_\$]*$/gim.test(name)) // (if 'name' contains invalid identifier characters, then it needs to be referenced by index)
                    return $__ROOT_DREAMSPACE_NAMESPACE_NAME + ".Globals." + nsID + "." + name;
                else
                    return $__ROOT_DREAMSPACE_NAMESPACE_NAME + ".Globals." + nsID + "['" + name.replace(/'/g, "\\'") + "']";
            }
        }
        Globals.register = register;
        ;
        function exists(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            return name in nsglobals;
        }
        Globals.exists = exists;
        ;
        function erase(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return false;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == DreamSpace.global) {
                var hgname = existingValue["hostGlobalName"];
                delete DreamSpace.global[hgname];
            }
            return nsglobals[name] === void 0;
        }
        Globals.erase = erase;
        ;
        function clear(namespace) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            for (var name in nsglobals) { // (clear any root globals first before resetting the namespace global instance)
                var existingValue = nsglobals[name];
                if (existingValue && existingValue["global"] == DreamSpace.global)
                    delete DreamSpace.global[existingValue["hostGlobalName"]];
            }
            _globals[nsID] = {};
            return true;
        }
        Globals.clear = clear;
        ;
        function setValue(namespace, name, value) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID) {
                //?throw System.Exception.from("The namespace '" + namespace + "' does not exist - did you remember to call 'DreamSpace.Globals.register()' first?", namespace);
                register(namespace, name, value); // (implicitly register the namespace as a local global)
                nsID = _namespaces[namespace];
            }
            nsglobals = _globals[nsID];
            //?if (!(name in nsglobals))
            //?    throw System.Exception.from("The global variable name '" + name + "' was not found in the global namespace '" + namespace + "' - did you remember to call 'DreamSpace.Globals.register()' first?", namespace);
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == DreamSpace.global) {
                return DreamSpace.global[existingValue["hostGlobalName"]] = value;
            }
            else
                return nsglobals[name] = value;
        }
        Globals.setValue = setValue;
        ;
        function getValue(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                throw DreamSpace.System.Exception.from("The namespace '" + namespace + "' does not exist - did you remember to call 'DreamSpace.Globals.register()' first?", namespace);
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return void 0;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == DreamSpace.global) {
                return DreamSpace.global[existingValue["hostGlobalName"]];
            }
            else
                return nsglobals[name];
        }
        Globals.getValue = getValue;
        ;
    })(Globals = DreamSpace.Globals || (DreamSpace.Globals = {}));
})(DreamSpace || (DreamSpace = {}));
// ###########################################################################################################################
//# sourceMappingURL=Globals.js.map