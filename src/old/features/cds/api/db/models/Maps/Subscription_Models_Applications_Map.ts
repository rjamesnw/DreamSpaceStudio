using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("map_subscription_models_applications")]
    public partial class Subscription_Models_Applications_Map: MapEntity
    {
        [ForeignKey(nameof(SubscriptionModel))]
        [Column("subscription_models_id")]
        public ulong SubscriptionModelsID { get; set; }

        [ForeignKey(nameof(Application))]
        [Column("applications_id")]
        public ulong ApplicationsID { get; set; }

        public virtual SubscriptionModel SubscriptionModel { get; set; }

        public virtual Application Application { get; set; }
    }
}
