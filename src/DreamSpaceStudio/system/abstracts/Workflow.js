var DS;
(function (DS) {
    class ValueMap {
    }
    DS.ValueMap = ValueMap;
    /** Defines a branch by name, which determines the next step to execute. */
    class Branch extends DS.TrackableObject {
    }
    DS.Branch = Branch;
    /** References a component and defines translations between previous step's outputs and the next step. */
    class Step extends DS.TrackableObject {
        constructor() {
            super(...arguments);
            /** Maps the outputs of the previous step component's outputs to the inputs of the current component. */
            this.inputMapping = [];
            /** Defines named branches. */
            this.branches = [];
        }
    }
    DS.Step = Step;
    /** A series of steps that will execute associated components in order. */
    class Workflow extends DS.TrackableObject {
        constructor() {
            super(...arguments);
            this.steps = [];
        }
        async execute() { }
    }
    DS.Workflow = Workflow;
    /** One or more "swim-lanes", from top to bottom (in order of sequence), that contain a series of components to execute. */
    class Workflows extends DS.TrackableObject {
        constructor() {
            super(...arguments);
            this.workflows = [];
        }
    }
    DS.Workflows = Workflows;
})(DS || (DS = {}));
//# sourceMappingURL=Workflow.js.map