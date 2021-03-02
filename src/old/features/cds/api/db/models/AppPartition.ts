using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("app_partitions")]
    public partial class AppPartition : ApplicationEntity, INamedEntity
    {
        public AppPartition()
        {
        }

        [Column("name")]
        internal string _Name { get; set; }
        public virtual string Name => _Name;

        [Column("organizations_id")]
        public ulong? OrganizationsID { get; set; }
        [Column("applications_id")]
        public ulong? ApplicationsID { get; set; }
        [Column("db_server_name")]
        public string DBServerName { get; set; }
        [Column("db_server_ip")]
        public string DBServerIP { get; set; }
        [Column("db_server_port")]
        public int? DBServerPort { get; set; }
        [Column("notes")]
        public string Notes { get; set; }

       
        public virtual ICollection<Organization> Organizations { get; set; }
        public virtual ICollection<User> Users { get; set; }
        public virtual ICollection<Application> Applications { get; set; }
    }
}
