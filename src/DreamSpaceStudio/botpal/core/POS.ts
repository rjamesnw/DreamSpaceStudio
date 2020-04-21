// ========================================================================================================================

export class PartOfSpeech {
    private static _posRootIndex = new Map<string, Array<PartOfSpeech>>();
    private static _posNamedIndex = new Map<string, PartOfSpeech>();
    private static _posIndex = new Map<number, PartOfSpeech>();
    private static _lastPOSID = 0;

    private readonly _name: string;
    private readonly _id: number;
    private readonly _classification: string;
    get classification(): string { return this._classification; }

    constructor(name: string, id: number, classification: string = null) {
        if (!name)
            throw DS.Exception.argumentUndefinedOrNull("PartOfSpeech.constructor()", "name");

        this._name = name;
        this._id = id;
        this._classification = classification;

        if (this._id > PartOfSpeech._lastPOSID)
            PartOfSpeech._lastPOSID = this._id;

        var nameIndex = this.toString();

        if (PartOfSpeech._posNamedIndex.has(nameIndex))
            throw DS.Exception.error("PartOfSpeech.constructor()", "Duplicate POS object for '" + nameIndex + "'.");

        PartOfSpeech._posNamedIndex.set(nameIndex, this);

        if (PartOfSpeech._posIndex.has(this._id))
            throw DS.Exception.error("PartOfSpeech.constructor()", "Another POS object exists at ID index '" + this._id + "'.");

        PartOfSpeech._posIndex.set(this._id, this);

        var items = PartOfSpeech._posRootIndex.get(name);
        if (!items)
            PartOfSpeech._posRootIndex.set(name, [this]);
        else
            items.push(this);
    }

    addClass(classification: string, id: number): PartOfSpeech {
        return new PartOfSpeech(this._name, id, classification);
    }

    /**
     Returns true if this part of speech (POS) is a sub-class of the given POS.
    */
    classOf(pos: PartOfSpeech): boolean { return pos != null && pos._name == this._name; }

    toString(): string { return this._name + (this._classification != null ? "_" + this._classification : ""); }

    /**
     Returns true if this part of speech (POS) matches another.
     <para>It's important to note that a non-classified POS (ie simply "Noun") will always match a classified POS (ie "Noun->Person");
     however, comparing two classified POS that are different classes will not match, even if the POS names are the same.</para>
    */
    equals(pos: PartOfSpeech): boolean {
        return this == pos || this && pos && this._name == pos._name && (pos._classification == null || this._classification == null || this._classification == pos._classification);
        // (match if: references are equal, or both are not null and the names match, and: one classification is not specified [base match], or both classifications [sub-type/specialization] are the same)
    }
}

/**
/// Part-of-speech word assignment categories describing word syntactic functions.
*/
export default class POS { // AKA Lexical Categories / Word Classes
    /**
    ///     The 100 series represent groups.  For example, when creating a thought graph, 'Pronoun_Question' and
    ///     'Adverb_Question' can be grouped together under a shared POS type.  Another example may be "me and john" where the
    ///     pronoun and noun become grouped. Groups can be viewed as root nodes to the details under them.
    */
    static readonly Group = new PartOfSpeech("group", 100);
    static readonly Group_Question = POS.Group.addClass("question", 110); // (usually pronoun or adverb)
    static readonly Group_Subject = POS.Group.addClass("subject", 120); // (usually nouns)
    static readonly Group_Attribute = POS.Group.addClass("attribute", 130); // (usually adjectives)
    static readonly Group_Modifier = POS.Group.addClass("modifier", 140); // (usually adverbs)

