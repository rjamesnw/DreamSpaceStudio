using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("map_applications_memberships_roles")]
    public partial class Application_Membership_Role_Map: MapEntity
    {
        [ForeignKey(nameof(Application))]
        [Column("applications_id")]
        public ulong ApplicationsID { get; set; }

        [ForeignKey(nameof(Membership))]
        [Column("memberships_id")]
        public ulong MembershipsID { get; set; }

        [ForeignKey(nameof(Role))]
        [Column("roles_id")]
        public ulong RolesID { get; set; }

        public virtual Application Application { get; set; }

        public virtual Membership Membership { get; set; }

        public virtual Role Role { get; set; }
    }
}
