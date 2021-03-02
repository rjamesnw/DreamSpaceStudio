using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("payments")]
    public partial class Payment: ApplicationEntity
    {
        [ForeignKey(nameof(Subscription))]
        [Column("subscriptions_id")]
        public ulong SubscriptionsID { get; set; }

        [ForeignKey(nameof(PaymentProcessor))]
        [Column("payment_processors_id")]
        public ulong PaymentProcessorsID { get; set; }

        [Column("expired")]
        public DateTimeOffset? Expired { get; set; }

        [Column("paid")]
        public bool Paid { get; set; }

        [Column("transaction_id")]
        public string TransactionID { get; set; }

        [Column("profile_id")]
        public string ProfileID { get; set; }

        [ForeignKey(nameof(PaymentStatus))]
        [Column("payment_statuses_id")]
        public ulong StatusID { get; set; }

        [Column("response_message")]
        public string ResponseMessage { get; set; }

        [Column("error_message")]
        public string ErrorMessage { get; set; }

        public virtual PaymentProcessor PaymentProcessor { get; set; }

        public virtual Subscription Subscription { get; set; }

        public virtual User User { get; set; }

        public virtual PaymentStatus PaymentStatus { get; set; }
    }
}
