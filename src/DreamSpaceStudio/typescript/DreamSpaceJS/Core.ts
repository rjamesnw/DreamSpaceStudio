import DS, { IDreamSpace as IDS } from "./Resources";
import { extendNS } from "./Types";

eval(extendNS(() => DreamSpaceCore, () => DS));

namespace DreamSpaceCore { // (the core scope)
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

    /** The System module is the based module for most developer related API operations, and is akin to the 'System' .NET namespace. */
    export namespace System {
        /** This namespace contains types and routines for data communication, URL handling, and page navigation. */
        export namespace IO {
            /** Path/URL based utilities. */
            export namespace Path {
                namespace(() => DreamSpace.System.IO.Path);
                // ==========================================================================================================================

                /** Parses the URL into 1: protocol (without '://'), 2: username, 3: password, 4: host, 5: port, 6: path, 7: query (without '?'), and 8: fragment (without '#'). */
                export var URL_PARSER_REGEX = /^[\t\f\v ]*(?:(?:(?:(\w+):\/\/|\/\/)(?:(.*?)(?::(.*?))?@)?([^#?/:~\r\n]*))(?::(\d*))?)?([^#?\r\n]+)?(?:\?([^#\r\n]*))?(?:\#(.*))?/m;
                // (testing: https://regex101.com/r/8qnEdP/5)

                /** The result of 'Path.parse()', and also helps building URLs manually. */
                export class Uri { // TODO: Make URL builder?
                    constructor(
                        /** Protocol (without '://'). */
                        public protocol?: string,
                        /** URL host. */
                        public hostName?: string,
                        /** Host port. */
                        public port?: string,
                        /** URL path. */
                        public path?: string,
                        /** Query (without '?'). */
                        public query?: string,
                        /** Fragment (without '#'). */
                        public fragment?: string,
                        /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
                        public username?: string, // (see also: https://goo.gl/94ivpK)
                        /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
                        public password?: string) {

                        if (typeof protocol != 'string') protocol = DreamSpace.toString(protocol);
                        if (typeof hostName != 'string') hostName = DreamSpace.toString(hostName);
                        if (typeof port != 'string') port = DreamSpace.toString(port);
                        if (typeof path != 'string') path = DreamSpace.toString(path);
                        if (typeof query != 'string') query = DreamSpace.toString(query);
                        if (typeof fragment != 'string') fragment = DreamSpace.toString(fragment);
                        if (typeof username != 'string') username = DreamSpace.toString(username);
                        if (typeof password != 'string') password = DreamSpace.toString(password);
                    }

                    /** Returns only  host + port parts combined. */
                    host() { return "" + (this.username ? this.username + (this.password ? ":" + this.password : "") + "@" : "") + (this.hostName || "") + (this.port ? ":" + this.port : ""); }

                    /** Returns only the protocol + host + port parts combined. */
                    origin() {
                        var p = this.protocol ? this.protocol + ":" : "", h = this.host();
                        return p + (h || p ? "//" + h + "/" : "");
                    }

                    /**
                       * Builds the full URL from the parts specified in this instance while also allowing to override parts.
                       * @param {string} origin An optional origin that replaces the protocol+host+port part.
                       * @param {string} path An optional path that replaces the current path property value on this instance.
                       * @param {string} query An optional query that replaces the current query property value on this instance.
                       * This value should not start with a '?', but if exists will be handled correctly.
                       * @param {string} fragment An optional fragment that replaces the current fragment property value on this instance.
                       * This value should not start with a '#', but if exists will be handled correctly.
                       */
                    toString(origin?: string, path?: string, query?: string, fragment?: string) {
                        // TODO: consider an option to auto-removed default ports based on protocols.
                        origin = origin && toString(origin) || this.origin();
                        path = path && toString(path) || this.path;
                        query = query && toString(query) || this.query;
                        fragment = fragment && toString(fragment) || this.fragment;
                        if (query.charAt(0) == '?') query = query.substr(1);
                        if (fragment.charAt(0) == '#') fragment = fragment.substr(1);
                        return combine(origin, path) + (query ? "?" + query : "") + (fragment ? "#" + fragment : "");
                    }

                    /** 
                       * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
                       * the path to the resource (minus the resource name part).
                       * For example, if the path is 'a/b/c' or 'a/b/c.ext' (etc.) then 'a/b/' is returned.
                       * This is useful to help remove resource names, such as file names, from the end of a URL path.
                       * @param {string} resourceName An optional resource name to append to the end of the resulting path.
                       */
                    getResourcePath(resourceName?: string) {
                        var m = (this.path || "").match(/.*[\/\\]/);
                        return (m && m[0] || "") + (resourceName !== void 0 && resourceName !== null ? toString(resourceName) : "");
                    }

                    /** 
                       * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
                       * the path to the resource (minus the resource name part), and optionally appends a new 'resourceName' value.
                       * For example, if the current Uri represents 'http://server/a/b/c?a=b#h' or 'http://server/a/b/c.ext?a=b#h' (etc.), and
                       * 'resourceName' is "x", then 'http://server/a/b/x?a=b#h' is returned.
                       * This is useful to help remove resource names, such as file names, from the end of a URL path.
                       * @param {string} resourceName An optional name to append to the end of the resulting path.
                       */
                    getResourceURL(resourceName?: string) { return this.toString(void 0, this.getResourcePath(resourceName)); }

                    /** Returns a new Uri object that represents the 'window.location' object values. */
                    static fromLocation() {
                        return new Uri(
                            location.protocol,
                            location.hostname,
                            location.port,
                            location.pathname,
                            location.search.substr(1),
                            location.hash.substr(1),
                            (<any>location).username,
                            (<any>location).password
                        );
                    }
                }

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

                // ===================================================================================================================

                export var QUERY_STRING_REGEX: RegExp = /[?|&][a-zA-Z0-9-._]+(?:=[^&#$]*)?/gi;

                /** 
                  * Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
                  * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
                  * with all values escaped and ready to be appended to a URI.
                  * Note: Call 'Query.new()' to create new instances.
                  */
                export class Query extends FactoryBase() {
                    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                       * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
                       * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                       */
                    static 'new': (query?: string | object, makeNamesLowercase?: boolean) => IQuery;
                    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                       * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
                       * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                       */
                    static init: (o: IQuery, isnew: boolean, query?: string | object, makeNamesLowercase?: boolean) => void;
                }
                export namespace Query {
                    export class $__type extends Disposable {
                        // ----------------------------------------------------------------------------------------------------------------

                        values: { [index: string]: string } = {};

                        // ----------------------------------------------------------------------------------------------------------------

                        /** 
                            * Use to add additional query string values. The function returns the current object to allow chaining calls.
                            * Example: add({'name1':'value1', 'name2':'value2', ...});
                            * Note: Use this to also change existing values.
                            * @param {boolean} newValues An object whose properties will be added to the current query.
                            * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                            */
                        addOrUpdate(newValues: object | { [index: string]: string }, makeNamesLowercase = false) {
                            if (newValues)
                                for (var pname in newValues)
                                    this.values[makeNamesLowercase ? pname.toLocaleLowerCase() : pname] = newValues[pname];
                            return this;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
                            * Warning: If the new name already exists, it will be replaced.
                            */
                        rename(newNames: { [index: string]: string }) {
                            for (var pname in this.values)
                                for (var pexistingname in newNames)
                                    if (pexistingname == pname && newNames[pexistingname] && newNames[pexistingname] != pname) { // (&& make sure the new name is actually different)
                                        this.values[newNames[pexistingname]] = this.values[pexistingname];
                                        delete this.values[pexistingname];
                                    }
                            return this;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: remove(['name1', 'name2', 'name3']);
                            */
                        remove(namesToDelete: string[]) {
                            if (namesToDelete && namesToDelete.length)
                                for (var i = 0, n = namesToDelete.length; i < n; ++i)
                                    if (this.values[namesToDelete[i]])
                                        delete this.values[namesToDelete[i]];
                            return this;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Creates and returns a duplicate of this object. */
                        clone(): IQuery {
                            var q = Path.Query.new();
                            for (var pname in this.values)
                                q.values[pname] = this.values[pname];
                            return q;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        appendTo(uri: string): string {
                            return uri.match(/^[^\?]*/g)[0] + this.toString();
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Returns the specified value, or a default value if nothing was found. */
                        getValue(name: string, defaultValueIfUndefined?: string): any {
                            var value = this.values[name];
                            if (value === void 0) value = defaultValueIfUndefined;
                            return value;
                        }

                        /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
                        getLCValue(name: string, defaultValueIfUndefined?: string): string {
                            var value = this.values[name];
                            if (value === void 0) value = defaultValueIfUndefined;
                            return ("" + value).toLowerCase();
                        }

                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        getUCValue(name: string, defaultValueIfUndefined?: string): string {
                            var value = this.values[name];
                            if (value === void 0) value = defaultValueIfUndefined;
                            return ("" + value).toUpperCase();
                        }

                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        getNumber(name: string, defaultValueIfUndefined?: number): number {
                            var value = parseFloat(this.values[name]);
                            if (value === void 0) value = defaultValueIfUndefined;
                            return value;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
                            * The existing value is replaced by the encoded value, and the encoded value is returned.
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        encodeValue(name: string): string {
                            var value = this.values[name], result: string;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = Text.Encoding.base64Encode(value, Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        }

                        /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
                            * The existing value is replaced by the decoded value, and the decoded value is returned.
                            */
                        decodeValue(name: string): string {
                            var value = this.values[name], result: string;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = Text.Encoding.base64Decode(value, Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        }

                        /** Encode ALL query values (see 'encodeValue()'). 
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        encodeAll(): void {
                            for (var p in this.values)
                                this.encodeValue(p);
                        }

                        /** Decode ALL query values (see 'encodeValue()'). 
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        decodeAll(): void {
                            for (var p in this.values)
                                this.decodeValue(p);
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** 
                           * Converts the underlying query values to a proper search string that can be appended to a URI.
                           * @param {boolean} addQuerySeparator If true (the default) prefixes '?' before the returned query string.
                           */
                        toString(addQuerySeparator = true): string {
                            var qstr = "";
                            for (var pname in this.values)
                                if (this.values[pname] !== void 0)
                                    qstr += (qstr ? "&" : "") + encodeURIComponent(pname) + "=" + encodeURIComponent(this.values[pname]);
                            return (addQuerySeparator ? "?" : "") + qstr;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        private static [constructor](factory: typeof Query) {
                            factory.init = (o, isnew, query = null, makeNamesLowercase = false) => {
                                if (query)
                                    if (typeof query == 'object')
                                        o.addOrUpdate(query, makeNamesLowercase);
                                    else {
                                        if (typeof query != 'string') query = toString(query);
                                        var nameValuePairs = query.match(QUERY_STRING_REGEX);
                                        var i: number, n: number, eqIndex: number, nameValue: string;
                                        if (nameValuePairs)
                                            for (var i = 0, n = nameValuePairs.length; i < n; ++i) {
                                                nameValue = nameValuePairs[i];
                                                eqIndex = nameValue.indexOf('='); // (need to get first instance of the '=' char)
                                                if (eqIndex == -1) eqIndex = nameValue.length; // (whole string is the name)
                                                if (makeNamesLowercase)
                                                    o.values[decodeURIComponent(nameValue).substring(1, eqIndex).toLowerCase()] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                                                else
                                                    o.values[decodeURIComponent(nameValue).substring(1, eqIndex)] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                                            }
                                    }
                            };
                        }
                    }

                    Query.$__register(Path);
                }

                export interface IQuery extends Query.$__type { }

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
                    if (url.substr(0, DreamSpace.baseURL.length).toLocaleLowerCase() == DreamSpace.baseURL.toLocaleLowerCase()) {
                        // TODO: Make this more robust by parsing and checked individual URL parts properly (like default vs explicit ports in the URL).
                        var subpath = url.substr(DreamSpace.baseURL.length);
                        return combine(DreamSpace.serverWebRoot, subpath);
                    }
                    else return parse(url).toString(DreamSpace.serverWebRoot); // (the origin is not the same, so just assume everything after the URL's origin is the path)
                }

                // ==========================================================================================================================

                /** This is set automatically to the query for the current page. */
                export var pageQuery = Query.new(location.href);

                // ==========================================================================================================================
            }

            // ===============================================================================================================================

            /** 
             * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
             * implementation designed to work better with the DreamSpace system specifically, and to support parallel loading).
             * Note: It is advised to use 'DreamSpace.Loader.loadResource()' to load resources instead of directly creating resource request objects.
             * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
             * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
             */
            export class ResourceRequest extends FactoryBase() {
                /** 
                 * If true (the default) then a 'ResourceRequest.cacheBustingVar+"="+Date.now()' query item is added to make sure the browser never uses
                 * the cache. To change the variable used, set the 'cacheBustingVar' property also.
                 * Each resource request instance can also have its own value set separate from the global one.
                 * Note: DreamSpace has its own caching that uses the local storage, where supported.
                 */
                static cacheBusting = true;

                /** See the 'cacheBusting' property. */
                static get cacheBustingVar() { return this._cacheBustingVar || '_v_'; }; // (note: ResourceInfo.cs uses this same default)
                static set cacheBustingVar(value) { this._cacheBustingVar = toString(value) || '_v_'; };
                private static _cacheBustingVar = '_v_';

                /** Returns a new module object only - does not load it. */
                static 'new': (...args: any[]) => IResourceRequest;
                /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                static init: (o: IResourceRequest, isnew: boolean, url: string, type: ResourceTypes | string, async?: boolean) => void;
            }
            export namespace ResourceRequest {
                export class $__type {
                    private $__index: number;

                    /** The requested resource URL. If the URL string starts with '~/' then it becomes relative to the content type base path. */
                    get url() {
                        if (typeof this._url == 'string' && this._url.charAt(0) == "~") {
                            var _baseURL = basePathFromResourceType(this.type);
                            return System.IO.Path.resolve(this._url, void 0, _baseURL);
                        }
                        return this._url;
                    }
                    set url(value: string) { this._url = value; }

                    /** The raw unresolved URL given for this resource. Use the 'url' property to resolve content roots when '~' is used. */
                    _url: string;

                    /** 
                       * The HTTP request method to use, such as "GET" (the default), "POST", "PUT", "DELETE", etc.  Ignored for non-HTTP(S) URLs.
                       * 
                       */
                    method = "GET";

                    /** Optional data to send with the request, such as for POST operations. */
                    body: any;

                    /** An optional username to pass to the XHR instance when opening the connecting. */
                    username: string;
                    /** An optional password to pass to the XHR instance when opening the connecting. */
                    password: string;

                    /** The requested resource type (to match against the server returned MIME type for data type verification). */
                    type: ResourceTypes | string;

                    /**
                       * The XMLHttpRequest object used for this request.  It's marked private to discourage access, but experienced
                       * developers should be able to use it if necessary to further configure the request for advanced reasons.
                       */
                    _xhr: XMLHttpRequest; // (for parallel loading, each request has its own connection)

                    /**
                       * The raw data returned from the HTTP request.
                       * Note: This does not change with new data returned from callback handlers (new data is passed on as the first argument to
                       * the next call [see 'transformedData']).
                       */
                    response: any; // (The response entity body according to responseType, as an ArrayBuffer, Blob, Document, JavaScript object (from JSON), or string. This is null if the request is not complete or was not successful.)

                    /** This gets set to data returned from callback handlers as the 'response' property value gets transformed.
                      * If no transformations were made, then the value in 'response' is returned.
                      */
                    get transformedResponse(): any {
                        return this.$__transformedData === noop ? this.response : this.$__transformedData;
                    }
                    private $__transformedData: any = noop;

                    /** The response code from the XHR response. */
                    responseCode: number = 0; // (the response code returned)
                    /** The response code message from the XHR response. */
                    responseMessage: string = ""; // (the response code message)

                    /** The current request status. */
                    status: RequestStatuses = RequestStatuses.Pending;

                    /** 
                     * A progress/error message related to the status (may not be the same as the response message).
                     * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
                     */
                    get message(): string { // (for errors, aborts, timeouts, etc.)
                        return this._message;
                    }
                    set message(value: string) {
                        this._message = value;
                        this.messageLog.push(this._message);
                        if (this.status == RequestStatuses.Error)
                            error("ResourceRequest (" + this.url + ")", this._message, this, false); // (send resource loading error messages to the console to aid debugging)
                        else
                            log("ResourceRequest (" + this.url + ")", this._message, LogTypes.Normal, this);
                    }
                    private _message: string;

                    /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
                    messageLog: string[] = [];

                    /** 
                     * If true (default), them this request is non-blocking, otherwise the calling script will be blocked until the request
                     * completes loading.  Please note that no progress callbacks can occur during blocked operations (since the thread is
                     * effectively 'paused' in this scenario).
                     * Note: Depreciated: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#Synchronous_request
                     * "Starting with Gecko 30.0 (Firefox 30.0 / Thunderbird 30.0 / SeaMonkey 2.27), Blink 39.0, and Edge 13, synchronous requests on the main thread have been deprecated due to the negative effects to the user experience."
                     */
                    async: boolean;

                    /** 
                     * If true (the default) then a '"_="+Date.now()' query item is added to make sure the browser never uses
                     * the cache. To change the variable used, set the 'cacheBustingVar' property also.
                     * Note: DreamSpace has its own caching that uses the local storage, where supported.
                     */
                    cacheBusting = ResourceRequest.cacheBusting;

                    /** See the 'cacheBusting' property. */
                    cacheBustingVar = ResourceRequest.cacheBustingVar;

                    private _onProgress: ICallback<IResourceRequest>[];
                    private _onReady: ICallback<IResourceRequest>[]; // ('onReady' is triggered in order of request made, and only when all included dependencies have completed successfully)

                    /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
                    * There's also an 'on finally' which should execute on success OR failure, regardless.
                    * For each entry, only ONE of any callback type will be set.
                    */
                    private _promiseChain: {
                        onLoaded?: IResultCallback<IResourceRequest>; // (resource is loaded, but may not be ready [i.e. previous scripts may not have executed yet])
                        onError?: IErrorCallback<IResourceRequest>; // (there is one error entry [defined or not] for every 'onLoaded' event entry, and vice versa)
                        onFinally?: ICallback<IResourceRequest>;
                    }[] = [];
                    private _promiseChainIndex: number = 0; // (the current position in the event chain)

                    /** 
                     * A list of parent requests that this request is depending upon.
                     * When 'start()' is called, all parents are triggered to load first, working downwards.
                     * Regardless of order, loading is in parallel asynchronously; however, the 'onReady' event will fire in the expected order.
                     * */
                    _parentRequests: IResourceRequest[];
                    private _parentCompletedCount = 0; // (when this equals the # of 'dependents', the all parent resources have loaded [just faster than iterating over them])
                    _dependants: IResourceRequest[]; // (dependant child resources)

                    private _paused = false;

                    private _queueDoNext(data: any) {
                        setTimeout(() => {
                            // ... before this, fire any handlers that would execute before this ...
                            this._doNext();
                        }, 0);
                    } // (simulate an async response, in case more handlers need to be added next)
                    private _queueDoError() { setTimeout(() => { this._doError(); }, 0); } // (simulate an async response, in case more handlers need to be added next)
                    private _requeueHandlersIfNeeded() {
                        if (this.status == RequestStatuses.Error)
                            this._queueDoError();
                        else if (this.status >= RequestStatuses.Waiting) {
                            this._queueDoNext(this.response);
                        }
                        // ... else, not needed, as the chain is still being traversed, so anything added will get run as expected ...
                    }

                    /** Triggers a success or error callback after the resource loads, or fails to load. */
                    then(success: IResultCallback<IResourceRequest>, error?: IErrorCallback<IResourceRequest>) {
                        if (success !== void 0 && success !== null && typeof success != 'function' || error !== void 0 && error !== null && typeof error !== 'function')
                            throw "A handler function given is not a function.";
                        else {
                            this._promiseChain.push({ onLoaded: success, onError: error });
                            this._requeueHandlersIfNeeded();
                        }
                        if (this.status == RequestStatuses.Waiting || this.status == RequestStatuses.Ready) {
                            this.status = RequestStatuses.Loaded; // (back up)
                            this.message = "New 'then' handler added.";
                        }
                        return this;
                    }

                    /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
                      * the dependant request fires its 'onReady' event.
                      * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
                      */
                    include<T extends IResourceRequest>(request: T) {
                        if (!request._parentRequests)
                            request._parentRequests = [];
                        if (!this._dependants)
                            this._dependants = [];
                        request._parentRequests.push(this);
                        this._dependants.push(request);
                        return request;
                    }

                    /**
                     * Add a call-back handler for when the request completes successfully.
                     * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
                     * @param handler
                     */
                    ready(handler: ICallback<IResourceRequest>) {
                        if (typeof handler == 'function') {
                            if (!this._onReady)
                                this._onReady = [];
                            this._onReady.push(handler);
                            this._requeueHandlersIfNeeded();
                        } else throw "Handler is not a function.";
                        return this;
                    }

                    /** Adds a hook into the resource load progress event. */
                    while(progressHandler: ICallback<IResourceRequest>) {
                        if (typeof progressHandler == 'function') {
                            if (!this._onProgress)
                                this._onProgress = [];
                            this._onProgress.push(progressHandler);
                            this._requeueHandlersIfNeeded();
                        } else throw "Handler is not a function.";
                        return this;
                    }

                    /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
                    abort(): void {
                        if (this._xhr.readyState > XMLHttpRequest.UNSENT && this._xhr.readyState < XMLHttpRequest.DONE) {
                            this._xhr.abort();
                        }
                    }

                    /**
                     * Provide a handler to catch any errors from this request.
                     */
                    catch(errorHandler: IErrorCallback<IResourceRequest>) {
                        if (typeof errorHandler == 'function') {
                            this._promiseChain.push({ onError: errorHandler });
                            this._requeueHandlersIfNeeded();
                        } else
                            throw "Handler is not a function.";
                        return this;
                    }

                    /**
                     * Provide a handler which should execute on success OR failure, regardless.
                     */
                    finally(cleanupHandler: ICallback<IResourceRequest>) {
                        if (typeof cleanupHandler == 'function') {
                            this._promiseChain.push({ onFinally: cleanupHandler });
                            this._requeueHandlersIfNeeded();
                        } else
                            throw "Handler is not a function.";
                        return this;
                    }

                    /** 
                       * Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
                       * order).  Regardless of the start order, all scripts are loaded in parallel.
                       * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
                       * @param {string} method An optional method to override the default request method set in the 'method' property on this request instance.
                       * @param {string} body Optional payload data to send, which overrides any value set in the 'payload' property on this request instance.
                       * @param {string} username Optional username value, instead of storing the username in the instance.
                       * @param {string} password Optional password value, instead of storing the password in the instance.
                       */
                    start(method?: string, body?: string, username?: string, password?: string): this {
                        if (this.async) setTimeout(() => { this._Start(method, body, username, password); }, 0); else this._Start(); return this;
                    }

                    private _Start(_method?: string, _body?: string, _username?: string, _password?: string) {
                        // ... start at the top most parent first, and work down ...
                        if (this._parentRequests)
                            for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                                this._parentRequests[i].start();

                        if (this.status == RequestStatuses.Pending) {
                            this.status = RequestStatuses.Loading; // (do this first to protect against any possible cyclical calls)
                            this.message = "Loading resource ...";

                            // ... this request has not been started yet; attempt to load the resource ...
                            // ... 1. see first if this file is cached in the web storage, then load it from there instead ...
                            //    (ignore the local caching if in debug or the versions are different)

                            if (!isDebugging() && typeof Storage !== void 0)
                                try {
                                    var currentAppVersion = getAppVersion();
                                    var versionInLocalStorage = localStorage.getItem("version");
                                    var appVersionInLocalStorage = localStorage.getItem("appVersion");
                                    if (versionInLocalStorage && appVersionInLocalStorage && version == versionInLocalStorage && currentAppVersion == appVersionInLocalStorage) {
                                        // ... all versions match, just pull from local storage (faster) ...
                                        this.response = localStorage.getItem("resource:" + this.url); // (should return 'null' if not found)
                                        if (this.response !== null && this.response !== void 0) {
                                            this.status = RequestStatuses.Loaded;
                                            this._doNext();
                                            return;
                                        }
                                    }
                                } catch (e) {
                                    // ... not supported? ...
                                }

                            // ... 2. check web SQL for the resource ...

                            // TODO: Consider Web SQL Database as well. (though not supported by IE yet, as usual, but could help greatly on the others) //?

                            // ... 3. if not in web storage, try loading from a DreamSpace core system, if available ...

                            // TODO: Message DreamSpace core system for resource data. // TODO: need to build the bridge class first.

                            // ... next, create an XHR object and try to load the resource ...

                            if (!this._xhr) {
                                this._xhr = new XMLHttpRequest();

                                var xhr = this._xhr;

                                var loaded = () => {
                                    if (xhr.status == 200 || xhr.status == 304) {
                                        this.response = xhr.response;
                                        this.status == RequestStatuses.Loaded;
                                        this.message = xhr.status == 304 ? "Loading completed (from browser cache)." : "Loading completed.";

                                        // ... check if the expected mime type matches, otherwise throw an error to be safe ...
                                        var responseType = xhr.getResponseHeader('content-type');
                                        if (this.type && responseType && <string><any>this.type != responseType) {
                                            this.setError("Resource type mismatch: expected type was '" + this.type + "', but received '" + responseType + "' (XHR type '" + xhr.responseType + "').\r\n");
                                        }
                                        else {
                                            if (!isDebugging() && typeof Storage !== void 0)
                                                try {
                                                    localStorage.setItem("version", version);
                                                    localStorage.setItem("appVersion", getAppVersion());
                                                    localStorage.setItem("resource:" + this.url, this.response);
                                                    this.message = "Resource cached in local storage.";
                                                } catch (e) {
                                                    // .. failed: out of space? ...
                                                    // TODO: consider saving to web SQL as well, or on failure (as a backup; perhaps create a storage class with this support). //?
                                                }
                                            else this.message = "Resource not cached in local storage because of debug mode. Release mode will use local storage to help survive clearing DreamSpace files when temporary content files are deleted.";

                                            this._doNext();
                                        }
                                    }
                                    else {
                                        this.setError("There was a problem loading the resource (status code " + xhr.status + ": " + xhr.statusText + ").\r\n");
                                    }
                                };

                                // ... this script is not cached, so load it ...

                                xhr.onreadystatechange = () => { // (onreadystatechange is supported by all browsers)
                                    switch (xhr.readyState) {
                                        case XMLHttpRequest.UNSENT: break;
                                        case XMLHttpRequest.OPENED: this.message = "Opened connection ..."; break;
                                        case XMLHttpRequest.HEADERS_RECEIVED: this.message = "Headers received ..."; break;
                                        case XMLHttpRequest.LOADING: break; // (this will be handled by the progress event)
                                        case XMLHttpRequest.DONE: loaded(); break;
                                    }
                                };

                                xhr.onerror = (ev: ProgressEvent) => { this.setError(void 0, ev); this._doError(); };
                                xhr.onabort = () => { this.setError("Request aborted."); };
                                xhr.ontimeout = () => { this.setError("Request timed out."); };
                                xhr.onprogress = (evt: ProgressEvent) => {
                                    this.message = Math.round(evt.loaded / evt.total * 100) + "% loaded ...";
                                    if (this._onProgress && this._onProgress.length)
                                        this._doOnProgress(evt.loaded / evt.total * 100);
                                };

                                // (note: all event 'on...' properties only available in IE10+)
                            }

                        }
                        else { // (this request was already started)
                            return;
                        }

                        if (xhr.readyState != 0)
                            xhr.abort(); // (abort existing, just in case)

                        var url = this.url;

                        try {
                            // ... check if we need to bust the cache ...
                            if (this.cacheBusting) {
                                var bustVar = this.cacheBustingVar;
                                if (bustVar.indexOf(" ") >= 0) log("start()", "There is a space character in the cache busting query name for resource '" + url + "'.", LogTypes.Warning);
                            }

                            if (!_method) _method = this.method || "GET";
                            xhr.open(_method, url, this.async, _username || this.username || void 0, _password || this.password || void 0);
                        }
                        catch (ex) {
                            error("start()", "Failed to load resource from URL '" + url + "': " + ((<Error>ex).message || ex), this);
                        }

                        try {
                            var payload: any = _body || this.body;
                            if (typeof payload == 'object' && payload.__proto__ == CoreObject.prototype) {
                                // (can't send object literals! convert to something else ...)
                                if (_method == 'GET') {
                                    var q = IO.Path.Query.new(payload);
                                    payload = q.toString(false);
                                } else {
                                    var formData = new FormData(); // TODO: Test if "multipart/form-data" is needed.
                                    for (var p in payload)
                                        formData.append(p, payload[p]);
                                    payload = formData;
                                }
                            }
                            xhr.send(payload);
                        }
                        catch (ex) {
                            error("start()", "Failed to send request to endpoint for URL '" + url + "': " + ((<Error>ex).message || ex), this);
                        }

                        //?if (!this.async && (xhr.status)) doSuccess();
                    }

                    /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
                    pause() {
                        if (this.status >= RequestStatuses.Pending && this.status < RequestStatuses.Ready
                            || this.status == RequestStatuses.Ready && this._onReady.length)
                            this._paused = true;
                        return this;
                    }

                    /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
                      * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
                      */
                    continue() {
                        if (this._paused) {
                            this._paused = false;
                            this._requeueHandlersIfNeeded();
                        }
                        return this;
                    }

                    private _doOnProgress(percent: number) {
                        // ... notify any handlers as well ...
                        if (this._onProgress) {
                            for (var i = 0, n = this._onProgress.length; i < n; ++i)
                                try {
                                    var cb = this._onProgress[i];
                                    if (cb)
                                        cb.call(this, this);
                                } catch (e) {
                                    this._onProgress[i] = null; // (won't be called again)
                                    this.setError("'on progress' callback #" + i + " has thrown an error:", e);
                                    // ... do nothing, not important ...
                                }
                        }
                    }

                    setError(message: string, error?: { name?: string; reason?: string; message?: string; type?: any; stack?: string }): void { // TODO: Make this better, perhaps with a class to handle error objects (see 'Error' AND 'ErrorEvent'). //?

                        if (error) {
                            var errMsg = getErrorMessage(error);
                            if (errMsg) {
                                if (message) message += " \r\n";
                                message += errMsg;
                            }
                        }

                        this.status = RequestStatuses.Error;
                        this.message = message; // (automatically adds to 'this.messages' and writes to the console)
                    }

                    private _doNext(): void { // (note: because this is a pseudo promise-like implementation on a single object instance, return values from handlers are not wrapped in new request instances [partially against specifications: http://goo.gl/igCsnS])
                        if (this.status == RequestStatuses.Error) {
                            this._doError(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                            return;
                        }

                        if (this._onProgress && this._onProgress.length) {
                            this._doOnProgress(100);
                            this._onProgress.length = 0;
                        }

                        for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                            if (this._paused) return;

                            var handlers = this._promiseChain[this._promiseChainIndex]; // (get all the handlers waiting for the result of this request)

                            if (handlers.onLoaded) {
                                try {
                                    var data = handlers.onLoaded.call(this, this, this.transformedResponse); // (call the handler with the current data and get the resulting data, if any)
                                } catch (e) {
                                    this.setError("An 'onLoaded' handler failed.", e);
                                    ++this._promiseChainIndex; // (the success callback failed, so trigger the error chain starting at next index)
                                    this._doError();
                                    return;
                                }

                                if (typeof data === 'object' && data instanceof $__type) {
                                    // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                    if ((<IResourceRequest>data).status == RequestStatuses.Error) {
                                        this.setError("Rejected request returned from 'onLoaded' handler.");
                                        ++this._promiseChainIndex;
                                        this._doError(); // (cascade the error)
                                        return;
                                    } else {
                                        // ... get the data from the request object ...
                                        var newResReq = <IResourceRequest>data;
                                        if (newResReq.status >= RequestStatuses.Ready) {
                                            if (newResReq === this) continue; // ('self' [this] was returned, so go directly to the next item)
                                            data = newResReq.transformedResponse; // (the data is ready, so read now)
                                        } else { // (loading is started, or still in progress, so wait; we simply hook into the request object to get notified when the data is ready)
                                            newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                                .catch((sender) => { this.setError("Resource returned from next handler has failed to load.", sender); this._doError(); });
                                            return;
                                        }
                                    }
                                }

                                if (data !== void 0)
                                    this.$__transformedData = data;

                            } else if (handlers.onFinally) {
                                try {
                                    handlers.onFinally.call(this);
                                } catch (e) {
                                    this.setError("Cleanup handler failed.", e);
                                    ++this._promiseChainIndex; // (the finally callback failed, so trigger the error chain starting at next index)
                                    this._doError();
                                }
                            }
                        }

                        this._promiseChain.length = 0;
                        this._promiseChainIndex = 0;

                        // ... finished: now trigger any "ready" handlers ...

                        if (this.status < RequestStatuses.Waiting)
                            this.status = RequestStatuses.Waiting; // (default to this next before being 'ready')

                        this._doReady(); // (this triggers in dependency order)
                    }

                    private _doReady(): void {
                        if (this._paused) return;

                        if (this.status < RequestStatuses.Waiting) return; // (the 'ready' event must only trigger after the resource loads, AND all handlers have been called)

                        // ... check parent dependencies first ...

                        if (this.status == RequestStatuses.Waiting)
                            if (!this._parentRequests || !this._parentRequests.length) {
                                this.status = RequestStatuses.Ready; // (no parent resource dependencies, so this resource is 'ready' by default)
                                this.message = "Resource has no dependencies, and is now ready.";
                            } else // ...need to determine if all parent (dependent) resources are completed first ...
                                if (this._parentCompletedCount == this._parentRequests.length) {
                                    this.status = RequestStatuses.Ready; // (all parent resource dependencies are now 'ready')
                                    this.message = "*** All dependencies for resource have loaded, and are now ready. ***";
                                } else {
                                    this.message = "Resource is waiting on dependencies (" + this._parentCompletedCount + "/" + this._parentRequests.length + " ready so far)...";
                                    return; // (nothing more to do yet)
                                }

                        // ... call the local 'onReady' event, and then trigger the call on the children as required.

                        if (this.status == RequestStatuses.Ready) {
                            if (this._onReady && this._onReady.length) {
                                try {
                                    for (var i = 0, n = this._onReady.length; i < n; ++i) {
                                        this._onReady[i].call(this, this);
                                        if (this.status < RequestStatuses.Ready)
                                            return; // (a callback changed state so stop at this point as we are no longer ready!)
                                    }
                                    if (this._paused) return;
                                } catch (e) {
                                    this.setError("Error in ready handler.", e);
                                    if (isDebugging() && (this.type == ResourceTypes.Application_Script || this.type == ResourceTypes.Application_ECMAScript))
                                        throw e; // (propagate script errors to the browser for debuggers, if any)
                                }
                            }

                            if (this._dependants)
                                for (var i = 0, n = this._dependants.length; i < n; ++i) {
                                    ++this._dependants[i]._parentCompletedCount;
                                    this._dependants[i]._doReady(); // (notify all children that this resource is now 'ready' for use [all events have been run, as opposed to just being loaded])
                                    if (this.status < RequestStatuses.Ready)
                                        return; // (something changed the "Ready" state so abort!)
                                }
                        }
                    }

                    private _doError(): void { // (note: the following event link handles the preceding error, skipping first any and all 'finally' handlers)
                        if (this._paused) return;

                        if (this.status != RequestStatuses.Error) {
                            this._doNext(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                            return;
                        }

                        for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                            if (this._paused) return;

                            var handlers = this._promiseChain[this._promiseChainIndex];

                            if (handlers.onError) {
                                try {
                                    var newData = handlers.onError.call(this, this, this.message); // (this handler should "fix" the situation and return valid data)
                                } catch (e) {
                                    this.setError("Error handler failed.", e);
                                }
                                if (typeof newData === 'object' && newData instanceof $__type) {
                                    // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                    if ((<IResourceRequest>newData).status == RequestStatuses.Error)
                                        return; // (no correction made, still in error; terminate the event chain here)
                                    else {
                                        var newResReq = <IResourceRequest>newData;
                                        if (newResReq.status >= RequestStatuses.Ready)
                                            newData = newResReq.transformedResponse;
                                        else { // (loading is started, or still in progress, so wait)
                                            newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                                .catch((sender) => { this.setError("Resource returned from error handler has failed to load.", sender); this._doError(); });
                                            return;
                                        }
                                    }
                                }
                                // ... continue with the value from the error handler (even if none) ...
                                this.status = RequestStatuses.Loaded;
                                this._message = void 0; // (clear the current message [but keep history])
                                ++this._promiseChainIndex; // (pass on to next handler in the chain)
                                this.$__transformedData = newData;
                                this._doNext();
                                return;
                            } else if (handlers.onFinally) {
                                try {
                                    handlers.onFinally.call(this);
                                } catch (e) {
                                    this.setError("Cleanup handler failed.", e);
                                }
                            }
                        }

                        // ... if this is reached, then there are no following error handlers, so throw the existing message ...

                        if (this.status == RequestStatuses.Error) {
                            var msgs = this.messageLog.join("\r\n· ");
                            if (msgs) msgs = ":\r\n· " + msgs; else msgs = ".";
                            throw new Error("Unhandled error loading resource " + ResourceTypes[this.type] + " from '" + this.url + "'" + msgs + "\r\n");
                        }
                    }

                    /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
                      * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
                      * @param {boolean} includeDependentResources Reload all resource dependencies as well.
                      */
                    reload(includeDependentResources: boolean = true) {
                        if (this.status == RequestStatuses.Error || this.status >= RequestStatuses.Ready) {
                            this.response = void 0;
                            this.status = RequestStatuses.Pending;
                            this.responseCode = 0;
                            this.responseMessage = "";
                            this._message = "";
                            this.messageLog = [];

                            if (includeDependentResources)
                                for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                                    this._parentRequests[i].reload(includeDependentResources);

                            if (this._onProgress)
                                this._onProgress.length = 0;

                            if (this._onReady)
                                this._onReady.length = 0;

                            if (this._promiseChain)
                                this._promiseChain.length = 0;

                            this.start();
                        }
                        return this;
                    }

                    private static [constructor](factory: typeof ResourceRequest) {
                        factory.init = (o, isnew, url, type, async = true) => {
                            if (url === void 0 || url === null) throw "A resource URL is required.";
                            if (type === void 0) throw "The resource type is required.";

                            if ((<any>_resourceRequestByURL)[url])
                                return (<any>_resourceRequestByURL)[url]; // (abandon this new object instance in favor of the one already existing and returned it)

                            o.url = url;
                            o.type = type;
                            o.async = async;

                            o.$__index = _resourceRequests.length;

                            _resourceRequests.push(o);
                            _resourceRequestByURL[o.url] = o;
                        };
                    }
                }

                ResourceRequest.$__register(IO);
            }

            export interface IResourceRequest extends ResourceRequest.$__type { }

            // ===============================================================================================================================

            var _resourceRequests: IResourceRequest[] = []; // (requests are loaded in parallel, but executed in order of request)
            var _resourceRequestByURL: { [url: string]: IResourceRequest } = {}; // (a quick named index lookup into '__loadRequests')

            /** A shortcut for returning a load request promise-type object for a resource loading operation. */
            export function get(url: string, type?: ResourceTypes | string, asyc: boolean = true): IResourceRequest {
                if (url === void 0 || url === null) throw "A resource URL is required.";
                url = "" + url;
                if (type === void 0 || type === null) {
                    // (make sure it's a string)
                    // ... a valid type is required, but try to detect first ...
                    var ext = (url.match(/(\.[A-Za-z0-9]+)(?:[\?\#]|$)/i) || []).pop();
                    type = getResourceTypeFromExtension(ext);
                    if (!type)
                        error("Loader.get('" + url + "', type:" + type + ")", "A resource (MIME) type is required, and no resource type could be determined (See DreamSpace.Loader.ResourceTypes). If the resource type cannot be detected by a file extension then you must specify the MIME string manually.");
                }
                var request = _resourceRequestByURL[url]; // (try to load any already existing requests)
                if (!request)
                    request = ResourceRequest.new(url, type, asyc);
                return request;
            }

            // ===============================================================================================================================
        }
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
                        + System.IO.Path.resolve(pragma.value, System.IO.Path.map(scriptURL), serverWebRoot ? serverWebRoot : baseScriptsURL) + pragma.extras;
            }
        return script;
    }

    // ========================================================================================================================================

    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using DreamSpace.JS for
     * .Net Core MVC, make sure '@RenderDreamSpaceJSConfigurations()' is called before all scripts in the header section of your layout view.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseURL: string = System.IO.Path.fix(global.siteBaseURL || baseURL || location.origin); // (example: "https://calendar.google.com/")

    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseScriptsURL: string = global.scriptsBaseURL ? System.IO.Path.fix(global.scriptsBaseURL || baseScriptsURL) : baseURL + "js/";

    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseCSSURL: string = global.cssBaseURL ? System.IO.Path.fix(global.cssBaseURL || baseCSSURL) : baseURL + "css/";

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
}

// ========================================================================================================================================

type ThisNS = typeof DreamSpaceCore;
export interface IDreamSpace extends IDS, ThisNS { }
var DreamSpace = <IDreamSpace>DreamSpaceCore;
export default DreamSpace;
