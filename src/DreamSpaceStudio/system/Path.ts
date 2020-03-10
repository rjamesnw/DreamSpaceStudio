namespace DS {

    /** Contains functions for working with URI based paths. */
    export namespace Path {
        /** Parses the URL into 1: protocol (without '://'), 2: username, 3: password, 4: host, 5: port, 6: path, 7: query (without '?'), and 8: fragment (without '#'). */
        export var URL_PARSER_REGEX = /^[\t\f\v ]*(?:(?:(?:(\w+):\/\/|\/\/)(?:(.*?)(?::(.*?))?@)?([^#?/:~\r\n]*))(?::(\d*))?)?([^#?\r\n]+)?(?:\?([^#\r\n]*))?(?:\#(.*))?/m;
        // (testing: https://regex101.com/r/8qnEdP/5)

        /** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
        export function parse(url: string) {
            if (typeof url != 'string') url = StringUtils.toString(url);
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

        export var restrictedFilenameRegex = /\/\\\?%\*:\|"<>/g;

        /** Returns true if a given filename contains invalid characters. */
        export function isValidFileName(name: string) {
            return name && restrictedFilenameRegex.test(name);
        }

        /** Splits and returns the path parts, validating each one and throwing an exception if any are invalid. */
        export function getPathParts(path: string) {
            var parts = (typeof path !== 'string' ? '' + path : path).replace(/\\/g, '/').split('/');
            for (var i = 0, n = parts.length; i < n; ++i)
                if (!isValidFileName(parts[i])) throw "The path '" + path + "' contains invalid characters in '" + parts[i] + "'.";
            return parts;
        }

        /** Returns the directory path minus the filename (up to the last name that is followed by a directory separator,). 
         * Since the file API does not support special character such as '.' or '..', these are ignored as directory characters (but not removed).
         * Examples:
         * - "/A/B/C/" => "/A/B/C"
         * - "A/B/C" => "A/B"
         * - "//A/B/C//" => "/A/B/C"
         * - "/" => "/"
         * - "" => ""
         */
        export function getPath(filepath: string) {
            if (!filepath) return "";
            var parts = filepath.replace(/\\/g, '/').split('/'), i1 = 0, i2 = parts.length - 2;
            while (i1 < parts.length && !parts[i1]) i1++;
            while (i2 > i1 && !parts[i2]) i2--;
            return (i1 > 0 ? "/" : "") + parts.slice(i1, i2 + 1).join('/');
        }

        /** Returns the directory path minus the filename (up to the last name that is followed by a directory separator,). 
        * Since the file API does not support special character such as '.' or '..', these are ignored as directory characters (but not removed).
        * Examples:
        * - "/A/B/C/" => ""
        * - "A/B/C" => "C"
        * - "/" => ""
        * - "" => ""
        */
        export function getName(filepath: string) {
            if (!filepath) return "";
            var parts = filepath.replace(/\\/g, '/').split('/');
            return parts[parts.length - 1] || "";
        }

        /**
        * Appends 'path2' to 'path1', inserting a path separator character (/) if required.
        * Set 'normalizePathSeparators' to true to normalize any '\' path characters to '/' instead.
        */
        export function combine(path1: string, path2: string, normalizePathSeparators = false): string {
            if (typeof path1 != 'string') path1 = StringUtils.toString(path1);
            if (typeof path2 != 'string') path2 = StringUtils.toString(path2);
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
        export function resolve(path: string, currentResourceURL = DS.global.location.href, baseURL = DS.baseURL) {
            baseURL = StringUtils.toString(baseURL).trim();
            currentResourceURL = StringUtils.toString(currentResourceURL).trim();
            if (currentResourceURL) currentResourceURL = parse(currentResourceURL).getResourceURL();
            path = StringUtils.toString(path).trim();
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

        /** Subtracts the current site's base URL from the given URL and returns 'serverWebRoot' with the remained appended. */
        export function map(url: string) {
            if (url.substr(0, DS.baseURL.length).toLocaleLowerCase() == DS.baseURL.toLocaleLowerCase()) {
                // TODO: Make this more robust by parsing and checked individual URL parts properly (like default vs explicit ports in the URL).
                var subpath = url.substr(DS.baseURL.length);
                return combine(DS.global.serverWebRoot, subpath);
            }
            else return parse(url).toString(DS.global.serverWebRoot); // (the origin is not the same, so just assume everything after the URL's origin is the path)
        }

        const absRegex = /^(?:.*:[\\/]|[\\\/])/;

        /** Returns true if the given path is an absolute path. If false, the path is relative.
         * When a path is absolute it should not have any other path prefixed before it.
         */
        export function isAbsolute(path: string) { return absRegex.test(path); }
    }

}
