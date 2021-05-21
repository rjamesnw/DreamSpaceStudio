import { User } from "../User";
import { EnabledEntityBase } from "./EnabledEntityBase";
import { APIActions } from "./EntityBase";
import { ModelStateDictionary } from "./ModelStateDictionary";

/// <summary>
/// The base type for all entities that track which user created them.
/// </summary>
export abstract class EntityCreatedByBase extends EnabledEntityBase {
    /// <summary>
    /// The ID of the user who created this record entry.
    /// </summary>
    @required()
    @foreignKey(nameof(CreatedBy))
    @readOnly(true)
    @column("users_id")
    users_id: number;

    /// <summary>
    /// The user that created this record entry.
    /// </summary>
    get createdBy(): User { return null; }

    validate(apiAction: APIActions): ModelStateDictionary {
        var modeState = super.validate(apiAction);
        switch (apiAction) {
            case APIActions.Create:
                if (!(this.users_id > 0))
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