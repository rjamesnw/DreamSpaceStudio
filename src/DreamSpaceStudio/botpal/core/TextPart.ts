import Memory, { IMemoryObject } from "./Memory";
import TimeReferencedObject from "./TimeReferencedObject";

/**
 Represents simple text entered by the user.  Text elements also contain a 'Key' property that is based on a lowercase
 representation of the text for quick and unique likeness comparison.
 
 The text in this instance is the ONLY place the text should exist in memory.  All other object instances usually reference this object, or
 a dictionary word that references this object. The text is NOT stored per context, and in fact a single string of characters may span may referenced contexts.
*/
export default class TextPart extends TimeReferencedObject implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    readonly parent: IMemoryObject;

    get memory(): Memory { return this.parent?.memory; }

    /**
     The raw text for this text part.
    */
    get text(): string { return this.#_text; };
    protected set _Text(value: string) { if (this.#_text != value) { this.#_text = value; this.#_textParts = null; this.#_key = null; } }
    #_text: string;

    get textParts(): string[] { return this.#_textParts ?? (this.#_textParts = this.parent.memory.Brain.parse(this.#_text)); }
    #_textParts: string[];

    /**
     A case sensitive key used to identify the precise text entered by the user, without the whitespace.
    */
    get key(): string { return this.#_key ?? (this.#_key = this.parent.memory.Brain.getKeyFromTextParts(this.textParts)); }
    #_key: string;

    /**
     If true, the text part had preceding whitespace (for example, certain sentence punctuation symbols like '.', '?', and '!').
     This is handy when dealing with an array of separated text parts that may need to be rejoined later on when analyzing text.
    */
    readonly hadPrecedingWhitespace: boolean;

    // --------------------------------------------------------------------------------------------------------------------

    /**
     A grouping key to identify all similar texts without considering case sensitivity.
     This can be used to group text that is different only based on case sensitivity, or that of characters which "look" similar.
    */
    get groupKey(): string { return this.memory.Brain.keyToGroupKey(this.key); }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     Creates a new text part class that wraps part of text parsed from user input.
    */
    /// <param name="parent">The memory object to associate with.</param>
    /// <param name="text">The text to wrap.  Note that this text will be trimmed if any whitespace exists on either end.</param>
    /// <param name="hadPrecedingWhitespace">True if the text had preceding whitespace when parsed.  If false, and the given text
    /// has preceding whitespace, then the text will be trimmed and true will be assumed.</param>
    constructor(parent: IMemoryObject, text: string, hadPrecedingWhitespace = false) {
        super();

        if (!parent || !(parent.memory))
            throw DS.Exception.invalidArgument('TextPart.constructor()', 'parent', parent);

        this.parent = parent;

        if (DS.StringUtils.isEmptyOrWhitespace(text))
            throw DS.Exception.argumentRequired('TextPart.constructor()', 'text', <any>text, "'text' cannot be null or empty.");

        if (!hadPrecedingWhitespace) hadPrecedingWhitespace = text[0] == ' ';

        this.#_text = text.trim();

        this.hadPrecedingWhitespace = hadPrecedingWhitespace;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Returns true if the given text part or string is an exact match to the underlying text for this text part.
     * @param {TextPart | string} value
     * @returns
     */
    equals(value: TextPart | string): boolean {
        if (value == this) return true;
        if (value instanceof TextPart) return value.key == this.key;
        if (!this && value == null) return true;
        if (!this || value == null) return false; // (if any is null, then the other isn't, so this fails also)
        if (typeof value !== 'string') return false;
        var tp = new TextPart(this.memory, value);
        return this.key == tp.key;
    }

    /**
     * Returns true if the given text part or string is a close match to the underlying text for this text part.
     * This comparison uses the group key, which is used for grouping texts that are different only by letter case.
     * @param {TextPart | string} value
     * @returns
     */
    similar(value: TextPart | string): boolean {
        if (value == this) return true;
        if (value instanceof TextPart) return value.groupKey == this.groupKey;
        if (!this && value == null) return true;
        if (!this || value == null) return false; // (if any is null, then the other isn't, so this fails also)
        if (typeof value !== 'string') return false;
        var tp = new TextPart(this.memory, value);
        return this.groupKey == tp.groupKey;
    }

    //public override int GetHashCode() {
    //    return GroupKey.GetHashCode();
    //}

    toString(): string {
        return this.text + " [" + this.groupKey + "]";
    }
}