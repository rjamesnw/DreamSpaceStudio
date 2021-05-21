import { ModelStateDictionary } from "./ModelStateDictionary";

export enum APIActions {
    Create,
    Read,
    Update,
    Delete
}

var modelStates = new WeakMap<object, ModelStateDictionary>();

/**
 * Returns a ModelStateDictionary instance for the specified model instance, or undefined if not set.
 * Model states are set after calling 'validate()' on them.
 * @param obj
 */
export function getModelStates(obj: object): ModelStateDictionary {
    return modelStates.get(obj);
}

/**
 * Sets a ModelStateDictionary instance for the specified model instance.
 * Model states are set after calling 'validate()' on them.
 * @param obj
 */
export function setModelStates(obj: object, stateDic: ModelStateDictionary) {
    if (!stateDic)
        modelStates.delete(obj);
    else if (!(obj instanceof ModelStateDictionary))
        throw DS.Exception.invalidArgument('setModelStates()', 'stateDic', this, "'stateDic' must be an instance of ModelStateDictionary.");
    else
        modelStates.set(obj, stateDic);
}

/// <summary>
/// The base type for all entities for the underlying application.
/// </summary>
export abstract class EntityBase {
    /**
     * Returns a model state dictionary as the result of analyzing if the model is valid for the specified API action.
     * @returns A ModelStateDictionary
     * @param apiAction (Optional) The API action.
     */
    validate(apiAction: APIActions): ModelStateDictionary {
        var states = new ModelStateDictionary();
        setModelStates(this, states); // (add new/replace existing)
        return states;
    }
}
