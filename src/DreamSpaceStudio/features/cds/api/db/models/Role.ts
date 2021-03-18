using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("roles")]
    public partial class Role: NamedApplicationEntity
    {
        public Role()
        {
        }

        [Column("description")]
        public string Description { get; set; }

        public virtual ICollection<Application_Membership_Role_Map> Application_Membership_Role_Mapping { get; set; }
    }
}
