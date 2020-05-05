import ModifierContext from "./ModifierContext";
import Concept from "../core/Concept";
import Context from "../core/Context";

export enum FrequencyTypes {
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

export enum RelationshipTypes {
    /**
     *  A count of 0 will exist when the relationship
    */
    Unspecified,
    /**
     *  0 items were specifically set.
    */
    None,
    /**
     *  One article or subject.
    */
    One,
    /**
     *  One specific article or subject ("The dog").
    */
    OneSpecific,
    /**
     *  One unspecific article or subject ("A dog").
    */
    OneNonSpecific,
    /**
     *  Many articles or subjects, but not all of them.
    */
    Many,
    /**
     *  All such articles or subjects.
    */
    All
}

/**
 *  Holds frequency type relational information.
*/
export default class FrequencyContext extends ModifierContext {
    STRENGTH_STEP = 0.01;

    #_FrequencyType: FrequencyTypes;
    get frequencyType(): FrequencyTypes { return this.#_FrequencyType; }
    set frequencyType(value) {
        if (this.#_FrequencyType != value) {
            this.#_FrequencyType = value;
            switch (value) {
                case FrequencyTypes.Unspecified: this.frequencyGenerality = null; break;
                case FrequencyTypes.Always: this.frequencyGenerality = 1; break;
                case FrequencyTypes.AlmostAlways: this.frequencyGenerality = 0.9; break;
                case FrequencyTypes.MostTimes: this.frequencyGenerality = 0.8; break;
                case FrequencyTypes.Frequently: this.frequencyGenerality = 0.6; break;
                case FrequencyTypes.Sometimes: this.frequencyGenerality = 0.3; break;
                case FrequencyTypes.Rarely: this.frequencyGenerality = 0.01; break;
                case FrequencyTypes.Sporadically: this.frequencyGenerality = 0.000001; break;
                case FrequencyTypes.Randomly: this.frequencyGenerality = null; break;
            }
        }
    }

    /** 
     * When a FrequencyType value is set, a general frequency "percentage" value from 0.0 to 1.0 is selected.
     * This is only a general rule of thumb used within the system.
     */
    frequencyGenerality: number; // TODO: Consider ways to make this more dynamic and not fixed based on FrequencyType.

    /**
     *  If a specified time period should be referenced, or elapse.
    */
    frequencyTimer: DS.TimeSpan;

    /**
     *  A specific time for something.
    */
    frequencyTime: Date;

    #_relationshipType: RelationshipTypes;

    /**
     *  Type of relationship (one time, many times - or "Count" may also be specified along with, or instead)
    */
    get relationshipType() { return this.#_relationshipType; }
    set relationshipType(value) {
        if (this.#_relationshipType != value) {
            this.#_relationshipType = value;
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
    static _isOne(value: RelationshipTypes): boolean {
        return value == RelationshipTypes.One || value == RelationshipTypes.OneSpecific || value == RelationshipTypes.OneNonSpecific;
    }

    /**
     *  True if the relationship type is either one, a specific one, or an unspecific one ("One dog", "The dog", "A dog").
    */
    isOne(): boolean { return FrequencyContext._isOne(this.#_relationshipType); }
    /**
     *  True if the relationship type is one specific article or subject ("The dog").
    */
    isSpecificOne(): boolean { return this.#_relationshipType == RelationshipTypes.OneSpecific; }
    /**
     *  True if the relationship type is a non-specific article or subject ("A dog").
    */
    isNonSpecificOne(): boolean { return this.#_relationshipType == RelationshipTypes.OneNonSpecific; }

    /**
     *  The count frequency of the related context when used as an attribute.
    */
    get count() { return this._count; }
    set count(value) {
        if (this._count != value) {
            this._count = value;
            if (value == null)
                this.#_relationshipType = RelationshipTypes.Unspecified;
            else if (value == 0)
                this.#_relationshipType = RelationshipTypes.None;
            else if ((value == 1 || value == -1) && !this.isOne)
                this.#_relationshipType = RelationshipTypes.One;
            else if (this.#_relationshipType != RelationshipTypes.Many && this.#_relationshipType != RelationshipTypes.All)
                this.#_relationshipType = RelationshipTypes.Many; // (don't assume all yet, but many should be fine)
        }
    }

    _count: number;

    /**
     *  The strength of this connection between data elements, between 0 and 1.
     *  <para>All new connections start with a small strength value, which increases as the connection is reinforced.</para>
    */
    strength: number;

    constructor(concept: Concept, parent: Context = null) {
        super(concept, null, parent);
    }
}
