// ###########################################################################################################################
// Types for time management.
// ###########################################################################################################################
define(["require", "exports", "./Globals", "./Logging", "./Types", "./Factories", "./Resources", "./PrimitiveTypes", "./TSHelpers", "./System/Exception", "./ErrorHandling", "./Utilities", "./ResourceRequest", "./Path"], function (require, exports, Globals_1, Logging_1, Types_1, Factories_1, Resources_1, PrimitiveTypes_1, TSHelpers_1, Exception_1, ErrorHandling_1, Utilities_1, ResourceRequest_1, Path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ScriptResource_1;
    var Globals = Globals_1.DreamSpace.Globals;
    /** Types and functions for loading scripts into the DreamSpace system. */
    // =======================================================================================================================
    /** Used to strip out manifest dependencies. */
    exports.MANIFEST_DEPENDENCIES_REGEX = /^\s*using:\s*([A-Za-z0-9$_.,\s]*)/gim;
    // =======================================================================================================================
    /**
     * A code-completion friendly list of registered modules.
     * Note: Though module references may show in code completion, the related manifests in each plugin location must be
     * loaded first before a module is ready for use.
     * Usage: To load a module, call it using the '[DS.]using.ModuleName(...)' syntax.
     * Note: If you are developing your own module, use a proper name path under the Modules namespace -
     * typically something like 'namespace DS.Scripts.Modules { /** Description... * / export namespace CompanyOrWebsite.YourModule { ... } }'
     * (take note that the comments are in their own scope, which is required as well).
     * Remember: You can create a sub-namespace name with specific versions of your scripts (i.e. 'export namespace Company.MyScript.v1_0_0').
     */
    exports.Modules = {
        /**
         * Supported DreamSpace system modules.
         * Note: If you are developing your own module, use a proper name path under the parent 'Modules' namespace -
         * typically something like 'namespace DS.Scripts.Modules { export namespace CompanyOrWebsite.YourModule { ... } }',
         * much like how GitHub URLs look like (i.e. 'Microsoft/TypeScript' might be 'Microsoft.TypeScript')
         * * Do not put custom modules directly in the 'DS.Scripts.Modules.System' namespace, nor any sub-namespace from there.
         * Remember: You can create a sub-namespace name with specific versions of your scripts (i.e. 'export namespace Company.MyScript.v1_0_0').
         */
        System: {}
    };
    /**
     * Takes a full type name and determines the expected path for the library.
     * This is used internally to find manifest file locations.
     */
    function moduleNamespaceToFolderPath(nsName) {
        var _nsName = ('' + nsName).trim();
        if (!nsName || !_nsName)
            Logging_1.log(Types_1.nameof(() => moduleNamespaceToFolderPath) + "()", "A valid non-empty namespace string was expected.");
        var sysNs1 = Types_1.nameof(() => exports.Modules) + "."; // (account for full names or relative names)
        var sysNs2 = Types_1.nameof(() => exports.Modules) + ".";
        var sysNs3 = Types_1.nameof(() => exports.Modules) + ".";
        if (_nsName.substr(0, sysNs1.length) === sysNs1)
            _nsName = _nsName.substr(sysNs1.length);
        else if (_nsName.substr(0, sysNs2.length) === sysNs2)
            _nsName = _nsName.substr(sysNs2.length);
        else if (_nsName.substr(0, sysNs3.length) === sysNs3)
            _nsName = _nsName.substr(sysNs3.length);
        var parts = _nsName.split('.');
        parts.splice(parts.length - 1, 1); // (the last name is always the type name, so remove it)
        return parts.join('/');
    }
    exports.moduleNamespaceToFolderPath = moduleNamespaceToFolderPath;
    // ====================================================================================================================
    let ScriptResource = ScriptResource_1 = class ScriptResource extends Factories_1.Factory(ResourceRequest_1.ResourceRequest) {
        /** Returns a new module object only - does not load it. */
        static init(o, isnew, url) {
            this.super.init(o, isnew, url, Resources_1.ResourceTypes.Application_Script);
        }
        /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'DS.Globals' and 'Globals.register()'. */
        registerGlobal(name, initialValue, asHostGlobal) {
            return Globals.register(this, name, initialValue, asHostGlobal);
        }
        /** For help, see 'DS.Globals'. */
        globalExists(name) {
            return Globals.exists(this, name);
        }
        /** For help, see 'DS.Globals'. */
        eraseGlobal(name) {
            return Globals.erase(this, name);
        }
        /** For help, see 'DS.Globals'. */
        clearGlobals() {
            return Globals.clear(this);
        }
        /** For help, see 'DS.Globals'. */
        setGlobalValue(name, value) {
            return Globals.setValue(this, name, value);
        }
        /** For help, see 'DS.Globals'. */
        getGlobalValue(name) {
            return Globals.getValue(this, name);
        }
        static [Globals_1.DreamSpace.constructor](factory) {
            factory.init = (o, isnew, url) => {
            };
        }
    };
    ScriptResource = ScriptResource_1 = __decorate([
        Factories_1.factory(this)
    ], ScriptResource);
    exports.ScriptResource = ScriptResource;
    class ScriptInfoList {
    }
    exports.ScriptInfoList = ScriptInfoList;
    /**
    * Represents a loaded manifest that describes some underlying resource (typically JavaScript).
    * 'Manifest' inherits from 'ScriptResource', providing the loaded manifests the ability to register globals for the
    * DreamSpace context, instead of the global 'window' context.
    */
    let Manifest = class Manifest extends Factories_1.Factory(ScriptResource) {
        /** Holds variables required for manifest execution (for example, callback functions for 3rd party libraries, such as the Google Maps API). */
        static init(o, isnew, url) {
            this.super.init(o, isnew, url, Resources_1.ResourceTypes.Application_Script);
        }
    };
    Manifest = __decorate([
        Factories_1.factory(this), Globals_1.sealed
    ], Manifest);
    exports.Manifest = Manifest;
    // ====================================================================================================================
    var _manifests = []; // (holds a list of all 
    var _manifestsByURL = {};
    /** Stores script parse and execution errors, and includes functions for formatting source based on errors. */
    class ScriptError {
        constructor(source, error, filename, functionName, lineno, colno, stack) {
            this.source = source;
            this.error = error;
            this.filename = filename;
            this.functionName = functionName;
            this.lineno = lineno;
            this.colno = colno;
            this.stack = stack;
            if (error instanceof ErrorEvent) {
                if (filename === void 0)
                    this.filename = error.filename;
                if (lineno === void 0)
                    this.lineno = error.lineno;
                if (colno === void 0)
                    this.colno = error.colno;
            }
            else if (error instanceof Error && error.stack && (functionName === void 0 || lineno === void 0 || colno === void 0)) {
                var info = ScriptError.getFirstStackEntry(error.stack);
                if (info) {
                    if (functionName === void 0)
                        this.functionName = info[0];
                    if (lineno === void 0)
                        this.lineno = info[1];
                    if (colno === void 0)
                        this.colno = info[2];
                }
            }
        }
        get message() { return ErrorHandling_1.getErrorMessage(this); }
        /** Returns the first function name, line number, and column number found in the given stack string. */
        static getFirstStackEntry(stack) {
            var matches = stack.match(/(?:\s*at\b)?\s*(?:(.*(?=@debugger)|(?:.(?!\())*|<\w+>|eval code)).*:(\d+):(\d+)/mi); // (https://regex101.com/r/D02917/2)
            return matches && [matches[1], +matches[2], +matches[3]] || null;
        }
        static fromError(error, source, filelocation) {
            return new ScriptError(source, error, filelocation, void 0, void 0, void 0, error.stack);
        }
        /** Adds line numbers to the script source that produced the error and puts a simple arrow '=> ' mark on the line where
         * the error is and highlights the column.
         * @param {string} source The script source code.
         * @param {Function} lineFilter See 'System.String.addLineNumbersToText()'.
         */
        getFormatedSource(lineFilter) {
            var scriptWithLines = PrimitiveTypes_1.String.addLineNumbersToText(this.source, lineFilter || ((lineNumber, marginSize, paddedLineNumber, line) => {
                if (lineNumber == this.lineno)
                    return "\u25BA " + paddedLineNumber + " " + line.substr(0, this.colno) + " \xBB " + line.substr(this.colno);
            }));
            return scriptWithLines;
        }
    }
    exports.ScriptError = ScriptError;
    /// <summary> Validates if the script can be parsed for execution.  If not, then a 'ScriptError' instance is returned, otherwise 'null' is returned. </summary>
    /// <param name="script"> The script to validate. </param>
    /// <returns> A ScriptError instance if there are any parse errors, and null otherwise. </returns>
    function validateScript(script, url) {
        if (Globals_1.DreamSpace.host.isClient) {
            var oldWinError = window.onerror, err, lineNumber, column;
            window.onerror = (errEventOrMsg, u, ln, col) => { err = errEventOrMsg; url = u || url; lineNumber = ln; column = col; };
            var s = document.createElement('script');
            s.appendChild(document.createTextNode("(function () {\n" + script + "\n})"));
            document.body.appendChild(s);
            document.body.removeChild(s);
            window.onerror = oldWinError;
        }
        else
            try {
                Function(script); // (not in the DOM?  use a fallback)
            }
            catch (ex) {
                return ScriptError.fromError(ex, script, url);
            }
        if (err)
            return new ScriptError(script, err, url || void 0, void 0, lineNumber, column, null);
        else
            return null;
    }
    exports.validateScript = validateScript;
    /** Returns a resource loader for loading a specified manifest file from a given path (the manifest file name itself is not required).
      * To load a custom manifest file, the filename should end in either ".manifest" or ".manifest.js".
      * Call 'start()' on the returned instance to begin the loading process.
      * If the manifest contains dependencies to other manifests, an attempt will be made to load them as well.
      */
    function getModule(path) {
        if (path == void 0 || path === null)
            path = "";
        if (typeof path != 'string')
            path = "" + path; // (convert to string)
        if (path == "")
            path = "manifest";
        //var manifestName = (path.match(/(?:^|\/|\.\/|\.\.\/)((?:[^\/]*\.)*manifest(?:.js)?)(?:$|\?|#)/i) || []).pop();
        if (/((?:^|\/|\.)manifest)$/i.test(path))
            path += ".js"; // (test if the name needs to have the '.js' added)
        var request = _manifestsByURL[path];
        if (request)
            return request; // (request already made)
        request = (Manifest.new(path)).then((request, data) => {
            // ... the manifest script is loaded, now extract any dependencies ...
            if (!data)
                return;
            var script = (typeof data == 'string' ? data : '' + data);
            if (script) {
                var matches = Utilities_1.Utilities.matches(exports.MANIFEST_DEPENDENCIES_REGEX, script); // ("a.b.x, a.b.y, a.b.z")
                if (matches.length) {
                    var dependencies = [];
                    for (var i = 0, n = matches.length; i < n; i++) {
                        var depItems = matches[i][1].split(',');
                        for (var i2 = 0, n2 = depItems.length; i2 < n2; ++i2)
                            dependencies.push(depItems[i2].trim());
                    }
                    if (dependencies.length) {
                        // ... this manifest has dependencies, so convert to folder paths and load them ...
                        for (var i = 0, n = dependencies.length; i < n; ++i) {
                            var path = moduleNamespaceToFolderPath(dependencies[i]);
                            getModule(path).start().include(request); // (create a dependency chain; it's ok to do this in the 'then()' callback, as 'ready' events only trigger AFTER the promise sequence completes successfully)
                            // (Note: The current request is linked as a dependency on the required manifest. 'ready' is called when
                            //        parent manifests and their dependencies have completed loaded as well)
                        }
                    }
                }
            }
        }).ready((manifestRequest) => {
            var script = manifestRequest.transformedResponse;
            // ... before we execute the script we need to move down any source mapping pragmas ...
            var sourcePragmaInfo = extractPragmas(script);
            script = sourcePragmaInfo.filteredSource + "\r\n" + sourcePragmaInfo.pragmas.join("\r\n");
            var errorResult = validateScript(script, manifestRequest.url);
            if (errorResult)
                Logging_1.error("getManifest(" + path + ")", "Error parsing script: " + errorResult.message + "\r\nScript: \r\n" + errorResult.getFormatedSource(), manifestRequest);
            try {
                var func = Function("define", script); // (create a manifest wrapper function to isolate the execution context)
                func.call(this, define); // (make sure 'this' is supplied, just in case, to help protect the global scope somewhat [instead of forcing 'strict' mode])
            }
            catch (ex) {
                errorResult = ScriptError.fromError(ex, func && func.toString() || script, Types_1.nameof(() => getModule, true) + "() while executing " + manifestRequest.url);
                Logging_1.error("getManifest(" + path + ")", "Error executing script: " + errorResult.message + "\r\nScript: \r\n" + errorResult.getFormatedSource(), manifestRequest);
            }
            manifestRequest.status = Resources_1.RequestStatuses.Executed;
            manifestRequest.message = "The manifest script has been executed.";
        });
        _manifests.push(request); // (note: the first and second manifest should be the default root manifests; modules script loading should commence once all manifests are loaded)
        _manifestsByURL[path] = request;
        return request;
    }
    exports.getModule = getModule;
    // =======================================================================================================================
    /** Contains the statuses for module (script) loading and execution. */
    var ModuleLoadStatus;
    (function (ModuleLoadStatus) {
        /** The script was requested, but couldn't be loaded. */
        ModuleLoadStatus[ModuleLoadStatus["Error"] = -1] = "Error";
        /** The script is not loaded. Scripts only load and execute when needed/requested. */
        ModuleLoadStatus[ModuleLoadStatus["NotLoaded"] = 0] = "NotLoaded";
        /** The script was requested, but loading has not yet started. */
        ModuleLoadStatus[ModuleLoadStatus["Requested"] = 1] = "Requested";
        /** The script is waiting on dependents before loading. */
        ModuleLoadStatus[ModuleLoadStatus["Waiting"] = 2] = "Waiting";
        /** The script is loading. */
        ModuleLoadStatus[ModuleLoadStatus["InProgress"] = 3] = "InProgress";
        /** The script is now available, but has not executed yet. Scripts only execute when needed (see 'DS.using'). */
        ModuleLoadStatus[ModuleLoadStatus["Loaded"] = 4] = "Loaded";
        /** The script has been executed. */
        ModuleLoadStatus[ModuleLoadStatus["Ready"] = 5] = "Ready";
    })(ModuleLoadStatus = exports.ModuleLoadStatus || (exports.ModuleLoadStatus = {}));
    var _modules = {};
    var _appModule = null; // (becomes set to the app module when the app module is finally loaded and ready to be executed)
    ;
    /** Contains static module properties and functions. */
    class Module extends Factories_1.Factory(ScriptResource) {
        constructor() {
            super(...arguments);
            this.required = false; // (true if the script is required - the application will fail to execute if this occurs, and an exception will be thrown)
            //x isInclude() { return this.url && this.fullname == this.url; }
            /** If true, then the module is waiting to complete based on some outside custom script/event. */
            this.customWait = false;
            /** Returns a variable value from the executed module's local scope.
              * Module scripts that are wrapped in functions may have defined global variables that become locally scoped instead. In
              * these cases, use this function to read the required values.  This is an expensive operation that should only be used to
              * retrieve object references.  If performance is required to access non-reference values, you should use this to read an
              * object that contains all the values and references you need (i.e. a 'root' namespace object within the module scope).
              */
            this.getVar = Globals_1.DreamSpace.noop;
            this.setVar = Globals_1.DreamSpace.noop;
            /** This 'exports' container exists to support loading client-side modules in a NodeJS-type fashion.  The main exception is that
              * 'require()' is not supported as it is synchronous, and an asynchronous method is required on the client side.  Instead, the
              * reference to a 'manifest' variable (of type 'DS.Scripts.IManifest') is also given to the script, and can be used to
              * further chain more modules to load.
              * Note: 'exports' (a module-global object) does not apply to scripts executed in the global scope (i.e. if 'execute(true)' is called).
              */
            this.exports = {};
        }
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        static init(o, isnew, fullname, url, minifiedUrl) {
            this.super.init(o, isnew, Globals_1.DreamSpace.isDebugging ? url : (minifiedUrl || url));
            if (!o.type) // (if the base resource loader fails to initialize, then another resource already exists for the same location)
                throw Exception_1.Exception.from("Duplicate module load request: A previous request for '" + url + "' was already made.", o);
            o.fullname = fullname;
            o.nonMinifiedURL = url;
            o.minifiedURL = minifiedUrl;
            o.then(o.__onLoaded).ready(o.__onReady);
        }
        __onLoaded() {
            // ... script is loaded (not executed), but may be waiting on dependencies; for now, check for in-script dependencies/flags and apply those now ...
            return this;
        }
        __onReady(request) {
            // ... script is loaded (not executed) and ready to be applied ...
            if (this.fullname == "app" || this.fullname == "application") {
                _appModule = this;
                if (_runMode) // (if run was requested)
                    _tryRunApp();
            }
            return this;
        }
        toString() { return this.fullname; }
        toValue() { return this.fullname; }
        /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'DS.Globals' and 'Globals.register()'. */
        registerGlobal(name, initialValue, asHostGlobal) {
            return Globals.register(this, name, initialValue, asHostGlobal);
        }
        /** For help, see 'DS.Globals'. */
        globalExists(name) {
            return Globals.exists(this, name);
        }
        /** For help, see 'DS.Globals'. */
        eraseGlobal(name) {
            return Globals.erase(this, name);
        }
        /** For help, see 'DS.Globals'. */
        clearGlobals() {
            return Globals.clear(this);
        }
        /** For help, see 'DS.Globals'. */
        setGlobalValue(name, value) {
            return Globals.setValue(this, name, value);
        }
        /** For help, see 'DS.Globals'. */
        getGlobalValue(name) {
            return Globals.getValue(this, name);
        }
        /** Begin loading the module's script. After the loading is completed, any dependencies are automatically detected and loaded as well. */
        start() {
            if (this.status == Resources_1.RequestStatuses.Pending && !this._moduleGlobalAccessors) { // (make sure this module was not already started nor applied)
                this.url = Globals_1.DreamSpace.debugMode ? this.nonMinifiedURL : (this.minifiedURL || this.nonMinifiedURL); // (just in case the debugging flag changed)
                return super.start();
            }
            return this;
        }
        /** Executes the underlying script by either wrapping it in another function (the default), or running it in the global window scope. */
        execute(useGlobalScope = false) {
            if (this.status == Resources_1.RequestStatuses.Ready && !this._moduleGlobalAccessors) {
                // ... first, make sure all parent modules have been executed first ...
                for (var i = 0, n = this._parentRequests.length, dep; i < n; ++i)
                    if ((dep = this._parentRequests[i]).status == Resources_1.RequestStatuses.Ready)
                        dep.execute();
                var accessors;
                if (useGlobalScope) {
                    this._moduleGlobalAccessors = (Globals_1.DreamSpace.globalEval(this.response), Module._globalaccessors); // (use the global accessors, as the module was run in the global scope)
                }
                else {
                    var tsHelpers = TSHelpers_1.renderHelperVarDeclarations("arguments[3]");
                    this.$__modFunc = new Function("DreamSpace", "module", "exports", tsHelpers[0] + this.response + ";\r\n return { get: function(varName) { return eval(varName); }, set: function(varName, val) { return eval(varName + ' = val;'); } };");
                    this._moduleGlobalAccessors = this.$__modFunc(Globals_1.DreamSpace, this, this.exports, tsHelpers); // (note that 'this.' effectively prevents polluting the global scope in case 'this' is used)
                }
                this.getVar = this._moduleGlobalAccessors.get;
                this.setVar = this._moduleGlobalAccessors.set;
                this.status = Resources_1.RequestStatuses.Executed;
            }
        }
    }
    Module._globalaccessors = (() => { return Globals_1.DreamSpace.safeEval("({ get: function(varName) { return p0.global[varName]; }, set: function(varName, val) { return p0.global[varName] = val; } })", Globals_1.DreamSpace); })();
    exports.Module = Module;
    var _runMode = 0; // (0=auto run, depending on debug flag; 1=user has requested run before the app module was ready; 2=running)
    /** Used internally to see if the application should run automatically. Developers should NOT call this directly and call 'runApp()' instead. */
    function _tryRunApp() {
        if (_runMode < 2)
            if (_appModule && (_runMode == 1 || !Globals_1.DreamSpace.host.isDebugMode() && Globals_1.DreamSpace.debugMode != Globals_1.DreamSpace.DebugModes.Debug_Wait)) {
                // (note: if the host is in debug mode, it trumps the internal debug setting)
                if (_appModule.status == Resources_1.RequestStatuses.Ready)
                    _appModule.execute();
                if (_appModule.status == Resources_1.RequestStatuses.Executed)
                    _runMode = 2;
            }
    }
    exports._tryRunApp = _tryRunApp;
    /** Attempts to run the application module (typically the script generated from 'app.ts'), if ready (i.e. loaded along with all dependencies).
      * If the app is not ready yet, the request is flagged to start the app automatically.
      * Note: Applications always start automatically by default, unless 'DS.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    function runApp() {
        if (_runMode < 2) {
            _runMode = 1;
            _tryRunApp();
        }
    }
    exports.runApp = runApp;
    // =======================================================================================================================
    /** This is the path to the root of the DreamSpace JavaScript files (Path.combine(DS.baseURL, "js/") by default).
    * Note: This should either be empty, or always end with a URL path separator ('/') character (but the system will assume to add one anyhow if missing). */
    exports.pluginFilesBasePath = Path_1.Path.combine(Globals_1.DreamSpace.baseURL, "js/");
    /** Translates a module relative or full type name to the actual type name (i.e. '.ABC' to 'DS.ABC', or 'System'/'System.' to 'DreamSpace'/'DS.'). */
    function translateModuleTypeName(moduleFullTypeName) {
        if (moduleFullTypeName.charAt(0) == '.')
            moduleFullTypeName = "DreamSpace" + moduleFullTypeName; // (just a shortcut to reduce repetition of "DS." at the start of full module type names during registration)
        else if (moduleFullTypeName == "System" || moduleFullTypeName.substr(0, "System.".length) == "System.")
            moduleFullTypeName = "DreamSpace" + moduleFullTypeName.substr("System".length); // ("System." maps to "DS." internally to prevent compatibility issues)
        return moduleFullTypeName;
    }
    exports.translateModuleTypeName = translateModuleTypeName;
    ;
    /** Parses the text (usually a file name/path) and returns the non-minified and minified versions in an array (in that order).
      * If no tokens are found, the second item in the array will be null.
      * The format of the tokens is '{min:[non-minified-text|]minified-text}', where '[...]' is optional (square brackets not included).
      */
    function processMinifyTokens(text) {
        var tokenRegEx = /{min:[^\|}]*?\|?[^}]*?}/gi;
        var minTokens = text.match(tokenRegEx); // (note: more than one is supported)
        var minifiedText = null;
        var token, minParts;
        if (minTokens) { // (if tokens were found ...)
            minifiedText = text;
            for (var i = 0, n = minTokens.length; i < n; ++i) {
                token = minTokens[i];
                minParts = token.substring(5, token.length - 1).split('|');
                if (minParts.length == 1)
                    minParts.unshift("");
                minifiedText = minifiedText.replace(token, minParts[1]);
                text = text.replace(token, minParts[0]); // (delete the token(s))
            }
        }
        return [text, minifiedText];
    }
    exports.processMinifyTokens = processMinifyTokens;
    /** This is usually called from the 'DS.[ts|js]' file to register script files (plugins), making them available to the application based on module names (instead of file names).
      * When 'DS.using.{...someplugin}()' is called, the required script files are then executed as needed.
      * This function returns a function that, when called, will execute the loaded script.  The returned object also as chainable methods for success and error callbacks.
      * @param {IUsingModule[]} dependencies A list of modules that this module depends on.
      * @param {string} moduleFullTypeName The full type name of the module, such as 'DS.UI', or 'jquery'.
      *                                    You can also use the token sequence '{min:[non-minified-text|]minified-text}' (where '[...]' is optional, square brackets
      *                                    not included) to define the minified and non-minified text parts.
      * @param {string} moduleFileBasePath (optional) The path to the '.js' file, including the filename + extension.  If '.js' is not found at the end, then
      *                                    the full module type name is appended, along with '.js'. This parameter will default to 'pluginFilesBasePath'
      *                                    (which is Path.combine(DS.baseURL, "js/") by default) if null is passed, so pass an empty string if this is not desired.
      *                                    You can also use the '{min:[non-minified-text|]minified-text}' token sequence (where '[...]' is optional, square brackets
      *                                    not included) to define the minified and non-minified text parts.
      * @param {boolean} requiresGlobalScope If a module script MUST execute in the host global scope environment, set this to true.  If
      *                                      false, the module is wrapped in a function to create a local-global scope before execution.
      */
    function createModule(dependencies, moduleFullTypeName, moduleFileBasePath = null, requiresGlobalScope = false) {
        if (!moduleFullTypeName)
            throw Exception_1.Exception.from("A full type name path is expected.");
        // ... extract the minify-name tokens and create the proper names and paths for both min and non-min versions ...
        var results = processMinifyTokens(moduleFullTypeName);
        var minifiedFullTypeName = null;
        if (results[1]) {
            moduleFullTypeName = translateModuleTypeName(results[0]);
            minifiedFullTypeName = translateModuleTypeName(results[1]);
        }
        else
            moduleFullTypeName = translateModuleTypeName(moduleFullTypeName); // (translate "System." to "DS." and "." to "DS." internally)
        // ... if the JavaScript file is not given, then create the relative path to it given the full type name ...
        var path = moduleFileBasePath != null ? ("" + moduleFileBasePath).trim() : exports.pluginFilesBasePath;
        var minPath = null;
        if (path && path.charAt(0) == '~')
            path = Path_1.Path.combine(exports.pluginFilesBasePath, path.substring(1)); // ('~' is a request to insert the current default path; eg. "~DS.System.js" for "DreamSpaceJS/DS.System.js")
        results = processMinifyTokens(path);
        if (results[1]) {
            path = results[0];
            minPath = results[1];
        }
        else if (minifiedFullTypeName)
            minPath = path;
        if (!Path_1.Path.hasFileExt(path, '.js')) { //&& !/^https?:\/\//.test(path)
            // ... JavaScript filename extension not found, so add it under the assumed name ...
            if (!path || path.charAt(path.length - 1) == '/')
                path = Path_1.Path.combine(path, moduleFullTypeName + ".js");
            else
                path += ".js";
        }
        if (minPath && !Path_1.Path.hasFileExt(minPath, '.js')) { //&& !/^https?:\/\//.test(path)
            // ... JavaScript filename extension not found, so add it under the assumed name ...
            if (!minPath || minPath.charAt(minPath.length - 1) == '/')
                minPath = Path_1.Path.combine(minPath, minifiedFullTypeName + ".js");
            else
                minPath += ".js";
        }
        // ... add the module if it doesn't already exist, otherwise update it ...
        var mod = _modules[moduleFullTypeName];
        if (mod === void 0)
            _modules[moduleFullTypeName] = mod = Module.new(moduleFullTypeName, path, minPath); // (note: this can only be changed if the type hasn't been loaded yet)
        else {
            mod.fullname = moduleFullTypeName; // (just in case it changed somehow - this must always match the named index)
            if (!mod.nonMinifiedURL)
                mod.nonMinifiedURL = path; // (update path only if missing)
            if (!mod.minifiedURL)
                mod.minifiedURL = minPath; // (update minified-path only if missing)
        }
        if (dependencies && dependencies.length)
            for (var i = 0, n = dependencies.length; i < n; ++i)
                dependencies[i].module.include(mod);
        var usingPluginFunc = ((onready, onerror) => {
            // (this is called to trigger the loading of the resource [scripts are only loaded on demand])
            if (onready === void 0 && onerror === void 0 && mod.status != Resources_1.RequestStatuses.Executed) {
                // ... if no callbacks are given, this is a request to CONFIRM that a script is executed, and to execute it if not ...
                var msg = '';
                if (mod.status >= Resources_1.RequestStatuses.Waiting) {
                    onReadyforUse.call(mod, mod);
                    return usingPluginFunc;
                }
                if (mod.status == Resources_1.RequestStatuses.Error)
                    msg = "It is in an error state.";
                else if (mod.status == Resources_1.RequestStatuses.Pending)
                    msg = "It has not been requested to load.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                else if (mod.status < Resources_1.RequestStatuses.Waiting)
                    msg = "It is still loading and is not yet ready.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                throw Exception_1.Exception.from("Cannot use module '" + mod.fullname + "': " + msg, mod);
            }
            function onReadyforUse(mod) {
                try {
                    // ... execute the script ...
                    mod.execute();
                    mod.status = Resources_1.RequestStatuses.Executed;
                    if (onready)
                        onready(mod);
                }
                catch (e) {
                    mod.setError("Error executing module script:", e);
                    if (onerror)
                        onerror.call(mod, mod);
                    throw e; // (pass along to the resource loader)
                }
            }
            // ... request to load the module and execute the script ...
            switch (mod.status) {
                case Resources_1.RequestStatuses.Error: throw Exception_1.Exception.from("The module '" + mod.fullname + "' is in an error state and cannot be used.", mod);
                case Resources_1.RequestStatuses.Pending:
                    mod.start();
                    break; // (the module is not yet ready and cannot be executed right now; attach callbacks...)
                case Resources_1.RequestStatuses.Loading:
                    mod.catch(onerror);
                    break;
                case Resources_1.RequestStatuses.Loaded:
                case Resources_1.RequestStatuses.Waiting:
                case Resources_1.RequestStatuses.Ready:
                case Resources_1.RequestStatuses.Executed:
                    mod.ready(onReadyforUse);
                    break;
            }
            return usingPluginFunc;
        });
        usingPluginFunc.module = mod;
        usingPluginFunc.then = (success, error) => { mod.then(success, error); return this; };
        usingPluginFunc.require = (request) => { request.include(mod); return this; };
        //?usingPluginFunc.include = (dependantMod: IUsingModule) => { mod.include(dependantMod.module); return dependantMod; };
        usingPluginFunc.ready = (handler) => { mod.ready(handler); return this; };
        usingPluginFunc.while = (progressHandler) => { mod.while(progressHandler); return this; };
        usingPluginFunc.catch = (errorHandler) => { mod.catch(errorHandler); return this; };
        usingPluginFunc.finally = (cleanupHandler) => { mod.finally(cleanupHandler); return this; };
        return usingPluginFunc;
    }
    exports.createModule = createModule;
    ;
    class Require {
        load() { }
    }
    exports.Require = Require;
    /** A ModuleInfo object holds basic information for loading a module, and also stores. */
    class ModuleInfo {
    }
    exports.ModuleInfo = ModuleInfo;
    /** The 'define' function is injected into a loaded module via the 'define' parameter of the wrapper function. This helps to
     * confine var declarations and other actions to the function scope only.
     * When a TypeScript module is loaded, it is rewritten to include a 'module' object to support angular (https://stackoverflow.com/a/45002601/1236397).
     */
    function define(dependencies, onready) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dependencies && dependencies.length > 0)
                return new Promise((res, rej) => {
                    for (var i = 0, n = dependencies.length; i < n; ++i) {
                    }
                });
            else
                return Promise.resolve();
        });
    }
    exports.define = define;
    // =======================================================================================================================
    ///** Use to compile & execute required modules as they are needed.
    //  * By default, modules (scripts) are not executed immediately upon loading.  This makes page loading more efficient.
    //  */
    //export import using = Scripts.module;
    // =======================================================================================================================
    // ###########################################################################################################################
    ///** Used to load, compile & execute required plugin scripts. */
    //if (!this['using'])
    //    var using = DS.using; // (users should reference "using.", but "DS.using" can be used if the global 'using' is needed for something else)
    // ###########################################################################################################################
    /** Used to strip out script source mappings. Used with 'extractSourceMapping()'. */
    exports.SCRIPT_SOURCE_MAPPING_REGEX = /^\s*(\/\/[#@])\s*([A-Za-z0-9$_]+)\s*=\s*([^;/]*)(.*)/gim;
    /** Holds details on extract script pragmas. @See extractPragmas() */
    class PragmaInfo {
        /**
         * @param {string} prefix The "//#" part.
         * @param {string} name The pragma name, such as 'sourceMappingURL'.
         * @param {string} value The part after "=" in the pragma expression.
         * @param {string} extras Any extras on the line (like comments) that are not part of the extracted value.
         */
        constructor(prefix, name, value, extras) {
            this.prefix = prefix;
            this.name = name;
            this.value = value;
            this.extras = extras;
            this.prefix = (this.prefix || "").trim().replace("//@", "//#"); // ('@' is depreciated in favor of '#' because of conflicts with IE, so help out by making this correction automatically)
            this.name = (this.name || "").trim();
            this.value = (this.value || "").trim();
            this.extras = (this.extras || "").trim();
        }
        /**
         * Make a string from this source map info.
         * @param {string} valuePrefix An optional string to insert before the value, such as a sub-directory path, or missing protocol+server+port URL parts, etc.
         * @param {string} valueSuffix An optional string to insert after the value.
         */
        toString(valuePrefix, valueSuffix) {
            if (valuePrefix !== void 0 && valuePrefix !== null && typeof valuePrefix != 'string')
                valuePrefix = '' + valuePrefix;
            if (valueSuffix !== void 0 && valuePrefix !== null && typeof valueSuffix != 'string')
                valueSuffix = '' + valueSuffix;
            return this.prefix + " " + this.name + "=" + (valuePrefix || "") + this.value + (valueSuffix || "") + this.extras;
        } // (NOTE: I space after the prefix IS REQUIRED [at least for IE])
        valueOf() { return this.prefix + " " + this.name + "=" + this.value + this.extras; }
    }
    exports.PragmaInfo = PragmaInfo;
    /**
     * Extract any pragmas, such as source mapping. This is used mainly with XHR loading of scripts in order to execute them with
     * source mapping support while being served from a DreamSpace .Net Core MVC project.
     */
    function extractPragmas(src) {
        var srcMapPragmas = [], result, filteredSrc = src;
        exports.SCRIPT_SOURCE_MAPPING_REGEX.lastIndex = 0;
        while ((result = exports.SCRIPT_SOURCE_MAPPING_REGEX.exec(src)) !== null) {
            var srcMap = new PragmaInfo(result[1], result[2], result[3], result[4]);
            srcMapPragmas.push(srcMap);
            filteredSrc = filteredSrc.substr(0, result.index) + filteredSrc.substr(result.index + result[0].length);
        }
        return {
            /** The original source given to the function. */
            originalSource: src,
            /** The original source minus the extracted pragmas. */
            filteredSource: filteredSrc,
            /** The extracted pragma information. */
            pragmas: srcMapPragmas
        };
    }
    exports.extractPragmas = extractPragmas;
    /**
     * Extracts and replaces source mapping pragmas. This is used mainly with XHR loading of scripts in order to execute them with
     * source mapping support while being served from a DreamSpace .Net Core MVC project.
     */
    function fixSourceMappingsPragmas(sourcePragmaInfo, scriptURL) {
        var script = sourcePragmaInfo && sourcePragmaInfo.originalSource || "";
        if (sourcePragmaInfo.pragmas && sourcePragmaInfo.pragmas.length)
            for (var i = 0, n = +sourcePragmaInfo.pragmas.length; i < n; ++i) {
                var pragma = sourcePragmaInfo.pragmas[i];
                if (pragma.name.substr(0, 6) != "source")
                    script += "\r\n" + pragma; // (not for source mapping, so leave as is)
                else
                    script += "\r\n" + pragma.prefix + " " + pragma.name + "="
                        + Path_1.Path.resolve(pragma.value, Path_1.Path.map(scriptURL), Globals_1.DreamSpace.global.serverWebRoot ? Globals_1.DreamSpace.global.serverWebRoot : Globals_1.DreamSpace.baseScriptsURL) + pragma.extras;
            }
        return script;
    }
    exports.fixSourceMappingsPragmas = fixSourceMappingsPragmas;
});
// ###########################################################################################################################
//# sourceMappingURL=Scripts.js.map