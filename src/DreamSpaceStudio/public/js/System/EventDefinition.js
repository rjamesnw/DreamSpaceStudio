define(["require", "exports", "./TrackableObject"], function (require, exports, TrackableObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Defines an event that can trigger a workflow. */
    class EventDefinition extends TrackableObject_1.TrackableObject {
        constructor() {
            super(...arguments);
            /** The parameters defined for this event.  Components are to supply arguments for this when triggering events. */
            this.parameters = [];
        }
    }
    exports.EventDefinition = EventDefinition;
});
//# sourceMappingURL=EventDefinition.js.map