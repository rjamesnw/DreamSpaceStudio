using CDS.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    public partial class NamedUIDEntityBase : EnabledEntityBase
    {
        [Column("name")]
        public string Name { get; set; }
    }
}
