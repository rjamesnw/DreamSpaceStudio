"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStateDictionary = exports.ModelStateEntry = exports.ValidationState = void 0;
/** Possible states of a model property value after validation. */
var ValidationState;
(function (ValidationState) {
    /** Validation has not been performed on the ModelStateEntry. */
    ValidationState[ValidationState["Unvalidated"] = 0] = "Unvalidated";
    /** Validation was performed on the ModelStateEntry and was found to be invalid. */
    ValidationState[ValidationState["Invalid"] = 1] = "Invalid";
    /** Validation was performed on the ModelStateEntry. */
    ValidationState[ValidationState["Valid"] = 2] = "Valid";
    /** Validation was skipped for the ModelStateEntry. */
    ValidationState[ValidationState["Skipped"] = 3] = "Skipped";
})(ValidationState = exports.ValidationState || (exports.ValidationState = {}));
/** Represents the state of a model property value after validation. */
class ModelStateEntry {
}
exports.ModelStateEntry = ModelStateEntry;
/** Represents the state of model property values after validation. */
class ModelStateDictionary {
    constructor() {
        this.items = {};
    }
}
exports.ModelStateDictionary = ModelStateDictionary;
//# sourceMappingURL=ModelStateDictionary.js.map