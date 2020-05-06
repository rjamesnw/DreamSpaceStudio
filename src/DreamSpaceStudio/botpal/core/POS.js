"use strict";
// ========================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartOfSpeech = void 0;
let PartOfSpeech = /** @class */ (() => {
    class PartOfSpeech {
        constructor(name, id, classification = null) {
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
        get classification() { return this._classification; }
        addClass(classification, id) {
            return new PartOfSpeech(this._name, id, classification);
        }
        /**
         Returns true if this part of speech (POS) is a sub-class of the given POS.
        */
        classOf(pos) { return pos != null && pos._name == this._name; }
        toString() { return this._name + (this._classification != null ? "_" + this._classification : ""); }
        /**
         Returns true if this part of speech (POS) matches another.
         <para>It's important to note that a non-classified POS (ie simply "Noun") will always match a classified POS (ie "Noun->Person");
         however, comparing two classified POS that are different classes will not match, even if the POS names are the same.</para>
        */
        equals(pos) {
            return this == pos || this && pos && this._name == pos._name && (pos._classification == null || this._classification == null || this._classification == pos._classification);
            // (match if: references are equal, or both are not null and the names match, and: one classification is not specified [base match], or both classifications [sub-type/specialization] are the same)
        }
    }
    PartOfSpeech._posRootIndex = new Map();
    PartOfSpeech._posNamedIndex = new Map();
    PartOfSpeech._posIndex = new Map();
    PartOfSpeech._lastPOSID = 0;
    return PartOfSpeech;
})();
exports.PartOfSpeech = PartOfSpeech;
/**
 *  Part-of-speech word assignment categories describing word syntactic functions.
*/
let POS = /** @class */ (() => {
    class POS {
    }
    /**
     *      The 100 series represent groups.  For example, when creating a thought graph, 'Pronoun_Question' and
     *      'Adverb_Question' can be grouped together under a shared POS type.  Another example may be "me and john" where the
     *      pronoun and noun become grouped. Groups can be viewed as root nodes to the details under them.
    */
    POS.Group = new PartOfSpeech("group", 100);
    POS.Group_Question = POS.Group.addClass("question", 110); // (usually pronoun or adverb)
    POS.Group_Subject = POS.Group.addClass("subject", 120); // (usually nouns)
    POS.Group_Attribute = POS.Group.addClass("attribute", 130); // (usually adjectives)
    POS.Group_Modifier = POS.Group.addClass("modifier", 140); // (usually adverbs)
    /** A person, place, thing, idea, living creature, quality, or action. (Examples: cowboy, theater, box, thought, tree, kindness, arrival) */
    POS.Noun = new PartOfSpeech("noun", 1000);
    /** A word representing a person. */
    POS.Noun_Person = POS.Noun.addClass("person", 1010);
    /** A word representing a place. */
    POS.Noun_Place = POS.Noun.addClass("place", 1020);
    /** A word representing a living thing. */
    POS.Noun_Creature = POS.Noun.addClass("creature", 1030);
    /** A word representing a tangible object. */
    POS.Noun_Object = POS.Noun.addClass("object", 1040);
    /** A word representing a quality or feeling. Example: "He expressed his gratitude" */
    POS.Noun_Quality_Or_Feeling = POS.Noun.addClass("quality_or_feeling", 1050);
    /** A word representing an action noun. Example: "He gave thanks" */
    POS.Noun_Action = POS.Noun.addClass("action", 1060);
    /** A word representing a noun related to time. Example: "traveling through space and time" */
    POS.Noun_Temporal = POS.Noun.addClass("temporal", 1070);
    /** A word representing a noun related to positioning. Example: "a location or address in computer memory" */
    POS.Noun_Spatial = POS.Noun.addClass("spatial", 1080);
    /** The name of a trait or material state. */
    POS.Noun_Trait = POS.Noun.addClass("trait", 1090);
    POS.Pronoun = new PartOfSpeech("pronoun", 2000);
    /** Used instead of a noun, to avoid repeating the noun. (Examples: I, you, he, she, it, we, they) */
    POS.Pronoun_Subject = POS.Pronoun.addClass("subject", 2010);
    /** Used instead of a noun, to avoid repeating the noun. (Examples: mine, yours, his, hers, theirs) */
    POS.Pronoun_Possessive = POS.Pronoun.addClass("possessive", 2020);
    /** For question such as "Who", "What",  */
    POS.Pronoun_Question = POS.Pronoun.addClass("question", 2030);
    /** A word that describes a noun. It tells you something about the noun. (Examples: big, yellow, thin, amazing, beautiful, quick, important) */
    POS.Adjective = new PartOfSpeech("adjective", 3000);
    /** A word that describes a noun. It tells you something about the noun. (Examples: big, yellow, thin, amazing, beautiful, quick, important) */
    POS.Adjective_Trait = POS.Adjective.addClass("trait", 3010);
    /** A word which describes an action (doing something) or a state (being something). (Examples: walk, talk, think, believe, live, like, want) */
    POS.Verb = new PartOfSpeech("verb", 4000);
    /** A word that describes an action, such as "running", or "flying", etc. */
    POS.Verb_Action = POS.Verb.addClass("action", 4010);
    /** A word that describes a relation, such as "is", "are", "to be", etc. */
    POS.Verb_Is = POS.Verb.addClass("is", 4020);
    /** A word that describes a state, such as "becoming", etc. */
    POS.Verb_State = POS.Verb.addClass("state", 4030);
    /** A word that describes an occurrence, such as "happening", etc. */
    POS.Verb_Occurrence = POS.Verb.addClass("occurrence", 4040);
    /** Words meaning "to be able or permitted to", such as "they can run fast", "we can if you like", etc. */
    POS.Verb_AbleToOrPermitted = POS.Verb.addClass("abletoorpermitted", 4050);
    /**
     *  A word which usually describes a verb. It tells you how something is done. It may also tell you when or where
     *  something happened. (Examples: slowly, intelligently, well, yesterday, tomorrow, here, everywhere)
    */
    POS.Adverb = new PartOfSpeech("adverb", 5000);
    /** For questions, such as "When", "Where", "Why", etc. */
    POS.Adverb_Question = POS.Adverb.addClass("question", 5010);
    POS.Preposition = new PartOfSpeech("preposition", 6000);
    /** A word relating to a positional location. */
    POS.Preposition_Spatial = POS.Preposition.addClass("spatial", 6010);
    /** A word relating to directional movement. */
    POS.Preposition_Directional = POS.Preposition.addClass("directional", 6020);
    /** A word relating to the final destination or appointed end. Example: "Sentenced to jail" */
    POS.Preposition_End = POS.Preposition.addClass("end", 6030);
    /** A word relating to time. */
    POS.Preposition_Temporal = POS.Preposition.addClass("temporal", 6040);
    /** A word meaning "in support of". */
    POS.Preposition_Supporting = POS.Preposition.addClass("supporting", 6050);
    /** A word meaning "on behalf of". */
    POS.Preposition_Onbehalf = POS.Preposition.addClass("onbehalf", 6060);
    /** A word that applies an action towards something. Example: "be nice to him" */
    POS.Preposition_Towards = POS.Preposition.addClass("towards", 6070);
    /** A word indicating an amount or degree of something. Example: at great speed; at high altitudes. */
    POS.Preposition_Amount = POS.Preposition.addClass("amount", 6080); /* or degree */
    /** A word indicating an occupation or involvement. Example: "He's hard at work", "The issues at play" */
    POS.Preposition_Involvement = POS.Preposition.addClass("involvement", 6090);
    /** A word indicating the condition of something. Example: "He's at peace", "She's at ease" */
    POS.Preposition_State = POS.Preposition.addClass("state", 6100);
    /** A word expressing contact on, against, beside, or upon something. Example: "Apply varnish to the surface" */
    POS.Preposition_Contact = POS.Preposition.addClass("contact", 6110);
    /** A word expressing aim, purpose, or intention. Example: "going to the rescue" */
    POS.Preposition_Intention = POS.Preposition.addClass("intention", 6120);
    /** A word expressing use of an item. Example: "eating with a fork" */
    POS.Preposition_Using = POS.Preposition.addClass("using", 6130);
    /** A word expressing one item with another. Example: "spaghetti with meatballs" */
    POS.Preposition_Including = POS.Preposition.addClass("including", 6140);
    POS.Determiner = new PartOfSpeech("determiner", 7000); /* AKA: "article" */
    /** Used to introduce a noun. (Examples: the, a, an, every, all) */
    POS.Determiner_Definite = POS.Determiner.addClass("definite", 7010);
    /**Non-specific article.*/
    POS.Determiner_Indefinite = POS.Determiner.addClass("indefinite", 7020);
    /** Joins two words, phrases or sentences together. (Examples: but, so, and, because, or) */
    POS.Conjunction = new PartOfSpeech("conjunction", 8000);
    /** An unusual kind of word, because it often stands alone. Interjections are words which express emotion or surprise, and they are usually followed by exclamation marks. (Examples: Ouch!, Hello!, Hurray!, Oh no!, Ha!) */
    POS.Interjection = new PartOfSpeech("interjection", 9000);
    /** "Yes.", "No.", "Help!", etc. */
    POS.Exclamation = new PartOfSpeech("exclamation", 10000);
    /**
     *  Used to show purpose, intention, result, cause, desired action, reports or status, or one action following another.
     *  Details: Infinitive markers are function words that distinguish the base forms from the infinitive forms of English
     *  verbs. Function words are words that perform definite grammatical functions but that lack definite lexical meaning.
     *  Read more at http://www.linguisticsgirl.com/the-infinitive-marker-in-english-grammar/#84KDCvODiCcW2r8q.99
    */
    POS.InfinitiveMarker = new PartOfSpeech("infinitiveMarker", 110000); // (examples: http://www.oxfordlearnersdictionaries.com/definition/english/to_2)
    /** A numerical value. */
    POS.Numeric = new PartOfSpeech("numeric", 12000);
    /** A currency value. */
    POS.Numeric_currency = POS.Numeric.addClass("currency", 12010);
    /** A date reference. */
    POS.Date = new PartOfSpeech("date", 13000);
    /** A time reference. */
    POS.Time = new PartOfSpeech("time", 13100);
    /** A date and/or time reference. */
    POS.Datetime = new PartOfSpeech("datetime", 13200);
    return POS;
})();
exports.default = POS;
// ========================================================================================================================
// Sources: http://web2.uvcs.uvic.ca/elc/studyzone/330/grammar/parts.htm; and Google definitions. ;)
// ========================================================================================================================
//# sourceMappingURL=POS.js.map