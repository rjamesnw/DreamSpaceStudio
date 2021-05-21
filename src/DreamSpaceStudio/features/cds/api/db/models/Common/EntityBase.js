"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityBase = exports.setModelStates = exports.getModelStates = exports.APIActions = void 0;
const ModelStateDictionary_1 = require("./ModelStateDictionary");
var APIActions;
(function (APIActions) {
    APIActions[APIActions["Create"] = 0] = "Create";
    APIActions[APIActions["Read"] = 1] = "Read";
    APIActions[APIActions["Update"] = 2] = "Update";
    APIActions[APIActions["Delete"] = 3] = "Delete";
})(APIActions = exports.APIActions || (exports.APIActions = {}));
var modelStates = new WeakMap();
/**
 * Returns a ModelStateDictionary instance for the specified model instance, or undefined if not set.
 * Model states are set after calling 'validate()' on them.
 * @param obj
 */
function getModelStates(obj) {
    return modelStates.get(obj);
}
exports.getModelStates = getModelStates;
/**
 * Sets a ModelStateDictionary instance for the specified model instance.
 * Model states are set after calling 'validate()' on them.
 * @param obj
 */
function setModelStates(obj, stateDic) {
    if (!stateDic)
        modelStates.delete(obj);
    else if (!(obj instanceof ModelStateDictionary_1.ModelStateDictionary))
        throw DS.Exception.invalidArgument('setModelStates()', 'stateDic', this, "'stateDic' must be an instance of ModelStateDictionary.");
    else
        modelStates.set(obj, stateDic);
}
exports.setModelStates = setModelStates;
/// <summary>
/// The base type for all entities for the underlying application.
/// </summary>
class EntityBase {
    /**
     * Returns a model state dictionary as the result of analyzing if the model is valid for the specified API action.
     * @returns A ModelStateDictionary
     * @param apiAction (Optional) The API action.
     */
    validate(apiAction) {
        var states = new ModelStateDictionary_1.ModelStateDictionary();
        setModelStates(this, states); // (add new/replace existing)
        return states;
    }
}
exports.EntityBase = EntityBase;
//# sourceMappingURL=EntityBase.js.map