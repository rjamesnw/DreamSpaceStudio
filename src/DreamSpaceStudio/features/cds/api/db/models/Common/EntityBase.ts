export enum APIActions {
    Create,
    Read,
    Update,
    Delete
}

/// <summary>
/// The base type for all entities for the underlying application.
/// </summary>
export abstract class EntityBase {
    /// <summary>
    ///     Returns a model state dictionary as the result of analyzing if the model is valid for the specified API action.
    /// </summary>
    /// <param name="apiAction"> (Optional) The API action. </param>
    /// <returns> A ModelStateDictionary. </returns>
    validate(apiAction: APIActions): ModelStateDictionary { return new ModelStateDictionary(); }
}