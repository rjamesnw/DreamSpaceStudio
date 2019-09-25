namespace DS {
    export interface ISavedTrackableObject extends ISavedPersistableObject {
        $id: string;
        $objectType: string;
    }

    var trackedObjects: IndexedObject = {};

    /** A common base type for all objects that can be tracked by a globally unique ID. */
    export abstract class TrackableObject extends PersistableObject implements IResourceSource {

        /** Returns a tracked object, or undefined if not found. */
        static get<T = any>(id: string): T { return trackedObjects[id]; }

        [name: string]: any;

        /** A globally unique ID for this object. */
        get _id() { return this.$__id; }
        set _id(id: string) {
            id = StringUtils.toString(id).trim();
            if (!id) throw new Exception("TrackableObject: ID is not valid.");
            if (id in trackedObjects) throw new Exception(`TrackableObject: The ID ${id} already exists.`);
            if (this.$__id in trackedObjects)
                delete trackedObjects[this.$__id]; // (this is expensive, but is ok because it is only done development time; otherwise this can also be set to 'void 0' [undefined])
            this.$__id = id;
            trackedObjects[id] = this;
        }
        private $__id: string;

        /** The name of the class the instance was created from. */
        readonly _objectType = Utilities.getTypeName(this);

        constructor() {
            super();
            this._id = Utilities.createGUID(false);
            trackedObjects[this._id] = this;
        }

        getResourceValue(): Promise<any> {
        }
        getResourceType(): ResourceTypes {
        }

        /** Saves the tracking details and related items to a specified object.
        * If no object is specified, then a new empty object is created and returned.
        */
        saveToObject<T extends ISavedPersistableObject>(target?: T & ISavedTrackableObject) {
            target = super.saveToObject(target);

            target.$id = this.$__id;
            target.$objectType = this.$__type;

            return target;
        }

        /** Loads the tracking details from a given object. */
        loadFromObject(source?: ISavedTrackableObject, replace = false): this {
            if (source) {
                super.loadFromObject(source, replace);

                var _this = <Writeable<this>>this;

                _this._id = source.$id;
                _this._objectType = source.$objectType;
            }
            return this;
        }
    }

    export interface ITrackableObject extends TrackableObject { }
}