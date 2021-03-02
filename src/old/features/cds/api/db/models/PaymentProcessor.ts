using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("payment_processors")]
    public partial class PaymentProcessor: NamedApplicationEntity
    {
        //? [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public PaymentProcessor()
        {
        }

        [Column("url")]
        public string Url { get; set; }

        [Column("api_url")]
        public string APIUrl { get; set; }

        //? [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Payment> Payments { get; set; }
    }
}
