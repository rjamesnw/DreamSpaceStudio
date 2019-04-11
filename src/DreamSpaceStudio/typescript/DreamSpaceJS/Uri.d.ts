/** The result of 'Path.parse()', and also helps building URLs manually. */
export declare class Uri {
    /** Protocol (without '://'). */
    protocol?: string;
    /** URL host. */
    hostName?: string;
    /** Host port. */
    port?: string;
    /** URL path. */
    path?: string;
    /** Query (without '?'). */
    query?: string;
    /** Fragment (without '#'). */
    fragment?: string;
    /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
    username?: string;
    /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
    password?: string;
    constructor(
    /** Protocol (without '://'). */
    protocol?: string, 
    /** URL host. */
    hostName?: string, 
    /** Host port. */
    port?: string, 
    /** URL path. */
    path?: string, 
    /** Query (without '?'). */
    query?: string, 
    /** Fragment (without '#'). */
    fragment?: string, 
    /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
    username?: string, // (see also: https://goo.gl/94ivpK)
    /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
    password?: string);
    /** Returns only  host + port parts combined. */
    host(): string;
    /** Returns only the protocol + host + port parts combined. */
    origin(): string;
    /**
       * Builds the full URL from the parts specified in this instance while also allowing to override parts.
       * @param {string} origin An optional origin that replaces the protocol+host+port part.
       * @param {string} path An optional path that replaces the current path property value on this instance.
       * @param {string} query An optional query that replaces the current query property value on this instance.
       * This value should not start with a '?', but if exists will be handled correctly.
       * @param {string} fragment An optional fragment that replaces the current fragment property value on this instance.
       * This value should not start with a '#', but if exists will be handled correctly.
       */
    toString(origin?: string, path?: string, query?: string, fragment?: string): string;
    /**
       * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
       * the path to the resource (minus the resource name part).
       * For example, if the path is 'a/b/c' or 'a/b/c.ext' (etc.) then 'a/b/' is returned.
       * This is useful to help remove resource names, such as file names, from the end of a URL path.
       * @param {string} resourceName An optional resource name to append to the end of the resulting path.
       */
    getResourcePath(resourceName?: string): string;
    /**
       * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
       * the path to the resource (minus the resource name part), and optionally appends a new 'resourceName' value.
       * For example, if the current Uri represents 'http://server/a/b/c?a=b#h' or 'http://server/a/b/c.ext?a=b#h' (etc.), and
       * 'resourceName' is "x", then 'http://server/a/b/x?a=b#h' is returned.
       * This is useful to help remove resource names, such as file names, from the end of a URL path.
       * @param {string} resourceName An optional name to append to the end of the resulting path.
       */
    getResourceURL(resourceName?: string): string;
    /** Returns a new Uri object that represents the 'window.location' object values. */
    static fromLocation(): Uri;
}
