define(["require", "exports", "./TrackableObject"], function (require, exports, TrackableObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ====================================================================================================================================
    /** Represents an object that can have a parent object. */
    class DependentObject extends TrackableObject_1.TrackableObject {
        get parent() { return this.__parent; }
    }
    exports.DependentObject = DependentObject;
});
// =======================================================================================================================
//# sourceMappingURL=DependentObject.js.map