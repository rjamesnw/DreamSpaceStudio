import { IEquality, Comparer } from "./Comparer";
import { bool } from "aws-sdk/clients/signer";

/// <summary>
/// Represents a slice of time sequence.  This value also maintains a global sequence counter that makes sure the subsequent fast calls - where
/// the time elapsed may be 0 - are kept in order.  No two new/updated time references should ever be equal.
/// </summary>
export default class TimeReference implements IEquality {
    /// <summary>
    /// Returns a new 'TimeReference' value set to the current time and next sequence count.
    /// </summary>
    static getCurrentTime(): TimeReference { return new TimeReference(); }

    /// <summary>
    /// A counter is used to maintain a global input sequence in case the time lapse is too short between requests.
    /// </summary>
    static readonly _seqenceIDCounter = 1;

    /// <summary>
    /// Each neuron carries a time stamp (sense of time) for its relation to each other, and to tell how "old" it is.
    /// This can help with sorting through them in effort to quickly pull information more pertinent to the current time, then working backwards.
    /// </summary>
    public readonly Timestamp: number;

    /// <summary>
    /// In relation to the time stamp, each neuron also stores a sequence ID in effort to make sure the right storage order is kept.
    /// This is required when a "burst" of information, such as a text string, is supplied, where any sense of time is not available.
    /// </summary>
    public readonly SeqenceID: number;

    /// <summary>
    /// Initializes a new time reference.
    /// </summary>
    /// <param name="ticks">Set this to a '{DateTime}.Ticks' value, or leave out to use the current UTC date/time.</param>
    constructor(ticks?: number) {
        this.Timestamp = ticks ?? Date.now();
        this.SeqenceID = (<Writeable<typeof TimeReference>><any>TimeReference)._seqenceIDCounter++;
    }

    toString(): string {
        return this.Timestamp.toString() + this.SeqenceID.toString();
    }

    //public override int GetHashCode()
    //{
    //    return (int)(Timestamp + SeqenceID);
    //}

    equals(obj: object): boolean {
        return (obj instanceof TimeReference) && (<TimeReference>obj).Timestamp == this.Timestamp && (<TimeReference>obj).SeqenceID == this.SeqenceID;
    }

    /**
     * Plug in this comparer function to sort in ascending order for instances of this type.
     */
    static Comparer: Comparer<TimeReference> = function (x: TimeReference, y: TimeReference) {
        var comp = x.Timestamp - y.Timestamp;
        if (comp < 0) return -1; else if (comp > 0) return 1;
        comp = x.SeqenceID - y.SeqenceID;
        return comp < 0 ? -1 : comp > 0 ? 1 : 0;
    };

    /**
     * Plug in this comparer function to sort in descending order for instances of this type.
     */
    static ReverseComparer: Comparer<TimeReference> = function (x: TimeReference, y: TimeReference) {
        var comp = y.Timestamp - x.Timestamp;
        if (comp < 0) return -1; else if (comp > 0) return 1;
        comp = y.SeqenceID - x.SeqenceID;
        return comp < 0 ? -1 : comp > 0 ? 1 : 0;
    }
}
