var DS;
(function (DS) {
    /** Contains functions and types to manage events within the workflow system. */
    let Events;
    (function (Events) {
        class EventHandler {
            /**
             * @param event The defined event for which the associated workflow will be triggered.
             * @param workflow The workflow to start when the underlying event triggers.
             */
            constructor(event, workflow) {
                this.event = event;
                this.workflow = workflow;
            }
        }
        Events.EventHandler = EventHandler;
        var handlers = [];
        var events = [];
        function registerHandler(eventDef, workflow) {
            handlers.push(new EventHandler(eventDef, workflow));
        }
    })(Events = DS.Events || (DS.Events = {}));
})(DS || (DS = {}));
//# sourceMappingURL=Events.js.map