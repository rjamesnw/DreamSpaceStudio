namespace DS {
    /** A component. */
    export class Component extends TrackableObject {
        script: string;
        compiledScript: string;

        /** Inputs are generated as parameters at the top of the function that wraps the script. */
        readonly inputs: Property[] = [];

        /** Outputs are */
        readonly outputs: Property[] = [];

        readonly events: EventDefinition[] = [];

        async execute() { }
    }
}