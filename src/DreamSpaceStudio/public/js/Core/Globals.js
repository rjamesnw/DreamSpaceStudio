// ###########################################################################################################################
// These are functions for creating global scope variables/references that eliminate/minimize collisions between conflicting scripts.
// Normally, each manifest and module gets its own local-global scope; however, in some cases, 3rd-party libraries do not 
// expect or support dot-delimited object paths, so unfortunately a root global callback reference may be required in such cases.
// DreamSpace.Globals contains functions to help deal with this as it relates to loading modules.
// Note: There's no need to use any of these functions directly from within manifest and module scripts.  Each has a local reference
// using the identifiers 'this', 'manifest', or 'module' (accordingly), which provides functions for local-global scope storage.
// ###########################################################################################################################
define(["require", "exports", "./DreamSpace"], function (require, exports, DreamSpace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
     * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
     * named index based lookups, so no string concatenation is used, which makes the process many times faster.
     * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
     * property names.  To be safe, make sure to always use the 'DreamSpace.Globals.register()' function.  It can create isolated
     * global variables, and if necessary, also create a safer unique host global scope name.
     */
    class Globals {
    }
    exports.Globals = Globals;
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
                var hostGlobalName = "_" + DreamSpace_1.DEFAULT_GLOBAL_NS_NAME + nsID + "_" + name;
                if (!alreadyRegistered) {
                    nsglobals[name] = { "global": DreamSpace_1.DreamSpace.global, "hostGlobalName": hostGlobalName }; // (any namespace global value referencing the global [window] scope is a redirect to lookup the value name there instead)
                    DreamSpace_1.DreamSpace.global[hostGlobalName] = initialValue;
                }
                return hostGlobalName;
            }
            else {
                // ... set and return a namespace global reference (only works for routines that support dot-delimited callback references) ...
                if (!alreadyRegistered)
                    nsglobals[name] = initialValue;
                if (/^[A-Z_\$]+[A-Z0-9_\$]*$/gim.test(name)) // (if 'name' contains invalid identifier characters, then it needs to be referenced by index)
                    return DreamSpace_1.DEFAULT_GLOBAL_NS_NAME + ".Globals." + nsID + "." + name;
                else
                    return DreamSpace_1.DEFAULT_GLOBAL_NS_NAME + ".Globals." + nsID + "['" + name.replace(/'/g, "\\'") + "']";
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
            if (existingValue && existingValue["global"] == DreamSpace_1.DreamSpace.global) {
                var hgname = existingValue["hostGlobalName"];
                delete DreamSpace_1.DreamSpace.global[hgname];
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
                if (existingValue && existingValue["global"] == DreamSpace_1.DreamSpace.global)
                    delete DreamSpace_1.DreamSpace.global[existingValue["hostGlobalName"]];
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
            if (existingValue && existingValue["global"] == DreamSpace_1.DreamSpace.global) {
                return DreamSpace_1.DreamSpace.global[existingValue["hostGlobalName"]] = value;
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
                throw "The namespace '" + namespace + "' does not exist - did you remember to call 'DreamSpace.Globals.register()' first?";
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return void 0;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == DreamSpace_1.DreamSpace.global) {
                return DreamSpace_1.DreamSpace.global[existingValue["hostGlobalName"]];
            }
            else
                return nsglobals[name];
        }
        Globals.getValue = getValue;
        ;
    })(Globals = exports.Globals || (exports.Globals = {}));
});
// ###########################################################################################################################
//# sourceMappingURL=Globals.js.map