import { ICallback, IErrorCallback } from "./Globals";
import { IAddLineNumbersFilter } from "./System/PrimitiveTypes";
import { ResourceRequest, IResourceRequest } from "./ResourceRequest";
/** Types and functions for loading scripts into the DreamSpace system. */
/** Used to strip out manifest dependencies. */
export declare var MANIFEST_DEPENDENCIES_REGEX: RegExp;
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
export declare var Modules: {
    /**
     * Supported DreamSpace system modules.
     * Note: If you are developing your own module, use a proper name path under the parent 'Modules' namespace -
     * typically something like 'namespace DS.Scripts.Modules { export namespace CompanyOrWebsite.YourModule { ... } }',
     * much like how GitHub URLs look like (i.e. 'Microsoft/TypeScript' might be 'Microsoft.TypeScript')
     * * Do not put custom modules directly in the 'DS.Scripts.Modules.System' namespace, nor any sub-namespace from there.
     * Remember: You can create a sub-namespace name with specific versions of your scripts (i.e. 'export namespace Company.MyScript.v1_0_0').
     */
    System: {};
};
/**
 * Takes a full type name and determines the expected path for the library.
 * This is used internally to find manifest file locations.
 */
export declare function moduleNamespaceToFolderPath(nsName: string): string;
declare const ScriptResource_base: {
    new (): ResourceRequest;
    super: typeof ResourceRequest;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: ResourceRequest;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    cacheBusting: boolean;
    cacheBustingVar: string;
    super: ObjectConstructor;
};
export declare class ScriptResource extends ScriptResource_base {
    /** Returns a new module object only - does not load it. */
    static 'new': (url: string) => IScriptResource;
    /** Returns a new module object only - does not load it. */
    static init(o: IScriptResource, isnew: boolean, url: string): void;
    /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'DS.Globals' and 'Globals.register()'. */
    registerGlobal<T>(name: string, initialValue: T, asHostGlobal?: boolean): string;
    /** For help, see 'DS.Globals'. */
    globalExists<T>(name: string): boolean;
    /** For help, see 'DS.Globals'. */
    eraseGlobal<T>(name: string): boolean;
    /** For help, see 'DS.Globals'. */
    clearGlobals<T>(): boolean;
    /** For help, see 'DS.Globals'. */
    setGlobalValue<T>(name: string, value: T): T;
    /** For help, see 'DS.Globals'. */
    getGlobalValue<T>(name: string): T;
}
export interface IScriptResource extends ScriptResource {
}
declare const Manifest_base: {
    new (): ScriptResource;
    super: typeof ScriptResource;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: ScriptResource;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    cacheBusting: boolean;
    cacheBustingVar: string;
    super: typeof ResourceRequest & ObjectConstructor;
};
/**
* Represents a loaded manifest that describes some underlying resource (typically JavaScript).
* 'Manifest' inherits from 'ScriptResource', providing the loaded manifests the ability to register globals for the
* DreamSpace context, instead of the global 'window' context.
*/
export declare class Manifest extends Manifest_base {
    /** Holds variables required for manifest execution (for example, callback functions for 3rd party libraries, such as the Google Maps API). */
    static 'new': (url: string) => IManifest;
    /** Holds variables required for manifest execution (for example, callback functions for 3rd party libraries, such as the Google Maps API). */
    static init: (o: IManifest, isnew: boolean, url: string) => void;
    /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'DS.Globals' and 'Globals.register()'. */
    registerGlobal<T>(name: string, initialValue: T, asHostGlobal?: boolean): string;
    /** For help, see 'DS.Globals'. */
    globalExists<T>(name: string): boolean;
    /** For help, see 'DS.Globals'. */
    eraseGlobal<T>(name: string): boolean;
    /** For help, see 'DS.Globals'. */
    clearGlobals<T>(): boolean;
    /** For help, see 'DS.Globals'. */
    setGlobalValue<T>(name: string, value: T): T;
    /** For help, see 'DS.Globals'. */
    getGlobalValue<T>(name: string): T;
}
export interface IManifest extends Manifest {
}
/** Stores script parse and execution errors, and includes functions for formatting source based on errors. */
export declare class ScriptError implements Pick<ErrorEvent, "error" | "filename" | "message" | "lineno" | "colno"> {
    source: string;
    error: any;
    filename: string;
    functionName: string;
    lineno: number;
    colno: number;
    stack: string;
    readonly message: string;
    constructor(source: string, error: any, filename: string, functionName: string, lineno: number, colno: number, stack: string);
    /** Returns the first function name, line number, and column number found in the given stack string. */
    static getFirstStackEntry(stack: string): [string, number, number];
    static fromError(error: Error, source?: string, filelocation?: string): ScriptError;
    /** Adds line numbers to the script source that produced the error and puts a simple arrow '=> ' mark on the line where
     * the error is and highlights the column.
     * @param {string} source The script source code.
     * @param {Function} lineFilter See 'System.String.addLineNumbersToText()'.
     */
    getFormatedSource(lineFilter?: IAddLineNumbersFilter): string;
}
export declare function validateScript(script: string, url?: string): ScriptError;
/** Returns a resource loader for loading a specified manifest file from a given path (the manifest file name itself is not required).
  * To load a custom manifest file, the filename should end in either ".manifest" or ".manifest.js".
  * Call 'start()' on the returned instance to begin the loading process.
  * If the manifest contains dependencies to other manifests, an attempt will be made to load them as well.
  */
