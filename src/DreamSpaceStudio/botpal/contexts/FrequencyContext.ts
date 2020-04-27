using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal
{
    public enum FrequencyTypes
    {
        Unspecified,
        Always, // 1.0
        AlmostAlways, // 0.9
        MostTimes, // 0.8
        Frequently, // 0.6
        Sometimes, // 0.3
        Rarely, // 0.01
        Sporadically, // 0
        Randomly // 0
    }

    public enum RelationshipTypes
    {
        /// <summary>
        /// A count of 0 will exist when the relaship
        /// </summary>
        Unspecified,
        /// <summary>
        /// 0 items were specifically set.
        /// </summary>
        None,
        /// <summary>
        /// One article or subject.
        /// </summary>
        One,
        /// <summary>
        /// One specific article or subject ("The dog").
        /// </summary>
        OneSpecific,
        /// <summary>
        /// One unspecific article or subject ("A dog").
        /// </summary>
        OneNonSpecific,
        /// <summary>
        /// Many articles or subjects, but not all of them.
        /// </summary>
        Many,
        /// <summary>
        /// All such articles or subjects.
        /// </summary>
        All
    }

    /// <summary>
    /// Holds frequency type relational information.
    /// </summary>
    public class FrequencyContext : ModifierContext
    {
        public const double STRENGTH_STEP = 0.01;

        public FrequencyTypes FrequencyType
        {
            get { return _FrequencyType; }
            set
            {
                if (_FrequencyType != value)
                {
                    _FrequencyType = value;
                    switch (value)
                    {
                        case FrequencyTypes.Unspecified: FrequencyGenerality = null; break;
                        case FrequencyTypes.Always: FrequencyGenerality = 1d; break;
                        case FrequencyTypes.AlmostAlways: FrequencyGenerality = 0.9d; break;
                        case FrequencyTypes.MostTimes: FrequencyGenerality = 0.8d; break;
                        case FrequencyTypes.Frequently: FrequencyGenerality = 0.6d; break;
                        case FrequencyTypes.Sometimes: FrequencyGenerality = 0.3d; break;
                        case FrequencyTypes.Rarely: FrequencyGenerality = 0.01d; break;
                        case FrequencyTypes.Sporadically: FrequencyGenerality = 0.000001d; break;
                        case FrequencyTypes.Randomly: FrequencyGenerality = null; break;
                    }
                }
            }
        }
        public FrequencyTypes _FrequencyType;

        /// <summary>
        /// When a FrequencyType value is set, a general frequency "percentage" value from 0.0 to 1.0 is selected.
        /// This is only a general rule of thumb used within the system.
        /// </summary>
        public double? FrequencyGenerality; // TODO: Consider ways to make this more dynamic and not fixed based on FrequencyType.

        /// <summary>
        /// If a specified time period should be referenced, or elapse.
        /// </summary>
        public TimeSpan FrequencyTimer;

        /// <summary>
        /// A specific time for something.
        /// </summary>
        public DateTime FrequencyTime;

        /// <summary>
        /// Type of relationship (one time, many times - or "Count" may also be specified along with, or instead)
        /// </summary>
        public RelationshipTypes RelationshipType
        {
            get { return _RelationshipType; }
            set
            {
                if (_RelationshipType != value)
                {
                    _RelationshipType = value;
                    if (value == RelationshipTypes.Unspecified)
                        _Count = null;
                    else if (value == RelationshipTypes.None)
                        _Count = 0;
                    else if (_IsOne(value))
                        _Count = 1;
                    else if (_Count == 0d || _Count == 1d)
                        _Count = null; // (0 and 1 are not considered "many", so that would be in error)
                }
            }
        }

        static bool _IsOne(RelationshipTypes value)
        {
            return value == RelationshipTypes.One || value == RelationshipTypes.OneSpecific || value == RelationshipTypes.OneNonSpecific;
        }

        /// <summary>
        /// True if the relationship type is either one, a specific one, or an unspecific one ("One dog", "The dog", "A dog").
        /// </summary>
        public bool IsOne { get { return _IsOne(_RelationshipType); } }
        /// <summary>
        /// True if the relationship type is one specific article or subject ("The dog").
        /// </summary>
        public bool IsSpecificOne { get { return _RelationshipType == RelationshipTypes.OneSpecific; } }
        /// <summary>
        /// True if the relationship type is a non-specific article or subject ("A dog").
        /// </summary>
        public bool IsNonSpecificOne { get { return _RelationshipType == RelationshipTypes.OneNonSpecific; } }

        public RelationshipTypes _RelationshipType;

        /// <summary>
        /// The count frequency of the related context when used as an attribute.
        /// </summary>
        public double? Count
        {
            get { return _Count; }
            set
            {
                if (_Count != value)
                {
                    _Count = value;
                    if (value == null)
                        _RelationshipType = RelationshipTypes.Unspecified;
                    else if (value == 0d)
                        _RelationshipType = RelationshipTypes.None;
                    else if ((value == 1d || value == -1d) && !IsOne)
                        _RelationshipType = RelationshipTypes.One;
                    else if (_RelationshipType != RelationshipTypes.Many && _RelationshipType != RelationshipTypes.All)
                        _RelationshipType = RelationshipTypes.Many; // (don't assume all yet, but many should be fine)
                }
            }
        }
        double? _Count;

        /// <summary>
        /// The strength of this connection between data elements, between 0 and 1.
        /// <para>All new connections start with a small strength value, which increases as the connection is reinforced.</para>
        /// </summary>
        public double Strength { get; set; }

        public FrequencyContext(Memory memory, Concept concept, Context parent = null) : base(memory, concept, null, parent)
        {
        }

        public FrequencyContext(Concept concept, Context parent = null) : this(concept.Memory, concept, parent)
        {
        }
    }
}
