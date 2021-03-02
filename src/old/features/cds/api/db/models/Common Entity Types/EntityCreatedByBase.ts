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
    /// The base type for all entities that track which user created them.
    /// </summary>
    public abstract partial class EntityCreatedByBase : EnabledEntityBase
    {
        /// <summary>
        /// The ID of the user who created this record entry.
        /// </summary>
        [Required]
        [ForeignKey(nameof(CreatedBy))]
        [ReadOnly(true)]
        [Column("users_id")]
        public int UsersID { get; set; }
        /// <summary>
        /// The user that created this record entry.
        /// </summary>
        public virtual User CreatedBy { get; set; }

        public override ModelStateDictionary Validate(APIActions apiAction)
        {
            var modeState = base.Validate(apiAction);
            switch (apiAction)
            {
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
}
