﻿import { APIActions } from "./EntityBase";
import { PartitionedApplicationEntity } from "./PartitionedApplicationEntity";

export interface INamedEntity {
    /// <summary>
    /// A name for this entity.
    /// <para>Note: Not all entities have names, so this may return other details, such as first and last name combos, or email subjects, etc.</para>
    /// </summary>
    readonly name: string;
}

/// <summary>
/// The base type for all entities that store partitioned application instance data, and include names on the entities.
/// These are all tables that are NOT related to map tables or static lookup tables.
/// </summary>
export abstract class NamedApplicationEntity extends PartitionedApplicationEntity implements INamedEntity {
    name: string;

    validate(apiAction: APIActions): ModelStateDictionary {
        var modeState = base.Validate(apiAction);
        switch (apiAction) {
            case APIActions.Create:
                if (string.IsNullOrWhiteSpace(name))
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(name)), "A name is required when creating a new entry.");
                break;
            case APIActions.Read:
                break;
            case APIActions.Update:
                if (name != null && string.IsNullOrWhiteSpace(name))
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(name)), "Cannot update name to be empty or only whitespace.");
                break;
            case APIActions.Delete:
                break;
        }
        return modeState;
    }
}