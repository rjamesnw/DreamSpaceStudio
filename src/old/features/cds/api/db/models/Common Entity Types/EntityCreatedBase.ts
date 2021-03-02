using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CDS.Entities
{
    /// <summary>
    /// The base type for all entities that track which user created them.
    /// </summary>
    public abstract partial class EntityCreatedBase : EntityBase
    {
        /// <summary>
        /// When this record entry was created.
        /// </summary>
        [ReadOnly(true)]
        [Column("created")]
        public DateTimeOffset Created { get; protected set; }
        /// <summary>
        /// When this record entry was updated.
        /// </summary>
        [ReadOnly(true)]
        [Column("updated")]
        public DateTimeOffset Updated { get; protected set; }
        /// <summary>
        /// If set then this record entry will be considered deleted once the set date and time passes.
        /// Users can use the table controls to show deleted items.
        /// <para>Deleted items are cleared out after 30 days.</para>
        /// </summary>
        [Column("deleted")]
        internal DateTimeOffset? _Deleted { get; set; }
        /// <summary>
        /// If set then this record entry will be considered archived once the set date and time passes.
        /// Users can use the table controls to show archived items.
        /// <para>Archived items are NEVER deleted automatically; however, they can still be deleted while also being in an archived state.
        /// If an archived item is deleted, it retains its archived date and time.  If undeleted it simply reverts back to being archived.</para>
        /// </summary>
        [Column("archived")]
        internal DateTimeOffset? _Archived { get; set; }

        public override ModelStateDictionary Validate(APIActions apiAction)
        {
            return base.Validate(apiAction);
        }
    }
}
