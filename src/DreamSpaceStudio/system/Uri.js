// ############################################################################################################################
var DS;
(function (DS) {
    /** The result of 'Path.parse()', and also helps building URLs manually. */
    class Uri {
        constructor(
        /** Protocol (without '://'). */
        protocol, 
        /** URL host. */
        hostName, 
        /** Host port. */
        port, 
        /** URL path. */
        path, 
        /** Query (without '?'). */
        query, 
        /** Fragment (without '#'). */
        fragment, 
        /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
        username, // (see also: https://goo.gl/94ivpK)
        /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
        password) {
            this.protocol = protocol;
            this.hostName = hostName;
            this.port = port;
            this.path = path;
            this.query = query;
            this.fragment = fragment;
            this.username = username;
            this.password = password;
            if (typeof protocol != 'string')
                protocol = DS.StringUtils.toString(protocol);
            if (typeof hostName != 'string')
                hostName = DS.StringUtils.toString(hostName);
            if (typeof port != 'string')
                port = DS.StringUtils.toString(port);
            if (typeof path != 'string')
                path = DS.StringUtils.toString(path);
            if (typeof query != 'string')
                query = DS.StringUtils.toString(query);
            if (typeof fragment != 'string')
                fragment = DS.StringUtils.toString(fragment);
            if (typeof username != 'string')
                username = DS.StringUtils.toString(username);
            if (typeof password != 'string')
                password = DS.StringUtils.toString(password);
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
        toString(origin, path, query, fragment) {
            // TODO: consider an option to auto-removed default ports based on protocols.
            origin = origin && DS.StringUtils.toString(origin) || this.origin();
            path = path && DS.StringUtils.toString(path) || this.path;
            query = query && DS.StringUtils.toString(query) || this.query;
            fragment = fragment && DS.StringUtils.toString(fragment) || this.fragment;
            if (query.charAt(0) == '?')
                query = query.substr(1);
            if (fragment.charAt(0) == '#')
                fragment = fragment.substr(1);
            return DS.Path.combine(origin, path) + (query ? "?" + query : "") + (fragment ? "#" + fragment : "");
        }
        /**
           * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
           * the path to the resource (minus the resource name part).
           * For example, if the path is 'a/b/c' or 'a/b/c.ext' (etc.) then 'a/b/' is returned.
           * This is useful to help remove resource names, such as file names, from the end of a URL path.
           * @param {string} resourceName An optional resource name to append to the end of the resulting path.
           */
        getResourcePath(resourceName) {
            var m = (this.path || "").match(/.*[\/\\]/);
            return (m && m[0] || "") + (resourceName !== void 0 && resourceName !== null ? DS.StringUtils.toString(resourceName) : "");
        }
        /**
           * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
           * the path to the resource (minus the resource name part), and optionally appends a new 'resourceName' value.
           * For example, if the current Uri represents 'http://server/a/b/c?a=b#h' or 'http://server/a/b/c.ext?a=b#h' (etc.), and
           * 'resourceName' is "x", then 'http://server/a/b/x?a=b#h' is returned.
           * This is useful to help remove resource names, such as file names, from the end of a URL path.
           * @param {string} resourceName An optional name to append to the end of the resulting path.
           */
        getResourceURL(resourceName) { return this.toString(void 0, this.getResourcePath(resourceName)); }
        /** Returns a new Uri object that represents the 'window.location' object values. */
        static fromLocation() {
            return new Uri(location.protocol, location.hostname, location.port, location.pathname, location.search.substr(1), location.hash.substr(1), location.username, location.password);
        }
    }
    DS.Uri = Uri;
})(DS || (DS = {}));
// ############################################################################################################################
//# sourceMappingURL=Uri.js.map