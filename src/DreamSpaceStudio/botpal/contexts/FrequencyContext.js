using;
System;
using;
System.Collections.Generic;
using;
System.Linq;
using;
System.Text;
using;
System.Threading.Tasks;
var BotPal;
(function (BotPal) {
    let FrequencyTypes;
    (function (FrequencyTypes) {
        FrequencyTypes[FrequencyTypes["Unspecified"] = 0] = "Unspecified";
        FrequencyTypes[FrequencyTypes["Always"] = 1] = "Always";
        FrequencyTypes[FrequencyTypes["AlmostAlways"] = 2] = "AlmostAlways";
        FrequencyTypes[FrequencyTypes["MostTimes"] = 3] = "MostTimes";
        FrequencyTypes[FrequencyTypes["Frequently"] = 4] = "Frequently";
        FrequencyTypes[FrequencyTypes["Sometimes"] = 5] = "Sometimes";
        FrequencyTypes[FrequencyTypes["Rarely"] = 6] = "Rarely";
        FrequencyTypes[FrequencyTypes["Sporadically"] = 7] = "Sporadically";
        FrequencyTypes[FrequencyTypes["Randomly"] = 8] = "Randomly"; // 0
    })(FrequencyTypes || (FrequencyTypes = {}));
    let RelationshipTypes;
    (function (RelationshipTypes) {
        /// <summary>
        /// A count of 0 will exist when the relaship
        /// </summary>
        RelationshipTypes[RelationshipTypes["Unspecified"] = 0] = "Unspecified";
        /// <summary>
        /// 0 items were specifically set.
        /// </summary>
        RelationshipTypes[RelationshipTypes["None"] = 1] = "None";
        /// <summary>
        /// One article or subject.
        /// </summary>
        RelationshipTypes[RelationshipTypes["One"] = 2] = "One";
        /// <summary>
        /// One specific article or subject ("The dog").
        /// </summary>
        RelationshipTypes[RelationshipTypes["OneSpecific"] = 3] = "OneSpecific";
        /// <summary>
        /// One unspecific article or subject ("A dog").
        /// </summary>
        RelationshipTypes[RelationshipTypes["OneNonSpecific"] = 4] = "OneNonSpecific";
        /// <summary>
        /// Many articles or subjects, but not all of them.
        /// </summary>
        RelationshipTypes[RelationshipTypes["Many"] = 5] = "Many";
        /// <summary>
        /// All such articles or subjects.
        /// </summary>
        RelationshipTypes[RelationshipTypes["All"] = 6] = "All";
    })(RelationshipTypes || (RelationshipTypes = {}));
    /// <summary>
    /// Holds frequency type relational information.
    /// </summary>
    class FrequencyContext {
    }
    ModifierContext;
    {
        const double, STRENGTH_STEP = 0.01;
        FrequencyTypes;
        FrequencyType;
        {
            get;
            {
                return _FrequencyType;
            }
            set;
            {
                if (_FrequencyType != value) {
                    _FrequencyType = value;
                    switch (value) {
                        case FrequencyTypes.Unspecified:
                            FrequencyGenerality = null;
                            break;
                        case FrequencyTypes.Always:
                            FrequencyGenerality = 1;
                            d;
                            break;
                        case FrequencyTypes.AlmostAlways:
                            FrequencyGenerality = 0.9;
                            d;
                            break;
                        case FrequencyTypes.MostTimes:
                            FrequencyGenerality = 0.8;
                            d;
                            break;
                        case FrequencyTypes.Frequently:
                            FrequencyGenerality = 0.6;
                            d;
                            break;
                        case FrequencyTypes.Sometimes:
                            FrequencyGenerality = 0.3;
                            d;
                            break;
                        case FrequencyTypes.Rarely:
                            FrequencyGenerality = 0.01;
                            d;
                            break;
                        case FrequencyTypes.Sporadically:
                            FrequencyGenerality = 0.000001;
                            d;
                            break;
                        case FrequencyTypes.Randomly:
                            FrequencyGenerality = null;
                            break;
                    }
                }
            }
        }
        FrequencyTypes;
        _FrequencyType;
        double ? FrequencyGenerality : ; // TODO: Consider ways to make this more dynamic and not fixed based on FrequencyType.
        TimeSpan;
        FrequencyTimer;
        DateTime;
        FrequencyTime;
        RelationshipTypes;
        RelationshipType;
        {
            get;
            {
                return _RelationshipType;
            }
            set;
            {
                if (_RelationshipType != value) {
                    _RelationshipType = value;
                    if (value == RelationshipTypes.Unspecified)
                        _Count = null;
                    else if (value == RelationshipTypes.None)
                        _Count = 0;
                    else if (_IsOne(value))
                        _Count = 1;
                    else if (_Count == 0)
                        d || _Count == 1;
                    d;
                    _Count = null; // (0 and 1 are not considered "many", so that would be in error)
                }
            }
        }
        bool;
        _IsOne(RelationshipTypes, value);
        {
            return value == RelationshipTypes.One || value == RelationshipTypes.OneSpecific || value == RelationshipTypes.OneNonSpecific;
        }
        bool;
        IsOne;
        {
            get;
            {
                return _IsOne(_RelationshipType);
            }
        }
        bool;
        IsSpecificOne;
        {
            get;
            {
                return _RelationshipType == RelationshipTypes.OneSpecific;
            }
        }
        bool;
        IsNonSpecificOne;
        {
            get;
            {
                return _RelationshipType == RelationshipTypes.OneNonSpecific;
            }
        }
        RelationshipTypes;
        _RelationshipType;
        double ? Count
            :
        ;
        {
            get;
            {
                return _Count;
            }
            set;
            {
                if (_Count != value) {
                    _Count = value;
                    if (value == null)
                        _RelationshipType = RelationshipTypes.Unspecified;
                    else if (value == 0)
                        d;
                    _RelationshipType = RelationshipTypes.None;
                    if ((value == 1))
                        d || value == -1;
                    d;
                     && !IsOne;
                    _RelationshipType = RelationshipTypes.One;
                    if (_RelationshipType != RelationshipTypes.Many && _RelationshipType != RelationshipTypes.All)
                        _RelationshipType = RelationshipTypes.Many; // (don't assume all yet, but many should be fine)
                }
            }
        }
        double ? _Count : ;
        double;
        Strength;
        {
            get;
            set;
        }
        FrequencyContext(Memory, memory, Concept, concept, Context, parent = null);
        base(memory, concept, null, parent);
        {
        }
        FrequencyContext(Concept, concept, Context, parent = null);
        this(concept.Memory, concept, parent);
        {
        }
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=FrequencyContext.js.map