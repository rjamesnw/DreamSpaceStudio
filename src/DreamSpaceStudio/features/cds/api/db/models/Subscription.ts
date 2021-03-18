using CoreXT.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace CDS.Entities
{
    [Table("subscriptions")]
    public partial class Subscription : ApplicationEntity
    {
        public Subscription()
        {
            Payments = new HashSet<Payment>();
            Subscription_User_Maps = new HashSet<Subscription_User_Map>();
        }

        [ForeignKey(nameof(User))]
        [Column("users_id_for")]
        public ulong ForUsersID { get; set; }

        [ForeignKey(nameof(SubscriptionModel))]
        [Column("subscription_models_id")]
        public ulong SubscriptionModelsID { get; set; }

        [Column("tos_accepted")]
        public DateTime? TOSAccepted { get; set; }

        [Column("auto_renew")]
        public bool AutoRenew { get; set; }

        [ForeignKey(nameof(Organization))]
        [Column("organizations_id")]
        public ulong? OrganizationsID { get; set; }

        [Column("duration")]
        public int Duration { get; set; }

        public virtual ICollection<Payment> Payments { get; set; }
        public virtual SubscriptionModel SubscriptionModel { get; set; }
        public virtual User User { get; set; }
        public virtual Organization Organization { get; set; }

        [NotMapped]
        public virtual ICollection<User> Users { get { return EntityMap.Get(ref _Users, this, Subscription_User_Maps = Subscription_User_Maps.EnsureEntityCollection()); } }
        EntityMap<Subscription, Subscription_User_Map, User> _Users;
        protected virtual ICollection<Subscription_User_Map> Subscription_User_Maps { get; set; }

        //---------------------------------------------------------------------------------------------------------------------

        //public SubscriptionStatus GetSubscriptionStatus()
        //{
        //    var db = new CDSContext();
        //    var test = db.Payments.Where(m => m.subscriptions_id == id);
        //    return SubscriptionStatus.Pending;
        //}
    }
}
