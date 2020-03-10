import { TrackableObject } from "./TrackableObject";
import { Property } from "./Property";

/** Defines an event that can trigger a workflow. */
export class EventDefinition extends TrackableObject {
    name: string;
    /** The parameters defined for this event.  Components are to supply arguments for this when triggering events. */
    readonly parameters: Property[] = [];
}
