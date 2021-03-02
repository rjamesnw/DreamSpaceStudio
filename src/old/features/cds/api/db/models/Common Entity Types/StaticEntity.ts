using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    /// <summary>
    /// The base type for all entities that contain data that is static and usually never changes.
    /// These tables cannot be edited by end users, and are part of the application's core design (like representing enums).
    /// </summary>
    public partial class StaticEntity : EntityBase, ISinglePrimaryKeyEntity<int>
    {
        [Required]
        [Key]
        [ReadOnly(true)]
        [Column("id")]
        public int ID { get; protected set; }
    }
}
