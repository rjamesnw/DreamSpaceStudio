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
