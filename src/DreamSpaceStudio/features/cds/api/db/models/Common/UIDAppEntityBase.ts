using CDS.Entities;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    /// <summary>
    /// The base type for all entities that store partitioned application instance data.
    /// These are all tables that are NOT related to map tables or static lookup tables.
    /// </summary>
    /// <seealso cref="T:CDS.Entities.EntityCreatedByBase"/>
    public partial class UIDAppEntityBase : EntityCreatedByBase, ISinglePrimaryKeyEntity<ulong>
    {
        [Key]
        [Column("id")]
        public ulong ID { get; protected set; }

        public override ModelStateDictionary Validate(APIActions apiAction)
        {
            var modeState = base.Validate(apiAction);
            switch (apiAction)
            {
                case APIActions.Create:
                    if (ID != 0)
                        modeState.AddModelError(nameof(id), "The ID must be 0 when creating a new entry.");
                    break;
                case APIActions.Read:
                    if (ID <= 0)
                        modeState.AddModelError(nameof(id), "The ID must be > 0 when looking up existing entries.");
                    break;
                case APIActions.Update:
                    if (ID <= 0)
                        modeState.AddModelError(nameof(id), "An ID is required when updating existing entries.");
                    break;
                case APIActions.Delete:
                    if (ID <= 0)
                        modeState.AddModelError(nameof(id), "An ID is required to delete existing entries.");
                    break;
            }
            return modeState;
        }
    }
}
