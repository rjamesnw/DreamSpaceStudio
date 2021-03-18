using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("map_organizations_users_applications_memberships")]
    public partial class Organization_User_Application_Membership_Map : MapEntity
    {
        [ForeignKey(nameof(Organization))]
        [Column("organizations_id")]
        public ulong? OrganizationsID { get; set; }

        [ForeignKey(nameof(Application))]
        [Column("applications_id")]
        public ulong ApplicationsID { get; set; }

        [ForeignKey(nameof(Membership))]
        [Column("memberships_id")]
        public ulong MembershipsID { get; set; }

        [ForeignKey(nameof(User))]
        [Column("users_id_for")]
        public ulong ForUsersID { get; set; }

        public virtual Organization Organization { get; set; }

        public virtual Application Application { get; set; }

        public virtual Membership Membership { get; set; }

        public virtual User User { get; set; }
    }
}
