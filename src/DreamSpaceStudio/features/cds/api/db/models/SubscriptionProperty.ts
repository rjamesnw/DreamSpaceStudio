using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("subscription_properties")]
    public partial class SubscriptionProperty: NamedApplicationEntity
    {
        public SubscriptionProperty()
        {
        }

        [ForeignKey(nameof(Application))]
        [Column("applications_id")]
        public ulong ApplicationID { get; set; }

        [Column("type")]
        public string DataType { get; set; }

        [Column("details")]
        public string Details { get; set; }

        public virtual Application Application { get; set; }

        public virtual ICollection<SubscriptionPropertyValue> SubscriptionPropertyValues { get; set; }
    }
}
