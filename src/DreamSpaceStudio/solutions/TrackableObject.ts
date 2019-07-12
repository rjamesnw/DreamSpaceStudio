import { Utilities } from "./Utilities";

/** A common base type for all object that can be tracked by a globally unique ID. */
export class TrackableObject {
    [name: string]: any;
    /** A globally unique ID for this object. */
    _uid: string;

    constructor() {
        this._uid = Utilities.createGUID(false);
    }
}

export interface ITrackableObject extends TrackableObject { }
