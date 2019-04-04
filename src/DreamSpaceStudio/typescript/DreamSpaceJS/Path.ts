/** @module Path The path module contains functions for working with URI based paths. */

import { baseURL, serverWebRoot } from "./Core";
import { Uri } from "./Uri";

// ==========================================================================================================================

/** Parses the URL into 1: protocol (without '://'), 2: username, 3: password, 4: host, 5: port, 6: path, 7: query (without '?'), and 8: fragment (without '#'). */
export var URL_PARSER_REGEX = /^[\t\f\v ]*(?:(?:(?:(\w+):\/\/|\/\/)(?:(.*?)(?::(.*?))?@)?([^#?/:~\r\n]*))(?::(\d*))?)?([^#?\r\n]+)?(?:\?([^#\r\n]*))?(?:\#(.*))?/m;
// (testing: https://regex101.com/r/8qnEdP/5)

/** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
export function parse(url: string) {
    if (typeof url != 'string') url = toString(url);
    var m = url.match(URL_PARSER_REGEX);
    return m && new Uri(
        (m[1] || "").trim(),
        (m[4] || "").trim(),
        (+(m[5] || "").trim() || "").toString(),
        (m[6] || "").trim(),
        (m[7] || "").trim(),
        (m[8] || "").trim(),
        (m[2] || "").trim(),
        (m[3] || "").trim()
    ) || // (just in case it fails somehow...)
        new Uri(void 0, void 0, void 0, url); // (returns the url as is if this is not a proper absolute path)
}

/**
   * Appends 'path2' to 'path1', inserting a path separator character (/) if required.
   * Set 'normalizePathSeparators' to true to normalize any '\' path characters to '/' instead.
   */
export function combine(path1: string, path2: string, normalizePathSeparators = false): string {
    if (typeof path1 != 'string') path1 = toString(path1);
    if (typeof path2 != 'string') path2 = toString(path2);
    if (path2.charAt(0) == '~') path2 = path2.substr(1);
    if (!path2) return path1;
    if (!path1) return path2;
    if (path1.charAt(path1.length - 1) != '/' && path1.charAt(path1.length - 1) != '\\') path1 += '/';
    var combinedPath = path1 + ((path2.charAt(0) == '/' || path2.charAt(0) == '\\') ? path2.substr(1) : path2);
    return normalizePathSeparators ? combinedPath.split('\\').join('/') : combinedPath;
}

/** Returns the protocol + host + port parts of the given absolute URL. */
export function getRoot(absoluteURL: string | Uri) {
    return (absoluteURL instanceof Uri ? absoluteURL : parse(absoluteURL)).origin();
}

/** 
   * Combines a path with either the base site path or a current alternative path. The following logic is followed for combining 'path':
   * 1. If it starts with '~/' or '~' is will be relative to 'baseURL'.
   * 2. If it starts with '/' it is relative to the server root 'protocol://server:port' (using current or base path, but with the path part ignored).
   * 3. If it starts without a path separator, or is empty, then it is combined as relative to 'currentResourceURL'.
   * Note: if 'currentResourceURL' is empty, then 'baseURL' is assumed.
   * @param {string} currentResourceURL An optional path that specifies a resource location to take into consideration when resolving relative paths.
   * If not specified, this is 'location.href' by default.
   * @param {string} baseURL An optional path that specifies the site's root URL.  By default this is 'DreamSpace.baseURL'.
   */
export function resolve(path: string, currentResourceURL = location.href, baseURL = DreamSpace.baseURL) {
    baseURL = toString(baseURL).trim();
    currentResourceURL = toString(currentResourceURL).trim();
    if (currentResourceURL) currentResourceURL = parse(currentResourceURL).getResourceURL();
    path = toString(path).trim();
    if (!path) return currentResourceURL || baseURL;
    if (path.charAt(0) == '/' || path.charAt(0) == '\\') {
        // ... resolve to the root of the host; determine current or base, whichever is available ...
        var parts = currentResourceURL && parse(currentResourceURL) || null;
        if (parts && (parts.protocol || parts.hostName))
            return combine(getRoot(parts), path);
        else
            return combine(getRoot(baseURL), path);
    }
    if (path.charAt(0) == '~') return combine(baseURL, path);
    // ... check if path is already absolute with a protocol ...
    var parts = parse(path);
    if (parts.protocol || parts.hostName) return path; // (already absolute)
    return combine(currentResourceURL || baseURL, path);
}
// TODO: Consider 'absolute()' function to resolve '..' in paths. Resolve the URL first, then modify the final path.

/** Fixes a URL by splitting it apart, trimming it, then recombining it along with a trailing forward slash (/) at the end. */
export function fix(url: string): string {
    return parse(url).toString();
}

// ===================================================================================================================

/** Returns true if the specified extension is missing from the end of 'pathToFile'.
  * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
  * indirectly via a server side script, or handled in some other special way).
  * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
  */
export function hasFileExt(pathToFile: string, ext: string): boolean {
    if (ext.length > 0 && ext.charAt(0) != '.') ext = '.' + ext;
    return pathToFile.lastIndexOf(ext) == pathToFile.length - ext.length || pathToFile.indexOf("?") >= 0 || pathToFile.indexOf("#") >= 0;
}

// ==========================================================================================================================

//! if (pageQuery.getValue('debug', '') == 'true') Diagnostics.debug = Diagnostics.DebugModes.Debug_Run; // (only allow this on the sandbox and development servers)
//! var demo = demo || pageQuery.getValue('demo', '') == 'true'; // (only allow this on the sandbox and development servers)

/** 
   * Redirect the current page to another location.
   * @param {string} url The URL to redirect to.
   * @param {boolean} url If true, the current page query string is merged. The default is false,
   * @param {boolean} bustCache If true, the current page query string is merged. The default is false,
   */
export function setLocation(url: string, includeExistingQuery = false, bustCache = false) {
    var query = Query.new(url);
    if (bustCache) query.values[ResourceRequest.cacheBustingVar] = Date.now().toString();
    if (includeExistingQuery)
        query.addOrUpdate(pageQuery.values);
    if (url.charAt(0) == '/')
        url = resolve(url);
    url = query.appendTo(url);
    query.dispose();
    if (wait)
        wait();
    setTimeout(() => { location.href = url; }, 1); // (let events finish before setting)
}

// ==========================================================================================================================

/**
  * Returns true if the page URL contains the given controller and action names (not case sensitive).
  * This only works with typical default routing of "{host}/Controller/Action/etc.".
  * @param action A controller action name.
  * @param controller A controller name (defaults to "home" if not specified)
  */
export function isView(action: string, controller = "home"): boolean {
    return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(location.pathname);
}

// ==========================================================================================================================

/** Subtracts the current site's base URL from the given URL and returns 'serverWebRoot' with the remained appended. */
export function map(url: string) {
    if (url.substr(0, baseURL.length).toLocaleLowerCase() == baseURL.toLocaleLowerCase()) {
        // TODO: Make this more robust by parsing and checked individual URL parts properly (like default vs explicit ports in the URL).
        var subpath = url.substr(baseURL.length);
        return combine(serverWebRoot, subpath);
    }
    else return parse(url).toString(serverWebRoot); // (the origin is not the same, so just assume everything after the URL's origin is the path)
}

// ===============================================================================================================================
