import { APIActions, EntityBase } from "./EntityBase";
import { ModelStateDictionary } from "./ModelStateDictionary";

/// <summary>
/// The base type for all entities that track which user created them.
/// </summary>
export abstract class EntityCreatedBase extends EntityBase {
    /// <summary>
    /// When this record entry was created.
    /// </summary>
    @readOnly(true)
    readonly created: Date;
    /// <summary>
    /// When this record entry was updated.
    /// </summary>
    @readOnly(true)
    readonly updated: Date;
    /// <summary>
    /// If set then this record entry will be considered deleted once the set date and time passes.
    /// Users can use the table controls to show deleted items.
    /// <para>Deleted items are cleared out after 30 days.</para>
    /// </summary>
    deleted?: Date;
    /// <summary>
    /// If set then this record entry will be considered archived once the set date and time passes.
    /// Users can use the table controls to show archived items.
    /// <para>Archived items are NEVER deleted automatically; however, they can still be deleted while also being in an archived state.
    /// If an archived item is deleted, it retains its archived date and time.  If undeleted it simply reverts back to being archived.</para>
    /// </summary>
    archived?: Date;

    validate(apiAction: APIActions): ModelStateDictionary {
        return super.validate(apiAction);
    }
}
