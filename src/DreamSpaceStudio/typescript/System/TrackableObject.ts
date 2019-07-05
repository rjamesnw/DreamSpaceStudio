import { Utilities } from "./Utilities";

/** A common base type for all object that can be tracked by a globally unique ID. */
export class TrackableObject {
    /** A globally unique ID for this object. */
    uid: string;

    constructor() {
        this.uid = Utilities.createGUID(false);
    }
}