export declare function getManifest(path?: string): IManifest;
/** Contains the statuses for module (script) loading and execution. */
export declare enum ModuleLoadStatus {
    /** The script was requested, but couldn't be loaded. */
    Error = -1,
    /** The script is not loaded. Scripts only load and execute when needed/requested. */
    NotLoaded = 0,
    /** The script was requested, but loading has not yet started. */
    Requested = 1,
    /** The script is waiting on dependents before loading. */
    Waiting = 2,
    /** The script is loading. */
    InProgress = 3,
    /** The script is now available, but has not executed yet. Scripts only execute when needed (see 'DS.using'). */
    Loaded = 4,
    /** The script has been executed. */
    Ready = 5
}
declare const Module_base: {
    new (): ScriptResource;
    super: typeof ScriptResource;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: ScriptResource;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
    cacheBusting: boolean;
    cacheBustingVar: string;
    super: typeof ResourceRequest & ObjectConstructor;
};
/** Contains static module properties and functions. */
export declare class Module extends Module_base {
    /** Returns a new module object only - does not load it. */
    static 'new': (fullname: string, url: string, minifiedUrl?: string) => IModule;
    /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
    static init: (o: IModule, isnew: boolean, fullname: string, url: string, minifiedUrl?: string) => void;
    /** The full type name for this module. */
    fullname: string;
    /** The URL to the non-minified version of this module script. */
    nonMinifiedURL: string;
    /** The URL to the minified version of this module script. */
    minifiedURL: string;
    required: boolean;
    isInclude(): boolean;
    /** If true, then the module is waiting to complete based on some outside custom script/event. */
    customWait: boolean;
    /** Holds a reference to the executed function that wraps the loaded script. */
    private $__modFunc;
    /** Returns a variable value from the executed module's local scope.
      * Module scripts that are wrapped in functions may have defined global variables that become locally scoped instead. In
      * these cases, use this function to read the required values.  This is an expensive operation that should only be used to
      * retrieve object references.  If performance is required to access non-reference values, the script must be applied to
      * the global scope as normal.
      */
    getVar: <T extends any>(varName: string) => T;
    setVar: <T extends any>(varName: string, value: T) => T;
    /** This 'exports' container exists to support loading client-side modules in a NodeJS-type fashion.  The main exception is that
      * 'require()' is not supported as it is synchronous, and an asynchronous method is required on the client side.  Instead, the
      * reference to a 'manifest' variable (of type 'DS.Scripts.IManifest') is also given to the script, and can be used to
      * further chain more modules to load.
      * Note: 'exports' (a module-global object) does not apply to scripts executed in the global scope (i.e. if 'execute(true)' is called).
      */
    exports: {};
    /** A temp reference to the object returned from executing the generated '$__modFunc' wrapper function. */
    private _moduleGlobalAccessors;
    private static readonly _globalaccessors;
    private __onLoaded;
    private __onReady;
    toString(): string;
    toValue(): string;
    /** Begin loading the module's script. After the loading is completed, any dependencies are automatically detected and loaded as well. */
    start(): this;
    /** Executes the underlying script by either wrapping it in another function (the default), or running it in the global window scope. */
    execute(useGlobalScope?: boolean): void;
}
export interface IModule extends InstanceType<typeof Module> {
}
/** Used internally to see if the application should run automatically. Developers should NOT call this directly and call 'runApp()' instead. */
export declare function _tryRunApp(): void;
/** Attempts to run the application module (typically the script generated from 'app.ts'), if ready (i.e. loaded along with all dependencies).
  * If the app is not ready yet, the request is flagged to start the app automatically.
  * Note: Applications always start automatically by default, unless 'DS.System.Diagnostics.debug' is set to 'Debug_Wait'.
  */
export declare function runApp(): void;
/** This is the path to the root of the DreamSpace JavaScript files ('DreamSpace/' by default).
* Note: This should either be empty, or always end with a URL path separator ('/') character (but the system will assume to add one anyhow if missing). */
export declare var pluginFilesBasePath: string;
/** Translates a module relative or full type name to the actual type name (i.e. '.ABC' to 'DS.ABC', or 'System'/'System.' to 'DreamSpace'/'DS.'). */
export declare function translateModuleTypeName(moduleFullTypeName: string): string;
/** Parses the text (usually a file name/path) and returns the non-minified and minified versions in an array (in that order).
  * If no tokens are found, the second item in the array will be null.
  * The format of the tokens is '{min:[non-minified-text|]minified-text}', where '[...]' is optional (square brackets not included).
  */
