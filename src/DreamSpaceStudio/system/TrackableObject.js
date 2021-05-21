var DS;
(function (DS) {
    var trackedObjects = {};
    /** A common base type for all objects that can be tracked by a globally unique ID. */
    class TrackableObject extends DS.PersistableObject {
        constructor() {
            super();
            /** The name of the class the instance was created from. */
            this._objectType = DS.Utilities.getTypeName(this);
            this._id = DS.Utilities.createGUID(false);
            trackedObjects[this._id] = this;
        }
        /** Returns a tracked object, or undefined if not found. */
        static get(id) { return trackedObjects[id]; }
        /** A globally unique ID for this object. */
        get _id() { return this.$__id; }
        set _id(id) {
            id = DS.StringUtils.toString(id).trim();
            if (!id)
                throw new DS.Exception("TrackableObject: ID is not valid.");
            if (id in trackedObjects)
                throw new DS.Exception(`TrackableObject: The ID ${id} already exists.`);
            if (this.$__id in trackedObjects)
                delete trackedObjects[this.$__id]; // (this is expensive, but is ok because it is only done development time; otherwise this can also be set to 'void 0' [undefined])
            this.$__id = id;
            trackedObjects[id] = this;
        }
        getResourceValue() {
            return Promise.resolve();
        }
        getResourceType() {
            return;
        }
        /** Saves the tracking details and related items to a specified object.
        * If no object is specified, then a new empty object is created and returned.
        */
        saveConfigToObject(target) {
            target = super.saveConfigToObject(target);
            target.$id = this.$__id;
            target.$objectType = this.$__type;
            return target;
        }
        /** Loads the tracking details from a given object. */
        loadConfigFromObject(source, replace = false) {
            if (source) {
                super.loadConfigFromObject(source, replace);
                var _this = this;
                _this._id = source.$id;
                _this._objectType = source.$objectType;
            }
            return this;
        }
    }
    DS.TrackableObject = TrackableObject;
})(DS || (DS = {}));
//# sourceMappingURL=TrackableObject.js.map