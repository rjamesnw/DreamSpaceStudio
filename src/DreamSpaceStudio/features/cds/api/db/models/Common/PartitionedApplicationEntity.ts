import { ApplicationEntity } from "./ApplicationEntity"


/// <summary>
/// The base type for all entities that are partitioned within the application, effectively creating VIRTUAL application database "instances".
/// </summary>
export abstract class PartitionedApplicationEntity extends ApplicationEntity {
    [Required]
    [ForeignKey(nameof(AppPartition))]
    [ReadOnly(true)]
    app_partitions_id: number;

    get AppPartition(): AppPartition;

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