export declare function processMinifyTokens(text: string): string[];
export interface IUsingModule {
    /** Checks to see if the plugin script is already applied, and executes it if not. */
    (onready?: (mod: IModule) => any, onerror?: (mod: IModule) => any): IUsingModule;
    /** The plugin object instance details. */
    module: IModule;
    then: (success: ICallback<IResourceRequest>, error?: IErrorCallback<IResourceRequest>) => IUsingModule;
    /** Attach some dependent resources to load with the module (note: the module will not load if the required resources fail to load). */
    require: (request: IResourceRequest) => IUsingModule;
    ready: (handler: ICallback<IResourceRequest>) => IUsingModule;
    while: (progressHandler: ICallback<IResourceRequest>) => IUsingModule;
    catch: (errorHandler: IErrorCallback<IResourceRequest>) => IUsingModule;
    finally: (cleanupHandler: ICallback<IResourceRequest>) => IUsingModule;
}
/** This is usually called from the 'DS.[ts|js]' file to register script files (plugins), making them available to the application based on module names (instead of file names).
  * When 'DS.using.{...someplugin}()' is called, the required script files are then executed as needed.
  * This function returns a function that, when called, will execute the loaded script.  The returned object also as chainable methods for success and error callbacks.
  * @param {ModuleInfo[]} dependencies A list of modules that this module depends on.
  * @param {string} moduleFullTypeName The full type name of the module, such as 'DS.UI', or 'jquery'.
  *                                    You can also use the token sequence '{min:[non-minified-text|]minified-text}' (where '[...]' is optional, square brackets
  *                                    not included) to define the minified and non-minified text parts.
  * @param {string} moduleFileBasePath (optional) The path to the '.js' file, including the filename + extension.  If '.js' is not found at the end, then
  *                                    the full module type name is appended, along with '.js'. This parameter will default to 'DS.moduleFilesBasePath'
  *                                    (which is 'DreamSpaceJS/' by default) if null is passed, so pass an empty string if this is not desired.
  *                                    You can also use the '{min:[non-minified-text|]minified-text}' token sequence (where '[...]' is optional, square brackets
  *                                    not included) to define the minified and non-minified text parts.
  * @param {boolean} requiresGlobalScope If a module script MUST execute in the host global scope environment, set this to true.  If
  *                                      false, the module is wrapped in a function to create a local-global scope before execution.
  */
export declare function module(dependencies: IUsingModule[], moduleFullTypeName: string, moduleFileBasePath?: string, requiresGlobalScope?: boolean): IUsingModule;
/** Used to strip out script source mappings. Used with 'extractSourceMapping()'. */
export declare var SCRIPT_SOURCE_MAPPING_REGEX: RegExp;
/** Holds details on extract script pragmas. @See extractPragmas() */
export declare class PragmaInfo {
    prefix: string;
    name: string;
    value: string;
    extras: string;
    /**
     * @param {string} prefix The "//#" part.
     * @param {string} name The pragma name, such as 'sourceMappingURL'.
     * @param {string} value The part after "=" in the pragma expression.
     * @param {string} extras Any extras on the line (like comments) that are not part of the extracted value.
     */
    constructor(prefix: string, name: string, value: string, extras: string);
    /**
     * Make a string from this source map info.
     * @param {string} valuePrefix An optional string to insert before the value, such as a sub-directory path, or missing protocol+server+port URL parts, etc.
     * @param {string} valueSuffix An optional string to insert after the value.
     */
    toString(valuePrefix?: string, valueSuffix?: string): string;
    valueOf(): string;
}
/** @See extractPragmas() */
export interface IExtractedPragmaDetails {
    /** The original source given to the function. */
    originalSource: string;
    /** The original source minus the extracted pragmas. */
    filteredSource: string;
    /** The extracted pragma information. */
    pragmas: PragmaInfo[];
}
/**
 * Extract any pragmas, such as source mapping. This is used mainly with XHR loading of scripts in order to execute them with
 * source mapping support while being served from a DreamSpace .Net Core MVC project.
 */
export declare function extractPragmas(src: string): IExtractedPragmaDetails;
/**
 * Extracts and replaces source mapping pragmas. This is used mainly with XHR loading of scripts in order to execute them with
 * source mapping support while being served from a DreamSpace .Net Core MVC project.
 */
export declare function fixSourceMappingsPragmas(sourcePragmaInfo: IExtractedPragmaDetails, scriptURL: string): string;
export {};
