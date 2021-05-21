import { AppPartition } from "../AppPartition";
import { ApplicationEntity } from "./ApplicationEntity"
import { column, navigation } from "./DbSet";

/// <summary>
/// The base type for all entities that are partitioned within the application, effectively creating VIRTUAL application database "instances".
/// </summary>
export abstract class PartitionedApplicationEntity extends ApplicationEntity {
    @required
    @foreignKey(nameof(AppPartition))
    @readOnly(true)
    @column()
    app_partitions_id: number;

    @navigation(<IType<PartitionedApplicationEntity>>PartitionedApplicationEntity, "app_partitions_id", AppPartition)
    get AppPartition(): AppPartition { return null; };

    validate(apiAction: APIActions): ModelStateDictionary {
        var modeState = base.Validate(apiAction);
        switch (apiAction) {
            case APIActions.Create:
                if (app_partitions_id <= 0)
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(app_partitions_id)), "The app partition ID must be 0 when creating a new entry.");
                break;
            case APIActions.Read:
                if (app_partitions_id <= 0)
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(app_partitions_id)), "The app partition ID must be specified when looking up existing entries.");
                break;
            case APIActions.Update:
                if (app_partitions_id <= 0)
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(app_partitions_id)), "The app partition ID must be specified when updating existing entries.");
                break;
            case APIActions.Delete:
                if (ID <= 0)
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(app_partitions_id)), "An ID is required to delete existing entries.");
                break;
        }
        return modeState;
    }
}
