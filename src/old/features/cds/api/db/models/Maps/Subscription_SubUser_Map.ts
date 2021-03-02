using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("map_subscriptions_sub_users")]
    public partial class Subscription_User_Map: MapEntity
    {
        [ForeignKey(nameof(Subscription))]
        [Column("subscriptions_id")]
        public ulong SubscriptionsID { get; set; }

        [ForeignKey(nameof(User))]
        [Column("users_id_for")]
        public ulong ForUsersID { get; set; }

        [Column("accepted")]
        public DateTime? Accepted { get; set; }

        public virtual User User { get; set; }

        public virtual Subscription Subscription { get; set; }
    }
}
