namespace DS {
    // ====================================================================================================================================

    /** Represents an object that can have a parent object. */
    export abstract class DependentObject extends TrackableObject {
        get parent() { return this.__parent; }
        protected __parent: DependentObject; // (note: EvenDispatcher expects '__parent' chains also)
    }

    export interface IDependencyObject extends DependentObject { }

    // =======================================================================================================================
}