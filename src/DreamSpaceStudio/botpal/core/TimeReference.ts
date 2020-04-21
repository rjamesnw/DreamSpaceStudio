
/// <summary>
/// Represents a slice of time sequence.  This value also maintains a global sequence counter that makes sure the subsequent fast calls - where
/// the time elapsed may be 0 - are kept in order.  No two new/updated time references should ever be equal.
/// </summary>
export default class TimeReference {
    /// <summary>
    /// Returns a new 'TimeReference' value set to the current time and next sequence count.
    /// </summary>
    public static TimeReference CurrentTime { get { return new TimeReference(); } }

/// <summary>
/// A counter is used to maintain a global input sequence in case the time lapse is too short between requests.
/// </summary>
internal static Int64 _SeqenceIDCounter = 1;

        /// <summary>
        /// Each neuron carries a time stamp (sense of time) for its relation to each other, and to tell how "old" it is.
        /// This can help with sorting through them in effort to quickly pull information more pertinent to the current time, then working backwards.
        /// </summary>
        public readonly Int64 Timestamp;

        /// <summary>
        /// In relation to the time stamp, each neuron also stores a sequence ID in effort to make sure the right storage order is kept.
        /// This is required when a "burst" of information, such as a text string, is supplied, where any sense of time is not available.
        /// </summary>
        public readonly Int64 SeqenceID;

        /// <summary>
        /// Initializes a new time reference.
        /// </summary>
        /// <param name="ticks">Set this to a '{DateTime}.Ticks' value, or leave out to use the current UTC date/time.</param>
        public TimeReference(long ? ticks = null)
{
    Timestamp = ticks ?? DateTime.UtcNow.Ticks;
    SeqenceID = _SeqenceIDCounter++;
}

        public override string ToString()
{
    return Timestamp.ToString() + SeqenceID.ToString();
}

        public override int GetHashCode()
{
    return (int)(Timestamp + SeqenceID);
}

        public override bool Equals(object obj)
{
    return (obj is TimeReference) && ((TimeReference)obj).Timestamp == Timestamp && ((TimeReference)obj).SeqenceID == SeqenceID;
}

public class Comparer : Comparer < TimeReference >
{
    public override int Compare(TimeReference x, TimeReference y) {
        Int64 comp = x.Timestamp - y.Timestamp;
        if (comp < 0) return -1; else if (comp > 0) return 1;
        comp = x.SeqenceID - y.SeqenceID;
        return comp < 0 ? -1 : comp > 0 ? 1 : 0;
    }
}
        public static readonly Comparer DefaultComparer = new Comparer();

public class ReverseComparer : Comparer < TimeReference >
{
    public override int Compare(TimeReference x, TimeReference y) {
        Int64 comp = y.Timestamp - x.Timestamp;
        if (comp < 0) return -1; else if (comp > 0) return 1;
        comp = y.SeqenceID - x.SeqenceID;
        return comp < 0 ? -1 : comp > 0 ? 1 : 0;
    }
}
        public static readonly ReverseComparer DefaultReverseComparer = new ReverseComparer();
    }
