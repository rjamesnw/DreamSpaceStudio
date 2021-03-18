using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("saved_credit_card_info")]
    public partial class SavedCreditCardInfo: ApplicationEntity
    {
        [ForeignKey(nameof(User))]
        [Column("users_id_for")]
        public ulong ForUsersID { get; set; }

        [Column("number")]
        public string Number { get; set; }

        [Column("expire_month")]
        public int ExpireMonth { get; set; }

        [Column("expire_year")]
        public int ExpireYear { get; set; }

        [Column("cvv2")]
        public int CVV2 { get; set; }

        [Column("card_type")]
        public string CardType { get; set; }

        [Column("first_name")]
        public string FirstName { get; set; }

        [Column("last_name")]
        public string LastName { get; set; }

        [ForeignKey(nameof(Organization))]
        [Column("organizations_id")]
        public int? OrganizationsID { get; set; }

        public virtual User User { get; set; }

        public virtual Organization Organization { get; set; }
    }
}
