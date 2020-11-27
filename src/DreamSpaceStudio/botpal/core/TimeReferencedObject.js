"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TimeReference_1 = require("./TimeReference");
class TimeReferencedObject {
    constructor() {
        /**
         The time at which this object was created.
        */
        this.Timestamp = TimeReference_1.default.getCurrentTime();
    }
}
exports.default = TimeReferencedObject;
/**
* Plug in this comparer function to sort in ascending order for instances of this type.
*/
TimeReferencedObject.Comparer = function (x, y) {
    if (x == null || y == null)
        return 1;
    return TimeReference_1.default.Comparer(x.Timestamp, y.Timestamp);
};
/**
 * Plug in this comparer function to sort in descending order for instances of this type.
 */
TimeReferencedObject.ReverseComparer = function (x, y) {
    if (x == null || y == null)
        return 1;
    return TimeReference_1.default.ReverseComparer(x.Timestamp, y.Timestamp);
};
//# sourceMappingURL=TimeReferencedObject.js.map