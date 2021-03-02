using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("saved_billing_address")]
    public partial class SavedBillingAddress: NamedApplicationEntity
    {
        [ForeignKey(nameof(User))]
        [Column("users_id_for")]
        public ulong ForUsersID { get; set; }

        [Column("address_line1")]
        public string AddressLine1 { get; set; }

        [Column("address_line2")]
        public string AddressLine2 { get; set; }

        [Column("city")]
        public string City { get; set; }

        [Column("province")]
        public string Province { get; set; }

        [Column("postal_code")]
        public string PostalCode { get; set; }

        [Column("country")]
        public string Country { get; set; }

        [Column("default")]
        public bool Default { get; set; }

        [Column("organizations_id")]
        public ulong? OrganizationsID { get; set; }

        [Column("type")]
        public string AddressType { get; set; }

        public virtual User User { get; set; }
    }
}