    /** A person, place, thing, idea, living creature, quality, or action. (Examples: cowboy, theater, box, thought, tree, kindness, arrival) */
    static readonly Noun = new PartOfSpeech("noun", 1000);
    /** A word representing a person. */
    static readonly Noun_Person = POS.Noun.addClass("person", 1010);
    /** A word representing a place. */
    static readonly Noun_Place = POS.Noun.addClass("place", 1020);
    /** A word representing a living thing. */
    static readonly Noun_Creature = POS.Noun.addClass("creature", 1030);
    /** A word representing a tangible object. */
    static readonly Noun_Object = POS.Noun.addClass("object", 1040);
    /** A word representing a quality or feeling. Example: "He expressed his gratitude" */
    static readonly Noun_Quality_Or_Feeling = POS.Noun.addClass("quality_or_feeling", 1050);
    /** A word representing an action noun. Example: "He gave thanks" */
    static readonly Noun_Action = POS.Noun.addClass("action", 1060);
    /** A word representing a noun related to time. Example: "traveling through space and time" */
    static readonly Noun_Temporal = POS.Noun.addClass("temporal", 1070);
    /** A word representing a noun related to positioning. Example: "a location or address in computer memory" */
    static readonly Noun_Spatial = POS.Noun.addClass("spatial", 1080);
    /** The name of a trait or material state. */
    static readonly Noun_Trait = POS.Noun.addClass("trait", 1090);

    static readonly Pronoun = new PartOfSpeech("pronoun", 2000);
    /** Used instead of a noun, to avoid repeating the noun. (Examples: I, you, he, she, it, we, they) */
    static readonly Pronoun_Subject = POS.Pronoun.addClass("subject", 2010);
    /** Used instead of a noun, to avoid repeating the noun. (Examples: mine, yours, his, hers, theirs) */
    static readonly Pronoun_Possessive = POS.Pronoun.addClass("possessive", 2020);
    /** For question such as "Who", "What",  */
    static readonly Pronoun_Question = POS.Pronoun.addClass("question", 2030);

    /** A word that describes a noun. It tells you something about the noun. (Examples: big, yellow, thin, amazing, beautiful, quick, important) */
    static readonly Adjective = new PartOfSpeech("adjective", 3000);
    /** A word that describes a noun. It tells you something about the noun. (Examples: big, yellow, thin, amazing, beautiful, quick, important) */
    static readonly Adjective_Trait = POS.Adjective.addClass("trait", 3010);

    /** A word which describes an action (doing something) or a state (being something). (Examples: walk, talk, think, believe, live, like, want) */
    static readonly Verb = new PartOfSpeech("verb", 4000);
    /** A word that describes an action, such as "running", or "flying", etc. */
    static readonly Verb_Action = POS.Verb.addClass("action", 4010);
    /** A word that describes a relation, such as "is", "are", "to be", etc. */
    static readonly Verb_Is = POS.Verb.addClass("is", 4020);
    /** A word that describes a state, such as "becoming", etc. */
    static readonly Verb_State = POS.Verb.addClass("state", 4030);
    /** A word that describes an occurrence, such as "happening", etc. */
    static readonly Verb_Occurrence = POS.Verb.addClass("occurrence", 4040);
    /** Words meaning "to be able or permitted to", such as "they can run fast", "we can if you like", etc. */
    static readonly Verb_AbleToOrPermitted = POS.Verb.addClass("abletoorpermitted", 4050);

    /**
    /// A word which usually describes a verb. It tells you how something is done. It may also tell you when or where
    /// something happened. (Examples: slowly, intelligently, well, yesterday, tomorrow, here, everywhere)
    */
    static readonly Adverb = new PartOfSpeech("adverb", 5000);
    /** For questions, such as "When", "Where", "Why", etc. */
    static readonly Adverb_Question = POS.Adverb.addClass("question", 5010);

