import { Comparer } from "./Comparer";
import TimeReference from "./TimeReference";

export interface ITimeReferencedObject {
    Timestamp: TimeReference;
}

export default abstract class TimeReferencedObject implements ITimeReferencedObject {
    /**
     The time at which this object was created.
    */
    readonly Timestamp: TimeReference = TimeReference.getCurrentTime();

    /**
    * Plug in this comparer function to sort in ascending order for instances of this type.
    */
    static Comparer: Comparer<TimeReferencedObject> = function (x: TimeReferencedObject, y: TimeReferencedObject) {
        if (x == null || y == null) return 1;
        return TimeReference.Comparer(x.Timestamp, y.Timestamp);
    };

    /**
     * Plug in this comparer function to sort in descending order for instances of this type.
     */
    static ReverseComparer: Comparer<TimeReferencedObject> = function (x: TimeReferencedObject, y: TimeReferencedObject) {
        if (x == null || y == null) return 1;
        return TimeReference.ReverseComparer(x.Timestamp, y.Timestamp);
    }
}
