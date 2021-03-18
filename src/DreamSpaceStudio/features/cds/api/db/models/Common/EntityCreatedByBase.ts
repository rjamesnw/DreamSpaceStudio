import { EnabledEntityBase } from "./EnabledEntityBase";

/// <summary>
/// The base type for all entities that track which user created them.
/// </summary>
export abstract class EntityCreatedByBase extends EnabledEntityBase {
    /// <summary>
    /// The ID of the user who created this record entry.
    /// </summary>
    [Required]
    [ForeignKey(nameof(CreatedBy))]
    [ReadOnly(true)]
    [Column("users_id")]
    users_id: number;

    /// <summary>
    /// The user that created this record entry.
    /// </summary>
    get createdBy(): User;

    validate(apiAction: APIActions): ModelStateDictionary {
        var modeState = base.Validate(apiAction);
        switch (apiAction) {
            case APIActions.Create:
                if (!(UsersID > 0))
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(UsersID)), "A first name is required.");
                break;
            case APIActions.Read:
            case APIActions.Update:
            case APIActions.Delete:
                break;
        }
        return modeState;
    }
}