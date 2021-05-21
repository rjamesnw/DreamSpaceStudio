/** Possible states of a model property value after validation. */
export enum ValidationState {
    /** Validation has not been performed on the ModelStateEntry. */
    Unvalidated,
    /** Validation was performed on the ModelStateEntry and was found to be invalid. */
    Invalid,
    /** Validation was performed on the ModelStateEntry. */
    Valid,
    /** Validation was skipped for the ModelStateEntry. */
    Skipped
}

/** Represents the state of a model property value after validation. */
export class ModelStateEntry {
    value: any;
    state: ValidationState;
}

/** Represents the state of model property values after validation. */
export class ModelStateDictionary {
    items: IndexedObject<ModelStateEntry> = {};
}

