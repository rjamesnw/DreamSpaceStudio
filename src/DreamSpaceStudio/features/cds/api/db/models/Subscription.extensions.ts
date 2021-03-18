using CoreXT.Services.DI;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace CDS.Entities
{
    public partial class Subscription
    {
        //... extra properties and methods...
        [NotMapped]
        [JsonConverter(typeof(StringEnumConverter))]
        public SubscriptionStatus Status { get; set; }

    }
}
