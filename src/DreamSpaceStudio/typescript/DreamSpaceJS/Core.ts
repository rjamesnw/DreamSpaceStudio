import { log, LogTypes } from "./Logging";
import { ResourceTypes } from "./Resources";
import Path from "./Path";

// ------------------------------------------------------------------------------------------------------------------------

/** Used to strip out script source mappings. Used with 'extractSourceMapping()'. */
export var SCRIPT_SOURCE_MAPPING_REGEX = /^\s*(\/\/[#@])\s*([A-Za-z0-9$_]+)\s*=\s*([^;/]*)(.*)/gim;

/** Holds details on extract script pragmas. @See extractPragmas() */
export class PragmaInfo {
    /**
     * @param {string} prefix The "//#" part.
     * @param {string} name The pragma name, such as 'sourceMappingURL'.
     * @param {string} value The part after "=" in the pragma expression.
     * @param {string} extras Any extras on the line (like comments) that are not part of the extracted value.
     */
    constructor(public prefix: string, public name: string, public value: string, public extras: string) {
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
    toString(valuePrefix?: string, valueSuffix?: string) {
        if (valuePrefix !== void 0 && valuePrefix !== null && typeof valuePrefix != 'string') valuePrefix = '' + valuePrefix;
        if (valueSuffix !== void 0 && valuePrefix !== null && typeof valueSuffix != 'string') valueSuffix = '' + valueSuffix;
        return this.prefix + " " + this.name + "=" + (valuePrefix || "") + this.value + (valueSuffix || "") + this.extras;
    } // (NOTE: I space after the prefix IS REQUIRED [at least for IE])
    valueOf() { return this.prefix + " " + this.name + "=" + this.value + this.extras; }
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
export function extractPragmas(src: string) {
    var srcMapPragmas: PragmaInfo[] = [], result: RegExpExecArray, filteredSrc = src;
    SCRIPT_SOURCE_MAPPING_REGEX.lastIndex = 0;
    while ((result = SCRIPT_SOURCE_MAPPING_REGEX.exec(src)) !== null) {
        var srcMap = new PragmaInfo(result[1], result[2], result[3], result[4]);
        srcMapPragmas.push(srcMap);
        filteredSrc = filteredSrc.substr(0, result.index) + filteredSrc.substr(result.index + result[0].length);
    }
    return <IExtractedPragmaDetails>{
        /** The original source given to the function. */
        originalSource: src,
        /** The original source minus the extracted pragmas. */
        filteredSource: filteredSrc,
        /** The extracted pragma information. */
        pragmas: srcMapPragmas
    };
}

/** 
 * Returns the base path based on the resource type.  
 */
export function basePathFromResourceType(resourceType: string | ResourceTypes) {
    return (resourceType == ResourceTypes.Application_Script || resourceType == ResourceTypes.Application_ECMAScript) ? baseScriptsURL :
        resourceType == ResourceTypes.Text_CSS ? baseCSSURL : baseURL;
}

/** 
 * Extracts and replaces source mapping pragmas. This is used mainly with XHR loading of scripts in order to execute them with
 * source mapping support while being served from a DreamSpace .Net Core MVC project.
 */
export function fixSourceMappingsPragmas(sourcePragmaInfo: IExtractedPragmaDetails, scriptURL: string) {
    var script = sourcePragmaInfo && sourcePragmaInfo.originalSource || "";
    if (sourcePragmaInfo.pragmas && sourcePragmaInfo.pragmas.length)
        for (var i = 0, n = +sourcePragmaInfo.pragmas.length; i < n; ++i) {
            var pragma = sourcePragmaInfo.pragmas[i];
            if (pragma.name.substr(0, 6) != "source")
                script += "\r\n" + pragma; // (not for source mapping, so leave as is)
            else
                script += "\r\n" + pragma.prefix + " " + pragma.name + "="
                    + Path.resolve(pragma.value, Path.map(scriptURL), serverWebRoot ? serverWebRoot : baseScriptsURL) + pragma.extras;
        }
    return script;
}

// ========================================================================================================================================

/**
 * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using DreamSpace.JS for
 * .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called before all scripts in the header section of your layout view.
 * If no 'siteBaseURL' global property exists, the current page location is assumed.
 */
export var baseURL: string = Path.fix(DreamSpace.global.siteBaseURL || baseURL || location.origin); // (example: "https://calendar.google.com/")

/**
 * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
 * If no 'siteBaseURL' global property exists, the current page location is assumed.
 */
export var baseScriptsURL: string = DreamSpace.global.scriptsBaseURL ? Path.fix(DreamSpace.global.scriptsBaseURL || baseScriptsURL) : baseURL + "js/";

/**
 * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
 * If no 'siteBaseURL' global property exists, the current page location is assumed.
 */
export var baseCSSURL: string = DreamSpace.global.cssBaseURL ? Path.fix(DreamSpace.global.cssBaseURL || baseCSSURL) : baseURL + "css/";

/**
 * This is set by default when '@RenderDreamSpaceJSConfigurations()' is called at the top of the layout page and a debugger is attached. It is
 * used to resolve source maps delivered through XHR while debugging.
 * Typically the server side web root file path matches the same root as the http root path in 'baseURL'.
 */
export var serverWebRoot: string;

log("DreamSpace.baseURL", baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using DreamSpace.JS for .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
log("DreamSpace.baseScriptsURL", baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");

if (serverWebRoot)
    log("DreamSpace.serverWebRoot", serverWebRoot + " (typically set server side within the layout view only while debugging to help resolve script source maps)");

// ========================================================================================================================================

// *** At this point the core type system, error handling, and console-based logging are now available. ***

// ========================================================================================================================================

log("DreamSpace", "Core system loaded.", LogTypes.Info);

// ========================================================================================================================================
