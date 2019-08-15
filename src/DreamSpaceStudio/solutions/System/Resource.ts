namespace DS {

    /** Implemented by objects that can be assigned to a resource entry.  This allows such objects to support being added as a resource. */
    export interface IResourceSource extends Pick<TrackableObject, '_id' | '_type'> {
        /** Returns the underlying value for a resource supported object. */
        getResourceValue(): Promise<any>;
        getResourceType(): ResourceTypes;
    }

    /** A single resource that exists on some URL path. 
     * Projects define resources specific to that project, but other projects can also reference them, creating a dependency.
     * All resources have a globally unique ID (GUID), but not all resources may have unique paths. Multiple resources can exist
     * on a single route. If so, the first one found is returned to the client; however, console/debug warnings may be given.
     */
    export class Resource extends TrackableObject {

        path: string;

        get resourceID() { return this._resourceID; }
        set resourceID(id: string) {
            if (!isNullOrUndefined(id)) {
                var res = TrackableObject.get(id);
                if (!res) // (quick test to make sure the ID is valid)
                    throw new DS.Exception(`Resource: The resource represented by ID ${id} does not exist.`);
                if (typeof res.getResourceValue != 'function') // (quick test to make sure the object is valid)
                    throw new DS.Exception(`Resource: The resource object represented by ID ${id} does not contain the 'getResourceValue()' function (see DS.IResourceSource).`);
                if (typeof res.getResourceType != 'function') // (quick test to make sure the object is valid)
                    throw new DS.Exception(`Resource: The resource object represented by ID ${id} does not contain the 'getResourceType()' function (see DS.IResourceSource).`);
            }
            this._resourceID = id;
        }
        private _resourceID: string;

        get resource(): IResourceSource { return TrackableObject.get(this.resourceID); }
        set resource(res: IResourceSource) { this._resource = res; } // (allows overriding)
        private _resource: IResourceSource;

        get type(): ResourceTypes { if (this._type) return this._type; var r = this.resource; return r && r.getResourceType(); }
        set type(type: ResourceTypes) { this._type = type; } // (allows overriding)
        private _type: ResourceTypes;

        isMatch(urlPath: string) {
            return false;
        }

        async getValue(): Promise<any> { return null; }
    }
}