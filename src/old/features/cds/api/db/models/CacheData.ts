using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    /// <summary>
    /// Stores system-wide cache data in a database to be shared across multiple website instances.
    /// </summary>
    [Table("system_cache")]
    public partial class CacheData
    {
        [Key]
        [Required]
        [MaxLength(255)]
        public string key { get; set; }

        [Required]
        [Column("value")]
        public byte[] Value { get; set; }

        [Required]
        [Column("created")]
        public DateTimeOffset Created { get; set; }

        [Required]
        [Column("updated")]
        public DateTimeOffset Updated { get; set; }

        [Column("expires")]
        public DateTimeOffset? Expires { get; set; }

        [Column("timeout")]
        public int? Timeout { get; set; }
    }
}
