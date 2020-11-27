"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  Represents a slice of time sequence.  This value also maintains a global sequence counter that makes sure the subsequent fast calls - where
 *  the time elapsed may be 0 - are kept in order.  No two new/updated time references should ever be equal.
*/
class TimeReference {
    /**
     *  Initializes a new time reference.
    */
    /// <param name="ticks">Set this to a '{DateTime}.Ticks' value, or leave out to use the current UTC date/time.</param>
    constructor(ticks) {
        this.Timestamp = ticks !== null && ticks !== void 0 ? ticks : Date.now();
        this.SeqenceID = TimeReference._seqenceIDCounter++;
    }
    /**
     *  Returns a new 'TimeReference' value set to the current time and next sequence count.
    */
    static getCurrentTime() { return new TimeReference(); }
    toString() {
        return this.Timestamp.toString() + this.SeqenceID.toString();
    }
    //public override int GetHashCode()
    //{
    //    return (int)(Timestamp + SeqenceID);
    //}
    equals(obj) {
        return (obj instanceof TimeReference) && obj.Timestamp == this.Timestamp && obj.SeqenceID == this.SeqenceID;
    }
}
exports.default = TimeReference;
/**
 *  A counter is used to maintain a global input sequence in case the time lapse is too short between requests.
*/
TimeReference._seqenceIDCounter = 1;
/**
 * Plug in this comparer function to sort in ascending order for instances of this type.
 */
TimeReference.Comparer = function (x, y) {
    var comp = x.Timestamp - y.Timestamp;
    if (comp < 0)
        return -1;
    else if (comp > 0)
        return 1;
    comp = x.SeqenceID - y.SeqenceID;
    return comp < 0 ? -1 : comp > 0 ? 1 : 0;
};
/**
 * Plug in this comparer function to sort in descending order for instances of this type.
 */
TimeReference.ReverseComparer = function (x, y) {
    var comp = y.Timestamp - x.Timestamp;
    if (comp < 0)
        return -1;
    else if (comp > 0)
        return 1;
    comp = y.SeqenceID - x.SeqenceID;
    return comp < 0 ? -1 : comp > 0 ? 1 : 0;
};
//# sourceMappingURL=TimeReference.js.map