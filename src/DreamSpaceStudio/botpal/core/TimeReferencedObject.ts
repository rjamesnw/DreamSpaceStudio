import { Comparer } from "./Comparer";

export interface ITimeReferencedObject {
    Timestamp: TimeReference;
}

export default abstract class TimeReferencedObject extends LockableObject implements ITimeReferencedObject {
    /**
     The time at which this object was created.
    */
     readonly Timestamp: TimeReference = TimeReference.CurrentTime;

    static Comparer: Comparer<TimeReferencedObject> = function Compare(TimeReferencedObject x, TimeReferencedObject y)  {
        if (x == null || y == null) return 1;
        return TimeReference.DefaultComparer.Compare(x.Timestamp, y.Timestamp);
    }
}

public class ReverseComparer : Comparer < TimeReferencedObject >
{
    public override int Compare(TimeReferencedObject x, TimeReferencedObject y) {
        if (x == null || y == null) return 1;
        return TimeReference.DefaultReverseComparer.Compare(x.Timestamp, y.Timestamp);
    }
}

        /// <summary>
        /// Default comparer for ascending timelines and sequences.
        /// </summary>
        public static readonly Comparer DefaultComparer = new Comparer();

        /// <summary>
        /// Default comparer for descending timelines and sequences.
        /// </summary>
        public static readonly ReverseComparer DefaultReverseComparer = new ReverseComparer();
}
