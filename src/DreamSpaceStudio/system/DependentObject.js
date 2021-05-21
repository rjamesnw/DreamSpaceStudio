var DS;
(function (DS) {
    // ====================================================================================================================================
    /** Represents an object that can have a parent object. */
    class DependentObject extends DS.TrackableObject {
        get parent() { return this.__parent; }
    }
    DS.DependentObject = DependentObject;
    // =======================================================================================================================
})(DS || (DS = {}));
//# sourceMappingURL=DependentObject.js.map