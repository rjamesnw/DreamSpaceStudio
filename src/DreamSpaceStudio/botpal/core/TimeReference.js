"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <summary>
/// Represents a slice of time sequence.  This value also maintains a global sequence counter that makes sure the subsequent fast calls - where
/// the time elapsed may be 0 - are kept in order.  No two new/updated time references should ever be equal.
/// </summary>
class TimeReference {
}
exports.default = TimeReference;
{
    get;
    {
        return new TimeReference();
    }
}
/// <summary>
/// A counter is used to maintain a global input sequence in case the time lapse is too short between requests.
/// </summary>
internal;
Int64;
_SeqenceIDCounter = 1;
Int64;
Timestamp;
Int64;
SeqenceID;
TimeReference(long ? ticks = null : );
{
    Timestamp = ticks !== null && ticks !== void 0 ? ticks : DateTime.UtcNow.Ticks;
    SeqenceID = _SeqenceIDCounter++;
}
override;
string;
ToString();
{
    return Timestamp.ToString() + SeqenceID.ToString();
}
override;
int;
GetHashCode();
{
    return (int)(Timestamp + SeqenceID);
}
override;
bool;
Equals(object, obj);
{
    return (obj);
    is;
    TimeReference;
     && ((TimeReference));
    obj;
    Timestamp == Timestamp && ((TimeReference));
    obj;
    SeqenceID == SeqenceID;
}
class Comparer {
}
Comparer < TimeReference >
    {
        override, int, Compare(TimeReference, x, TimeReference, y) {
            Int64;
            comp = x.Timestamp - y.Timestamp;
            if (comp < 0)
                return -1;
            else if (comp > 0)
                return 1;
            comp = x.SeqenceID - y.SeqenceID;
            return comp < 0 ? -1 : comp > 0 ? 1 : 0;
        }
    };
Comparer;
DefaultComparer = new Comparer();
class ReverseComparer {
}
Comparer < TimeReference >
    {
        override, int, Compare(TimeReference, x, TimeReference, y) {
            Int64;
            comp = y.Timestamp - x.Timestamp;
            if (comp < 0)
                return -1;
            else if (comp > 0)
                return 1;
            comp = y.SeqenceID - x.SeqenceID;
            return comp < 0 ? -1 : comp > 0 ? 1 : 0;
        }
    };
ReverseComparer;
DefaultReverseComparer = new ReverseComparer();
//# sourceMappingURL=TimeReference.js.map