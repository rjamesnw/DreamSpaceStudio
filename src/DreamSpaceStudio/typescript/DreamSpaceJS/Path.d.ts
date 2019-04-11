/** @module Path The path module contains functions for working with URI based paths. */
import { Uri } from "./Uri";
/** Contains functions for working with URI based paths. */
declare abstract class Path {
}
declare namespace Path {
    /** Parses the URL into 1: protocol (without '://'), 2: username, 3: password, 4: host, 5: port, 6: path, 7: query (without '?'), and 8: fragment (without '#'). */
    var URL_PARSER_REGEX: RegExp;
    /** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
    function parse(url: string): Uri;
    /**
       * Appends 'path2' to 'path1', inserting a path separator character (/) if required.
       * Set 'normalizePathSeparators' to true to normalize any '\' path characters to '/' instead.
       */
    function combine(path1: string, path2: string, normalizePathSeparators?: boolean): string;
    /** Returns the protocol + host + port parts of the given absolute URL. */
    function getRoot(absoluteURL: string | Uri): string;
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
    function resolve(path: string, currentResourceURL?: string, baseURL?: string): string;
    /** Fixes a URL by splitting it apart, trimming it, then recombining it along with a trailing forward slash (/) at the end. */
    function fix(url: string): string;
    /** Returns true if the specified extension is missing from the end of 'pathToFile'.
      * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
      * indirectly via a server side script, or handled in some other special way).
      * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
      */
    function hasFileExt(pathToFile: string, ext: string): boolean;
    /**
       * Redirect the current page to another location.
       * @param {string} url The URL to redirect to.
       * @param {boolean} url If true, the current page query string is merged. The default is false,
       * @param {boolean} bustCache If true, the current page query string is merged. The default is false,
       */
    function setLocation(url: string, includeExistingQuery?: boolean, bustCache?: boolean): void;
    /**
      * Returns true if the page URL contains the given controller and action names (not case sensitive).
      * This only works with typical default routing of "{host}/Controller/Action/etc.".
      * @param action A controller action name.
      * @param controller A controller name (defaults to "home" if not specified)
      */
    function isView(action: string, controller?: string): boolean;
    /** Subtracts the current site's base URL from the given URL and returns 'serverWebRoot' with the remained appended. */
    function map(url: string): string;
}
export { Path };
