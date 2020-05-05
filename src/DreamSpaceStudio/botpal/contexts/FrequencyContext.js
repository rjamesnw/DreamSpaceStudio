"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __FrequencyType, __relationshipType;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipTypes = exports.FrequencyTypes = void 0;
const ModifierContext_1 = require("./ModifierContext");
var FrequencyTypes;
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
})(FrequencyTypes = exports.FrequencyTypes || (exports.FrequencyTypes = {}));
var RelationshipTypes;
(function (RelationshipTypes) {
    /// <summary>
    /// A count of 0 will exist when the relationship
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
})(RelationshipTypes = exports.RelationshipTypes || (exports.RelationshipTypes = {}));
/// <summary>
/// Holds frequency type relational information.
/// </summary>
class FrequencyContext extends ModifierContext_1.default {
    constructor(concept, parent = null) {
        super(concept, null, parent);
        this.STRENGTH_STEP = 0.01;
        __FrequencyType.set(this, void 0);
        __relationshipType.set(this, void 0);
    }
    get frequencyType() { return __classPrivateFieldGet(this, __FrequencyType); }
    set frequencyType(value) {
        if (__classPrivateFieldGet(this, __FrequencyType) != value) {
            __classPrivateFieldSet(this, __FrequencyType, value);
            switch (value) {
                case FrequencyTypes.Unspecified:
                    this.frequencyGenerality = null;
                    break;
                case FrequencyTypes.Always:
                    this.frequencyGenerality = 1;
                    break;
                case FrequencyTypes.AlmostAlways:
                    this.frequencyGenerality = 0.9;
                    break;
                case FrequencyTypes.MostTimes:
                    this.frequencyGenerality = 0.8;
                    break;
                case FrequencyTypes.Frequently:
                    this.frequencyGenerality = 0.6;
                    break;
                case FrequencyTypes.Sometimes:
                    this.frequencyGenerality = 0.3;
                    break;
                case FrequencyTypes.Rarely:
                    this.frequencyGenerality = 0.01;
                    break;
                case FrequencyTypes.Sporadically:
                    this.frequencyGenerality = 0.000001;
                    break;
                case FrequencyTypes.Randomly:
                    this.frequencyGenerality = null;
                    break;
            }
        }
    }
    /// <summary>
    /// Type of relationship (one time, many times - or "Count" may also be specified along with, or instead)
    /// </summary>
    get relationshipType() { return __classPrivateFieldGet(this, __relationshipType); }
    set relationshipType(value) {
        if (__classPrivateFieldGet(this, __relationshipType) != value) {
            __classPrivateFieldSet(this, __relationshipType, value);
            if (value == RelationshipTypes.Unspecified)
                this._count = null;
            else if (value == RelationshipTypes.None)
                this._count = 0;
            else if (FrequencyContext._isOne(value))
                this._count = 1;
            else if (this._count == 0 || this._count == 1)
                this._count = null; // (0 and 1 are not considered "many", so that would be in error)
        }
    }
    /**
     * Determines if this frequency context represents a singular item or occurrence.
     * @param {RelationshipTypes} value
     * @returns
     */
    static _isOne(value) {
        return value == RelationshipTypes.One || value == RelationshipTypes.OneSpecific || value == RelationshipTypes.OneNonSpecific;
    }
    /// <summary>
    /// True if the relationship type is either one, a specific one, or an unspecific one ("One dog", "The dog", "A dog").
    /// </summary>
    isOne() { return FrequencyContext._isOne(__classPrivateFieldGet(this, __relationshipType)); }
    /// <summary>
    /// True if the relationship type is one specific article or subject ("The dog").
    /// </summary>
    isSpecificOne() { return __classPrivateFieldGet(this, __relationshipType) == RelationshipTypes.OneSpecific; }
    /// <summary>
    /// True if the relationship type is a non-specific article or subject ("A dog").
    /// </summary>
    isNonSpecificOne() { return __classPrivateFieldGet(this, __relationshipType) == RelationshipTypes.OneNonSpecific; }
    /// <summary>
    /// The count frequency of the related context when used as an attribute.
    /// </summary>
    get count() { return this._count; }
    set count(value) {
        if (this._count != value) {
            this._count = value;
            if (value == null)
                __classPrivateFieldSet(this, __relationshipType, RelationshipTypes.Unspecified);
            else if (value == 0)
                __classPrivateFieldSet(this, __relationshipType, RelationshipTypes.None);
            else if ((value == 1 || value == -1) && !this.isOne)
                __classPrivateFieldSet(this, __relationshipType, RelationshipTypes.One);
            else if (__classPrivateFieldGet(this, __relationshipType) != RelationshipTypes.Many && __classPrivateFieldGet(this, __relationshipType) != RelationshipTypes.All)
                __classPrivateFieldSet(this, __relationshipType, RelationshipTypes.Many); // (don't assume all yet, but many should be fine)
        }
    }
}
exports.default = FrequencyContext;
__FrequencyType = new WeakMap(), __relationshipType = new WeakMap();
//# sourceMappingURL=FrequencyContext.js.map