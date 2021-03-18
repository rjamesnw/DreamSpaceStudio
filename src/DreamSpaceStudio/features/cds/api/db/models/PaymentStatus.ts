using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("payment_statuses")]
    public partial class PaymentStatus: EnumEntity
    {
    }
}
