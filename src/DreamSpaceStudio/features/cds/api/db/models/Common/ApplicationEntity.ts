import { DbContext } from "./DbContext";
import { column } from "./DbSet";
import { APIActions } from "./EntityBase";
import { EntityCreatedByBase } from "./EntityCreatedByBase";
import { ModelStateDictionary } from "./ModelStateDictionary";

/// <summary>
/// The base type for all entities that store partitioned application instance data.
/// These are all tables that are NOT related to map tables or static lookup tables.
/// </summary>
export abstract class ApplicationEntity extends EntityCreatedByBase implements ISinglePrimaryKeyEntity {
    @required()
    @key()
    @readOnly(true)
    @column("id")
    id: number;

    /// <summary>
    ///     Returns true if this instance has no key or a new key assigned.  This helps the reconciliation process if an insert
    ///     fails and new keys are needed.
    /// </summary>
    /// <param name="db"> A database context to use to check this instance against. </param>
    /// <returns> True if new, false if not. </returns>
    isNew(db: DbContext): boolean { return id == 0 || db.Entry(this).Property("ID").IsModified; }

    Validate(apiAction: APIActions): ModelStateDictionary {
        var modeState = super.validate(apiAction);
        switch (apiAction) {
            case APIActions.Create:
                if (this.id != 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "The ID must be 0 when creating a new entry.");
                break;
            case APIActions.Read:
                if (this.id <= 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "The ID must be > 0 when looking up existing entries.");
                break;
            case APIActions.Update:
                if (this.id <= 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "An ID is required when updating existing entries.");
                break;
            case APIActions.Delete:
                if (this.id <= 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "An ID is required to delete existing entries.");
                break;
        }
        return modeState;
    }
}

export interface ISinglePrimaryKeyEntity {
    readonly id: number;
}
