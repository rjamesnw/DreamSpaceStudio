using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("subscription_property_values")]
    public partial class SubscriptionPropertyValue
    {
        [ForeignKey(nameof(SubscriptionModel))]
        [Column("subscription_models_id")]
        public ulong SubscriptionModelsID { get; set; }

        [ForeignKey(nameof(SubscriptionProperty))]
        [Column("subscription_properties_id")]
        public ulong SubscriptionPropertiesID { get; set; }

        [Column("value")]
        public string Value { get; set; }

        public virtual SubscriptionModel SubscriptionModel { get; set; }

        public virtual SubscriptionProperty SubscriptionProperty { get; set; }
    }
}
