using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("audit_log")]
    public partial class AuditLogItem: ApplicationEntity
    {
        [ForeignKey(nameof(Action))]
        [Column("actions_id")]
        public ulong ActionsID { get; set; }

        [Column("details")]
        public string Details { get; set; }

        [Column("ip")]
        public string IP { get; set; }

        [Column("host")]
        public string Host { get; set; }

        public virtual User User { get; set; }

        public virtual Action Action { get; set; }
    }

}
