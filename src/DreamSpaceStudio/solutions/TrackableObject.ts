namespace DS {
    export interface ISavedTrackableObject {
        $id: string;
        $type: string;
    }

    var trackedObjects: IndexedObject = {};

    /** A common base type for all object that can be tracked by a globally unique ID. */
    export class TrackableObject {

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

        readonly _type = getTypeName(this);

        constructor() {
            this._id = Utilities.createGUID(false);
            trackedObjects[this._id] = this;
        }

        /** Saves the project and related items to a specified object. 
        * If no object is specified, then a new empty object is created and returned.
        */
        save(target?: ISavedTrackableObject): ISavedTrackableObject {
            target = target || <ISavedTrackableObject>{};

            target.$id = this.$__id;
            target.$type = this.$__type;

            return target;
        }

        /** Loads tracking details from a given object. */
        load(target?: ISavedTrackableObject): this {
            if (target) {
                var _this = <Writeable<this>>this;

                _this.$__name = target.$id;
                _this.$__type = target.$type;
            }
            return this;
        }
    }

    export interface ITrackableObject extends TrackableObject { }
}