    static readonly Preposition = new PartOfSpeech("preposition", 6000);
    /** A word relating to a positional location. */
    static readonly Preposition_Spatial = POS.Preposition.addClass("spatial", 6010);
    /** A word relating to directional movement. */
    static readonly Preposition_Directional = POS.Preposition.addClass("directional", 6020);
    /** A word relating to the final destination or appointed end. Example: "Sentenced to jail" */
    static readonly Preposition_End = POS.Preposition.addClass("end", 6030);
    /** A word relating to time. */
    static readonly Preposition_Temporal = POS.Preposition.addClass("temporal", 6040);
    /** A word meaning "in support of". */
    static readonly Preposition_Supporting = POS.Preposition.addClass("supporting", 6050);
    /** A word meaning "on behalf of". */
    static readonly Preposition_Onbehalf = POS.Preposition.addClass("onbehalf", 6060);
    /** A word that applies an action towards something. Example: "be nice to him" */
    static readonly Preposition_Towards = POS.Preposition.addClass("towards", 6070);
    /** A word indicating an amount or degree of something. Example: at great speed; at high altitudes. */
    static readonly Preposition_Amount = POS.Preposition.addClass("amount", 6080); /* or degree */
    /** A word indicating an occupation or involvement. Example: "He's hard at work", "The issues at play" */
    static readonly Preposition_Involvement = POS.Preposition.addClass("involvement", 6090);
    /** A word indicating the condition of something. Example: "He's at peace", "She's at ease" */
    static readonly Preposition_State = POS.Preposition.addClass("state", 6100);
    /** A word expressing contact on, against, beside, or upon something. Example: "Apply varnish to the surface" */
    static readonly Preposition_Contact = POS.Preposition.addClass("contact", 6110);
    /** A word expressing aim, purpose, or intention. Example: "going to the rescue" */
    static readonly Preposition_Intention = POS.Preposition.addClass("intention", 6120);
    /** A word expressing use of an item. Example: "eating with a fork" */
    static readonly Preposition_Using = POS.Preposition.addClass("using", 6130);
    /** A word expressing one item with another. Example: "spaghetti with meatballs" */
    static readonly Preposition_Including = POS.Preposition.addClass("including", 6140);

    static readonly Determiner = new PartOfSpeech("determiner", 7000); /* AKA: "article" */
    /** Used to introduce a noun. (Examples: the, a, an, every, all) */
    static readonly Determiner_Definite = POS.Determiner.addClass("definite", 7010);
    /**Non-specific article.*/
    static readonly Determiner_Indefinite = POS.Determiner.addClass("indefinite", 7020);

    /** Joins two words, phrases or sentences together. (Examples: but, so, and, because, or) */
    static readonly Conjunction = new PartOfSpeech("conjunction", 8000);
    /** An unusual kind of word, because it often stands alone. Interjections are words which express emotion or surprise, and they are usually followed by exclamation marks. (Examples: Ouch!, Hello!, Hurray!, Oh no!, Ha!) */
    static readonly Interjection = new PartOfSpeech("interjection", 9000);
    /** "Yes.", "No.", "Help!", etc. */
    static readonly Exclamation = new PartOfSpeech("exclamation", 10000);
    /**
    /// Used to show purpose, intention, result, cause, desired action, reports or status, or one action following another.
    /// Details: Infinitive markers are function words that distinguish the base forms from the infinitive forms of English
    /// verbs. Function words are words that perform definite grammatical functions but that lack definite lexical meaning.
    /// Read more at http://www.linguisticsgirl.com/the-infinitive-marker-in-english-grammar/#84KDCvODiCcW2r8q.99
    */
    static readonly InfinitiveMarker = new PartOfSpeech("infinitiveMarker", 110000);  // (examples: http://www.oxfordlearnersdictionaries.com/definition/english/to_2)

    /** A numerical value. */
    static readonly Numeric = new PartOfSpeech("numeric", 12000);
    /** A currency value. */
    static readonly Numeric_currency = POS.Numeric.addClass("currency", 12010);

    /** A date reference. */
    static readonly Date = new PartOfSpeech("date", 13000);
    /** A time reference. */
    static readonly Time = new PartOfSpeech("time", 13100);
    /** A date and/or time reference. */
    static readonly Datetime = new PartOfSpeech("datetime", 13200);
}

// ========================================================================================================================
// Sources: http://web2.uvcs.uvic.ca/elc/studyzone/330/grammar/parts.htm; and Google definitions. ;)
// ========================================================================================================================

