using CoreXT.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("users")]
    public partial class User : ApplicationEntity
    {
        //? //? [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public User()
        {
        }

        [Column("first_name")]
        public string FirstName { get; set; }

        [Column("last_name")]
        public string LastName { get; set; }

        [Column("alias")]
        public string Alias { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("phone")]
        public string Phone { get; set; }

        [Column("password")]
        public string Password { get; set; }

        [Column("password_reset_key")]
        public string PasswordResetKey { get; set; }

        [Column("last_login")]
        public DateTime? LastLogin { get; set; }

        [Column("reg_mode")]
        public int? reg_mode { get; set; }

        [Column("reg_key")]
        public string reg_key { get; set; }

        public virtual ICollection<User_Organization_Map> User_Organization_Mapping { get; set; }

        public virtual ICollection<Payment> Payments { get; set; }

        [NotMapped]
        public virtual ICollection<Subscription> Subscriptions { get { return EntityMap.Get(ref _Subscriptions, this, Subscription_User_Maps = Subscription_User_Maps.EnsureEntityCollection()); } }
        EntityMap<User, Subscription_User_Map, Subscription> _Subscriptions;
        protected virtual ICollection<Subscription_User_Map> Subscription_User_Maps { get; set; }

        public virtual ICollection<Organization_User_Application_Membership_Map> Organization_User_Application_Membership_Mapping { get; set; }

        public virtual ICollection<Subscription_User_Map> Subscription_SubUser_Mapping { get; set; }

        public virtual ICollection<SavedBillingAddress> SavedBillingAddresses { get; set; }

        public virtual ICollection<SavedCreditCardInfo> SavedCreditCardInfos { get; set; }

        public virtual ICollection<SessionStore> SessionData { get; set; }
    }
}
