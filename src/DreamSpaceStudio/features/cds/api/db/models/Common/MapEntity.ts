using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    /// <summary>
    /// The base type for all entities that map data between tables within the partitioned application instance.
    /// These are all tables that are NOT related to normal application tables or static lookup tables.
    /// </summary>
    public abstract partial class MapEntity : EntityCreatedByBase
    {
    }

    /// <summary>
    ///     Place this attribute on a map entity to designate the left and right sides of the mapping.
    ///     <para>This is used with 'ICDSServiceUtilities.GetMapEntityInfo()' in order to help identify which side of the map
    ///     table is considered left and right for mapping purposes. If the expected naming convention is used then this
    ///     attribute is not needed. 'GetMapEntityInfo()' splits a type name that contains underscores separating left and right
    ///     names, and the word "map".  For example, "Left_Right_Map", "Map_Left_Right", or "Left_Map_Right" will all work as a
    ///     convention. Once the names are extracted, matching navigational properties are expected with the same names (not
    ///     case sensitive). As such, when the left and/or right names are a short abbreviation or mnemonic to make coding easier,
    ///     then this attribute is needed to help the system know what the navigational property names are. </para>
    /// </summary>
    /// <seealso cref="T:System.Attribute"/>
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
    public class MapEntityAttribute : Attribute
    {
        public readonly string Left, Right;
        public MapEntityAttribute(string left, string right)
        {
            Left = left;
            Right = right;
        }
    }
}
