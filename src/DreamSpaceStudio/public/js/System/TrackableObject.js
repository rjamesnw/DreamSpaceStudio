define(["require", "exports", "./Utilities"], function (require, exports, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** A common base type for all object that can be tracked by a globally unique ID. */
    class TrackableObject {
        constructor() {
            this._uid = Utilities_1.Utilities.createGUID(false);
        }
    }
    exports.TrackableObject = TrackableObject;
});
//# sourceMappingURL=TrackableObject.js.map