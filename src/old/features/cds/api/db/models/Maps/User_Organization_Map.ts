using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("map_users_organizations")]
    public partial class User_Organization_Map: MapEntity
    {
        [ForeignKey(nameof(User))]
        [Column("alias")]
        public ulong UserID { get; set; }

        [ForeignKey(nameof(Organization))]
        public ulong OrganizationsID { get; set; }

        public DateTime? admin { get; set; }

        public int? duration { get; set; }

        public DateTime? deleted { get; set; }

        public virtual Organization Organization { get; set; }

        public virtual User User { get; set; }
    }
}
