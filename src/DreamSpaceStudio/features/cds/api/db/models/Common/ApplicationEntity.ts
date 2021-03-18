import { EntityCreatedByBase } from "./EntityCreatedByBase";

/// <summary>
/// The base type for all entities that store partitioned application instance data.
/// These are all tables that are NOT related to map tables or static lookup tables.
/// </summary>
export abstract class ApplicationEntity extends EntityCreatedByBase implements ISinglePrimaryKeyEntity {
    @Required
    @Key
    @ReadOnly(true)
    @Column("id")
    ID: number;

    /// <summary>
    ///     Returns true if this instance has no key or a new key assigned.  This helps the reconciliation process if an insert
    ///     fails and new keys are needed.
    /// </summary>
    /// <param name="db"> A database context to use to check this instance against. </param>
    /// <returns> True if new, false if not. </returns>
    isNew(db: DbContext): boolean { return ID == 0 || db.Entry(this).Property("ID").IsModified; }

    Validate(apiAction: APIActions): ModelStateDictionary {
        var modeState = base.Validate(apiAction);
        switch (apiAction) {
            case APIActions.Create:
                if (ID != 0)
                    modeState.AddModelError(nameof(ID), "The ID must be 0 when creating a new entry.");
                break;
            case APIActions.Read:
                if (ID <= 0)
                    modeState.AddModelError(nameof(ID), "The ID must be > 0 when looking up existing entries.");
                break;
            case APIActions.Update:
                if (ID <= 0)
                    modeState.AddModelError(nameof(ID), "An ID is required when updating existing entries.");
                break;
            case APIActions.Delete:
                if (ID <= 0)
                    modeState.AddModelError(nameof(ID), "An ID is required to delete existing entries.");
                break;
        }
        return modeState;
    }
}

export interface ISinglePrimaryKeyEntity {
    readonly id: number;
}
