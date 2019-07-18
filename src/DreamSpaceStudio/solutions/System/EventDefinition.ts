namespace DS {
    /** Defines an event that can trigger a workflow. */
    export class EventDefinition extends TrackableObject {
        /** The name of this event. */
        name: string;
        /** The parameters defined for this event.  Components are to supply arguments for this when triggering events. */
        readonly parameters: Property[] = [];
    }
}