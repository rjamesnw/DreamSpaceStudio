define(["require", "exports", "./TrackableObject"], function (require, exports, TrackableObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ValueMap {
    }
    exports.ValueMap = ValueMap;
    /** Defines a branch by name, which determines the next step to execute. */
    class Branch extends TrackableObject_1.TrackableObject {
    }
    exports.Branch = Branch;
    /** References a component and defines translations between previous step's outputs and the next step. */
    class Step extends TrackableObject_1.TrackableObject {
        constructor() {
            super(...arguments);
            /** Maps the outputs of the previous step component's outputs to the inputs of the current component. */
            this.inputMapping = [];
            /** Defines named branches. */
            this.branches = [];
        }
    }
    exports.Step = Step;
    /** A series of steps that will execute associated components in order. */
    class Workflow extends TrackableObject_1.TrackableObject {
        constructor() {
            super(...arguments);
            this.steps = [];
        }
        execute() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
    }
    exports.Workflow = Workflow;
    /** One or more "swim-lanes", from top to bottom (in order of sequence), that contain a series of components to execute. */
    class Workflows extends TrackableObject_1.TrackableObject {
        constructor() {
            super(...arguments);
            this.workflows = [];
        }
    }
    exports.Workflows = Workflows;
});
//# sourceMappingURL=Workflow.js.map