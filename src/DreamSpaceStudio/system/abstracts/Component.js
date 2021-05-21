var DS;
(function (DS) {
    /** Notifies the end user of an issue within a component, such as incorrect input and output mappings. */
    class ComponentError {
    }
    DS.ComponentError = ComponentError;
    /** A component. */
    class Component extends DS.TrackableObject {
        constructor() {
            super(...arguments);
            /** Inputs are generated as parameters at the top of the function that wraps the script. */
            this.inputs = [];
            /** Outputs are */
            this.outputs = [];
            this.events = [];
        }
        /** Returns a list of one or more issues within a component, such as incorrect input and output mappings.
         * 'Validate()' is usually called when the user has performed an operation when working with the components
         * and related objects.
         * @param errorList An array to store all the errors.  When empty, a new array is created and past onto other validate functions.
         */
        validate(errorList) {
            return errorList;
        }
        async execute() { if (!this.validate())
            throw "Please correct the errors first."; }
    }
    DS.Component = Component;
})(DS || (DS = {}));
//# sourceMappingURL=Component.js.map