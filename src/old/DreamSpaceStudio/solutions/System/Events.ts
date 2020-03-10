namespace DS {
    /** Contains functions and types to manage events within the workflow system. */
    export namespace Events {
        export class EventHandler {
            /** 
             * @param event The defined event for which the associated workflow will be triggered.
             * @param workflow The workflow to start when the underlying event triggers.
             */
            constructor(public event: EventDefinition, public workflow: Workflow) {
            }
        }

        var handlers: EventHandler[] = [];

        var events: EventDefinition[] = [];

        function registerHandler(eventDef: EventDefinition, workflow: Workflow) {
            handlers.push(new EventHandler(eventDef, workflow));
        }
    }
}