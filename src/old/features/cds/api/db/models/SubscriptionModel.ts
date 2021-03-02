using CoreXT.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("subscription_models")]
    public partial class SubscriptionModel : ApplicationEntity
    {
        public SubscriptionModel()
        {
        }

        [Column("item_code")]
        public string ItemCode { get; set; }

        [Column("title")]
        public string Title { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("detail")]
        public string Detail { get; set; }

        [Column("price")]
        public decimal? Price { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("max_users")]
        public int MaxUsers { get; set; }

        [Column("sequence")]
        public int? Sequence { get; set; }

        [Column("frequency")]
        public int Frequency { get; set; }

        [Column("frequency_interval")]
        public int FrequencyInterval { get; set; }

        [Column("duration")]
        public int Duration { get; set; }

        [Column("trial_price")]
        public decimal TrialPrice { get; set; }

        [Column("trial_length")]
        public int TrialLength { get; set; }

        public virtual ICollection<SubscriptionPropertyValue> SubscriptionPropertyValues { get; set; }

        public virtual ICollection<Subscription> Subscriptions { get; set; }

        [NotMapped]
        public virtual ICollection<Application> Applications { get { return EntityMap.Get(ref _SubscriptionModels, this, Subscription_Models_Applications_Maps = Subscription_Models_Applications_Maps.EnsureEntityCollection()); } }
        EntityMap<SubscriptionModel, Subscription_Models_Applications_Map, Application> _SubscriptionModels;
        public virtual ICollection<Subscription_Models_Applications_Map> Subscription_Models_Applications_Maps { get; set; }
    }
}
