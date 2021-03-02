using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    /// <summary>
    /// Stores session data in a database to be shared across multiple website instances.
    /// </summary>
    [Table("session_store")]
    public partial class SessionStore
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public ulong ID { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("key")]
        public string Key { get; set; }

        [Required]
        [Column("value")]
        public byte[] Value { get; set; }

        [Column("created")]
        public DateTimeOffset Created { get; set; }

        [Column("updated")]
        public DateTimeOffset Updated { get; set; }

        [Column("expires")]
        public DateTimeOffset Expires { get; set; }

        [ForeignKey(nameof(User))]
        [Column("users_id")]
        public ulong users_id { get; set; }

        [MaxLength(50)]
        [Column("session_id")]
        public string SessionID { get; set; }

        public virtual User User { get; set; }
    }
}
