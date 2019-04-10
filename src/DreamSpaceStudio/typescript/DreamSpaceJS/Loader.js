"use strict";
// ========================================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Iron this out - we need to make sure the claim below works well, or at least the native browser cache can help with this naturally.
/**
 * The loader namespace contains low level functions for loading/bootstrapping the whole system.
 * Why use a loader instead of combining all scripts into one file? The main reason is so that individual smaller scripts can be upgraded
 * without needing to re-transfer the whole system to the client. It's much faster to just resend one small file that might change. This
 * also allows extending (add to) the existing scripts for system upgrades.
 */
var Loader;
(function (Loader) {
    namespace("DreamSpace", "Loader");
    var _onSystemLoadedHandlers = [];
    /**
     * Use this function to register a handler to be called when the core system is loaded, just before 'app.manifest.ts' gets loaded.
     * Note: The PROPER way to load an application is via a manifest file (app.manifest.ts).  Very few functions and event hooks are available
     * until the system is fully loaded. For example, 'DreamSpace.DOM.Loader' is not available until the system is loaded, which means you
     * cannot hook into 'DreamSpace.DOM.Loader.onDOMLoaded()' or access 'DreamSpace.Browser' properties until then. This is because all files
     * are dynamically loaded as needed (the DreamSpace system uses the more efficient dynamic loading system).
     */
    function onSystemLoaded(handler) {
        if (handler && typeof handler == 'function')
            _onSystemLoadedHandlers.push(handler);
    }
    Loader.onSystemLoaded = onSystemLoaded;
    /** Used by the bootstrapper in applying system scripts as they become ready.
      * Applications should normally never use this, and instead use the 'modules' system in the 'DreamSpace.Scripts' namespace for
      * script loading.
      */
    function _SystemScript_onReady_Handler(request) {
        try {
            request.message = "Executing script ...";
            var helpers = renderHelperVarDeclarations("p0");
            var sourcePragmaInfo = extractPragmas(request.transformedResponse);
            var script = fixSourceMappingsPragmas(sourcePragmaInfo, request.url);
            safeEval(helpers[0] + " var DreamSpace=p1; " + script, /*p0*/ helpers[1], /*p1*/ DreamSpace); // ('DreamSpace.eval' is used for system scripts because some core scripts need initialize in the global scope [mostly due to TypeScript limitations])
            //x (^note: MUST use global evaluation as code may contain 'var's that will get stuck within function scopes)
            request.status = RequestStatuses.Executed;
            request.message = "The script has been executed successfully.";
        }
        catch (ex) {
            var errorMsg = getErrorMessage(ex);
            var msg = "There was an error executing script '" + request.url + "'.  The first 255 characters of the response was \r\n\"" + request.transformedResponse.substr(0, 255) + "\". \r\nError message:";
            request.setError(msg, ex);
            if (isDebugging())
                throw ex;
        }
    }
    Loader._SystemScript_onReady_Handler = _SystemScript_onReady_Handler;
    /** This is the root path to the boot scripts for DreamSpace.JS. The default starts with '~/' in order to be relative to 'baseScriptsURL'. */
    Loader.rootBootPath = Loader.rootBootPath && ('' + Loader.rootBootPath) || "~/DreamSpace/";
    /**
     * Starts loading the DreamSpace system.  To prevent this from happening automatically simply set the DreamSpace debug
     * mode before the DreamSpace.js file runs: "DreamSpace = { debugMode: 2 };" (see DreamSpace.DebugModes.Debug_Wait)
     * You can use 'Loader.onSystemLoaded()' to register handlers to run when the system is ready.
     *
     * Note: When developing applications, the DreamSpace-way is to create an 'app.manifest.ts' file that will auto load and
     * run once the system boots up. Manifest files are basically "modules" loaded in an isolated scope from the global
     * scope to help prevent pollution of the global scope. In a manifest file you declare and define all the types for
     * your module, including any dependencies on other modules in the DreamSpace system.  This promotes a more efficient
     * module-based loading structure that allows pages to load faster and saves on bandwidth.
     */
    function bootstrap() {
        // (note: the request order is the dependency order)
        Loader.rootBootPath = ('' + Loader.rootBootPath);
        var rbpLastChar = Loader.rootBootPath.charAt(Loader.rootBootPath.length - 1);
        if (rbpLastChar != '/' && rbpLastChar != '\\')
            Loader.rootBootPath += '/'; // (must end with a slash)
        log("Loader.BootSubPath", Loader.rootBootPath + " (if this path is wrong set 'DreamSpace.Loader.BootSubPath' before 'Loader.bootstrap()' gets called)");
        var onReady = _SystemScript_onReady_Handler;
        var get = System.IO.get;
        // ... load the base utility scripts first (all of these are not modules, so they have to be loaded in the correct order) ...
        get(Loader.rootBootPath + "DreamSpace.Polyfills.js").ready(onReady) // (some polyfills may be needed by the system)
            .include(get(Loader.rootBootPath + "DreamSpace.Types.js")).ready(onReady) // (common base types)
            .include(get(Loader.rootBootPath + "DreamSpace.Utilities.js")).ready(onReady) // (a lot of items depend on time utilities [such as some utilities and logging] so this needs to be loaded first)
            .include(get(Loader.rootBootPath + "DreamSpace.Globals.js")).ready(onReady) // (a place to store global values [especially global scope callbacks required by some libraries, such as Google Maps, etc.] without polluting the global scope)
            .include(get(Loader.rootBootPath + "DreamSpace.Scripts.js")).ready(onReady) // (supports DreamSpace-based module loading)
            // ... load the rest of the core library system next (this is ONLY the bare required basics; everything else can optionally be loaded as needed) ...
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.js").ready(onReady)) // (any general common system properties and setups)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.PrimitiveTypes.js").ready(onReady)) // (start the primitive object definitions required by more advanced types)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Time.js")).ready(onReady) // (extends the time utilities and constants into a TimeSpan wrapper)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Exception.js").ready(onReady)) // (setup exception support)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Diagnostics.js")).ready(onReady) // (setup diagnostic support)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Events.js").ready(onReady)) // (advanced event handling)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Browser.js")).ready(onReady) // (uses the event system)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Text.js").ready(onReady)) // (utilities specific to working with texts)
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Data.js").ready(onReady))
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.IO.js").ready(onReady)) // (adds URL query handling and navigation [requires 'Events.EventDispatcher'])
            .include(get(Loader.rootBootPath + "System/DreamSpace.System.Storage.js").ready(onReady)) // (utilities for local storage support in DreamSpace)
            .ready(() => {
            if (_onSystemLoadedHandlers && _onSystemLoadedHandlers.length)
                for (var i = 0, n = _onSystemLoadedHandlers.length; i < n; ++i)
                    _onSystemLoadedHandlers[i]();
            // ... all core system scripts loaded, load the default manifests next ...
            Scripts.getManifest() // (load the default manifest in the current path [defaults to 'manifest.js'])
                .include(Scripts.getManifest("~/app.manifest")) // (load a custom named manifest; application launching begins here)
                .ready((mod) => {
                DreamSpace.onReady.dispatch();
                if (Scripts.Modules.App)
                    Scripts.Modules.App(Scripts._tryRunApp);
            }) // (triggered when 'app.manifest' is executed and ready)
                .start();
        })
            .start(); // (note: while all requests are loaded in parallel [regardless of dependencies], all 'ready' events are fired in proper order)
        DreamSpace.Loader.bootstrap = noop(); // (prevent this function from being called again)
    }
    Loader.bootstrap = bootstrap;
    if (Loader.onBeforeBootstrapHandlers && (typeof Loader.onBeforeBootstrapHandlers != 'object' || !('length' in Loader.onBeforeBootstrapHandlers)))
        error("Before Bootstrap Events", "The property 'DreamSpace.onBeforeBootstrapHandlers' is not set correctly.  Please set it with an array of handlers to call, or leave it undefined.");
    let _StartBoot;
    (function (_StartBoot) {
        var autoboot = true;
        if (typeof Loader.onBeforeBootstrapHandlers == 'object' && Loader.onBeforeBootstrapHandlers.length)
            for (var i = 0, n = Loader.onBeforeBootstrapHandlers.length; i < n; ++i)
                if (Loader.onBeforeBootstrapHandlers[i]() === false)
                    autoboot = false; // (explicit request to prevent auto booting)
        if (autoboot && DreamSpace.debugMode != DreamSpace.DebugModes.Debug_Wait)
            DreamSpace.Loader.bootstrap();
        // TODO: Allow users to use 'DreamSpace.Loader' to load their own scripts, and skip loading the DreamSpace system.
    })(_StartBoot || (_StartBoot = {}));
})(Loader = exports.Loader || (exports.Loader = {}));
// ========================================================================================================================================
//# sourceMappingURL=Loader.js.map