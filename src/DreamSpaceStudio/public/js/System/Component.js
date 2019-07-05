define(["require", "exports", "./TrackableObject"], function (require, exports, TrackableObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** A component. */
    class Component extends TrackableObject_1.TrackableObject {
        constructor() {
            super(...arguments);
            /** Inputs are generated as parameters at the top of the function that wraps the script. */
            this.inputs = [];
            /** Outputs are */
            this.outputs = [];
            this.events = [];
        }
        execute() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
    }
    exports.Component = Component;
});
//# sourceMappingURL=Component.js.map