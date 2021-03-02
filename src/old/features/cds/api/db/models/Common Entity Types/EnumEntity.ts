using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    /// <summary>
    /// The base type for all entities that contain a list of static entries typically representing enum values.
    /// These tables cannot be edited by end users, and are part of the application's core design.
    /// </summary>
    public partial class EnumEntity : StaticEntity, INamedEntity
    {
        [ReadOnly(true)] 
        [Column("name")]
        public string _Name { get; protected set; }

        public virtual string Name => _Name;

        [Column("description")]
        public string Description { get; set; }
    }
}
