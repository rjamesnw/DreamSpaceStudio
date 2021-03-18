using CoreXT.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("organizations")]
    public partial class Organization : NamedApplicationEntity
    {
        public Organization()
        {
        }

        [Column("domain")]
        public string Domain { get; set; }

        [ForeignKey(nameof(ParentOrganization))]
        [Column("organizations_id")]
        public ulong? OrganizationsID { get; set; }

        [NotMapped]
        public virtual ICollection<User> Users { get { return EntityMap.Get(ref _Users, this, User_Organization_Maps = User_Organization_Maps.EnsureEntityCollection()); } }
        EntityMap<Organization, User_Organization_Map, User> _Users;
        protected virtual ICollection<User_Organization_Map> User_Organization_Maps { get; set; }

        public virtual Organization ParentOrganization { get; set; }
    }
}
