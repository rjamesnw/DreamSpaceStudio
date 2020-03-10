namespace DS {
    /** Notifies the end user of an issue within a component, such as incorrect input and output mappings. */
    export class ComponentError {
        public readonly Message: string;
        public readonly Property?: Property;
    }

    /** A component. */
    export class Component extends TrackableObject {
        script: string;
        compiledScript: string;

        /** Inputs are generated as parameters at the top of the function that wraps the script. */
        readonly inputs: Property[] = [];

        /** Outputs are */
        readonly outputs: Property[] = [];

        readonly events: EventDefinition[] = [];

        /** Returns a list of one or more issues within a component, such as incorrect input and output mappings.
         * 'Validate()' is usually called when the user has performed an operation when working with the components
         * and related objects.
         * @param errorList An array to store all the errors.  When empty, a new array is created and past onto other validate functions.
         */
        validate(errorList?: ComponentError[]): ComponentError[] {
            return errorList;
        }

        async execute() { if (!this.validate()) throw "Please correct the errors first."; }
    }
}