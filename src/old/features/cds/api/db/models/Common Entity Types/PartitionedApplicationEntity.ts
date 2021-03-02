using CoreXT.Entities;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    /// <summary>
    /// The base type for all entities that are partitioned within the application, effectively creating VIRTUAL application database "instances".
    /// </summary>
    public abstract partial class PartitionedApplicationEntity : ApplicationEntity
    {
        [Required]
        [ForeignKey(nameof(AppPartition))]
        [ReadOnly(true)]
        public int app_partitions_id { get; set; }
        public virtual AppPartition AppPartition { get; set; }

        public override ModelStateDictionary Validate(APIActions apiAction)
        {
            var modeState = base.Validate(apiAction);
            switch (apiAction)
            {
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
}
