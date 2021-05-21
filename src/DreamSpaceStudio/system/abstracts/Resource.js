var DS;
(function (DS) {
    /** Maps a single resource to some URL path, such as a static 'File' object, or even a 'Project' reference - basically,
     * anything that implements 'IResourceSource', such as objects that inherit from 'TrackableObject'.
     * Projects define resources specific to them, but other projects can also reference them, creating a dependency.
     * All resources have a globally unique ID (GUID), but not all resources may have unique paths. Multiple resources can exist
     * on a single route. If so, the first one found is returned to the client; however, console/debug warnings may be given.
     */
    class Resource extends DS.TrackableObject {
        get resourceID() { return this._resourceID; }
        set resourceID(id) {
            if (!DS.isNullOrUndefined(id)) {
                var res = DS.TrackableObject.get(id);
                if (!res) // (quick test to make sure the ID is valid)
                    throw new DS.Exception(`Resource: The resource represented by ID ${id} does not exist.`);
                if (typeof res.getResourceValue != 'function') // (quick test to make sure the object is valid)
                    throw new DS.Exception(`Resource: The resource object represented by ID ${id} does not contain the 'getResourceValue()' function (see DS.IResourceSource).`);
                if (typeof res.getResourceType != 'function') // (quick test to make sure the object is valid)
                    throw new DS.Exception(`Resource: The resource object represented by ID ${id} does not contain the 'getResourceType()' function (see DS.IResourceSource).`);
            }
            this._resourceID = id;
        }
        get resource() { return DS.TrackableObject.get(this.resourceID); }
        set resource(res) { this._resource = res; } // (allows overriding)
        get type() { if (this._type)
            return this._type; var r = this.resource; return r && r.getResourceType(); }
        set type(type) { this._type = type; } // (allows overriding)
        isMatch(urlPath) {
            return false;
        }
        async getValue() { return null; }
    }
    DS.Resource = Resource;
})(DS || (DS = {}));
//# sourceMappingURL=Resource.js.map