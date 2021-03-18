using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("memberships")]
    public partial class Membership: NamedApplicationEntity
    {
        public Membership()
        {
        }

        [Column("description")]
        public string Description { get; set; }

        public virtual ICollection<Application_Membership_Role_Map> Application_Membership_Role_Mapping { get; set; }

        public virtual ICollection<Organization_User_Application_Membership_Map> Organization_User_Application_Membership_Mapping { get; set; }
    }
}
