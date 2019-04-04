"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logging_1 = require("./Logging");
const Resources_1 = require("./Resources");
// ------------------------------------------------------------------------------------------------------------------------
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
 * Returns the base path based on the resource type.
 */
function basePathFromResourceType(resourceType) {
    return (resourceType == Resources_1.ResourceTypes.Application_Script || resourceType == Resources_1.ResourceTypes.Application_ECMAScript) ? exports.baseScriptsURL :
        resourceType == Resources_1.ResourceTypes.Text_CSS ? exports.baseCSSURL : exports.baseURL;
}
exports.basePathFromResourceType = basePathFromResourceType;
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
                    + Path.resolve(pragma.value, Path.map(scriptURL), exports.serverWebRoot ? exports.serverWebRoot : exports.baseScriptsURL) + pragma.extras;
        }
    return script;
}
exports.fixSourceMappingsPragmas = fixSourceMappingsPragmas;
// ========================================================================================================================================
/**
 * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using DreamSpace.JS for
 * .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called before all scripts in the header section of your layout view.
 * If no 'siteBaseURL' global property exists, the current page location is assumed.
 */
exports.baseURL = Path.fix(global.siteBaseURL || exports.baseURL || location.origin); // (example: "https://calendar.google.com/")
/**
 * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
 * If no 'siteBaseURL' global property exists, the current page location is assumed.
 */
exports.baseScriptsURL = global.scriptsBaseURL ? Path.fix(global.scriptsBaseURL || exports.baseScriptsURL) : exports.baseURL + "js/";
/**
 * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
 * If no 'siteBaseURL' global property exists, the current page location is assumed.
 */
exports.baseCSSURL = global.cssBaseURL ? Path.fix(global.cssBaseURL || exports.baseCSSURL) : exports.baseURL + "css/";
Logging_1.log("DreamSpace.baseURL", exports.baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using DreamSpace.JS for .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
Logging_1.log("DreamSpace.baseScriptsURL", exports.baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");
if (exports.serverWebRoot)
    Logging_1.log("DreamSpace.serverWebRoot", exports.serverWebRoot + " (typically set server side within the layout view only while debugging to help resolve script source maps)");
// ========================================================================================================================================
// *** At this point the core type system, error handling, and console-based logging are now available. ***
// ========================================================================================================================================
Logging_1.log("DreamSpace", "Core system loaded.", Logging_1.LogTypes.Info);
// ========================================================================================================================================
//# sourceMappingURL=Core.js.map