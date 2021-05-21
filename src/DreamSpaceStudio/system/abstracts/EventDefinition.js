var DS;
(function (DS) {
    /** Defines an event that can trigger a workflow. */
    class EventDefinition extends DS.TrackableObject {
        constructor() {
            super(...arguments);
            /** The parameters defined for this event.  Components are to supply arguments for this when triggering events. */
            this.parameters = [];
        }
    }
    DS.EventDefinition = EventDefinition;
})(DS || (DS = {}));
//# sourceMappingURL=EventDefinition.js.map