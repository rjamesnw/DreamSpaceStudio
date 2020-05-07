// ========================================================================================================================

import Memory, { IMemoryObject } from "./Memory";
import TimeReferencedObject from "./TimeReferencedObject";
import TextPart from "./TextPart";
import Dictionary from "./Dictionary";
import { PartOfSpeech } from "./POS";
import { TenseTypes, Plurality } from "./Enums";
import { bool } from "aws-sdk/clients/signer";
import { IEquality } from "./Comparer";
import { ConceptHandler } from "./Concept";
import Context from "./Context";

/**
 A dictionary item is a map of text to its use in some context.
*/
export default class DictionaryItem extends TimeReferencedObject implements IMemoryObject, IEquality {
    // --------------------------------------------------------------------------------------------------------------------

    readonly dictionary: Dictionary;

    get memory(): Memory { return this.dictionary?.memory; }

    /**
     A text part instance that relates to this dictionary item.
    */
    get textPart(): TextPart { return this.#_textPart; }
    #_textPart: TextPart;

    /**
     The grammar type for the underlying word for this map.  It is used to complete the expected grammar types needed by
     other concepts waiting for resolution.
    */
    pos: PartOfSpeech;

    /**
     The tense type for the underlying word for this map.
    */
    tenseType: TenseTypes;

    /**
     The plurality for the underlying word for this map.
    */
    plurality: Plurality;

    get key(): string { return DictionaryItem.createKey(this.#_textPart?.groupKey, this.pos, this.tenseType, this.plurality); }

    static createKey(groupkey: string, pos: PartOfSpeech, tense: TenseTypes, plurality: Plurality): string {
        var key = groupkey ?? "";
        if (pos != null) key += pos;
        if (tense != TenseTypes.Unspecified) key += tense;
        if (plurality != Plurality.Unspecified) key += plurality;
        return key;
    }

    /**
     Enumerates over all concepts associated with this dictionary item.
    */
    conceptContexts(): Iterable<Context> { return this._ConceptContexts; }
    protected _ConceptContexts: Context[] = [];

    ///**
    // Holds a reference to all contexts where this entry is associated with.
    // This is only relevant for contexts committed to memory and not during processing.
    //*/
    //#_usages: Context[] = [];

    /**
     A list of entries that mean the same or similar thing as this entry.
    */
    get synonyms(): DictionaryItem[] { return this._synonyms && [...this._synonyms.values()] || []; }
    _synonyms: Map<string, DictionaryItem>;

    get usageFactor(): number { return this._usageFactor; }
    private _usageFactor: number;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(dictionary: Dictionary, textPart: TextPart | string, pos?: PartOfSpeech, tense?: TenseTypes, plurality?: Plurality);
    constructor(textPart: TextPart | string, pos?: PartOfSpeech, tense?: TenseTypes, plurality?: Plurality);
    constructor(a: any, ...args: any[]) {
        super();
        if (typeof a != 'object' || !(a instanceof Dictionary || a instanceof TextPart || a instanceof String))
            throw DS.Exception.argumentRequired('DictionaryItem.create()', "'Dictionary' or 'TextPart' instance expected as the first parameter.");
        var i = a instanceof Dictionary ? 1 : 0;
        this.dictionary = i == 1 ? a : null; // (note: this can be null for temp items not yet added)
        this.#_textPart = arguments[i] instanceof TextPart ? arguments[i] : new TextPart(this, DS.StringUtils.toString(arguments[i])); // (note: this can be null due to wildcards in concept patterns)
        this.pos = arguments[i + 1] ?? null;
        this.tenseType = arguments[i + 2] ?? TenseTypes.Unspecified;
        this.plurality = arguments[i + 3] ?? Plurality.Unspecified;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Returns true if the part of speech (POS) associated with this dictionary item is a sub-class (relation) of the given POS.
     */
    classOf(pos: PartOfSpeech) { return this.pos?.classOf(pos) ?? (pos == null); }

    // --------------------------------------------------------------------------------------------------------------------

    get Definitions(): string[] { return this._definitions; }
    private _definitions: string[]

    /**
     * Triggers loading definitions for this dictionary entry.
     */
    async getDefinitions(): Promise<void> {
        return null;
        //if (this.Definitions == null) {
        //    var url = "http://api.inossis.com/words/definition/" + TextPart.Text;

        //    // ... quick check if a task already exists; if so, return it so we don't do this many times for the same request ...

        //    var existingBT = this.Memory.Brain.GetTask(nameof(this.GetDefinitions), url);
        //    if (existingBT != null) return existingBT;

        //    // ... there are no other requests, so continue; first get exclusive rights to add this task ...

        //    // ... check again to see if another thread beat us to it ...

        //    existingBT = this.Memory.Brain.GetTask(nameof(this.GetDefinitions), url);
        //    if (existingBT != null) return existingBT;

        //    // ... still nothing, so lets create a new request ...

        //    async function action() {
        //        var response = await DS.IO.get<string>(url);
        //        var defs = DS.Data.JSON.toObject<{ [i: number]: { word: string, definition: string } }>(response);

        //        for (var obj of jarray)
        //            defs.Add(obj["text"]);

        //        this.Definitions = defs;
        //    }

        //    // await action();
        //    return this.Memory.Brain.CreateTask(action).Start();
        //}
        //else return this.Memory.Brain.CreateEmptyTask();
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Adds a synonym entry.
     * @param DictionaryItem entry
     * @returns The entry added, or the existing entry in the list if one already exists.
     */
    addSynonymReference(entry: DictionaryItem): DictionaryItem {
        if (!entry)
            throw DS.Exception.invalidArgument("DictionaryItem.addSynonymReference()", "entry");
        if (this._synonyms == null) {
            this._synonyms = new Map<string, DictionaryItem>();
            this._synonyms.set(entry.key, entry);
        }
        else {
            var _entry = this._synonyms.get(entry.key);
            if (!_entry)
                this._synonyms.set(entry.key, entry);
            else
                _entry = entry;
        }
        return entry;
    }

    /**
     Removes a synonym entry. Returns false if the item was not found.
    */
    removeSynonymReference(entry: DictionaryItem): boolean {
        if (!entry)
            throw DS.Exception.invalidArgument("DictionaryItem.removeSynonymReference()", "entry");
        if (this._synonyms != null)
            return this._synonyms.delete(entry.key);
        else
            return false;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * IF a DictionaryItem, returns true if the given entry is a synonym of this entry.
     * If a string, returns true if this part of text matches a synonym with the same text in the associated synonym list (without case sensitivity).
     * @param {string | DictionaryItem} textPartOrEntry A part of parsed text, usually without whitespace, but may be a phrase of text as well.
     * @returns True if the given text part or dictionary entry matches an associated synonym, and false otherwise.
     */
    isSynonym(textPartOrEntry: string | DictionaryItem): boolean {
        if (textPartOrEntry instanceof DictionaryItem)
            return this._synonyms?.has(textPartOrEntry?.key) ?? false;
        if (this._synonyms != null)
            for (var s of this._synonyms.values())
                if (DS.StringUtils.compare(s.#_textPart?.text, textPartOrEntry) == 0)
                    return true;
        return false;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Add a concept handler that should be associated with this dictionary item. When user input is parsed, any text parts
     *  matching this dictionary item will cause the associated handlers to be trigger to handle it.
    */
    /// <param name="handler">A concept handler delegate to store for this dictionary item.  The delegate reference also
    /// holds a target reference to the concept singleton, which is why it is not required for this method.</param>
    /// <returns></returns>
    addConceptHandler(handler: ConceptHandler): ConceptContext {
        var i = this.indexOfConceptContext(handler);
        var cctx: ConceptContext;

        if (i == -1) {
            cctx = new ConceptContext(this, handler);
            this._ConceptContexts.Add(cctx);
        }
        else cctx = this._ConceptContexts[i];

        return cctx;
    }

    /**
     *  Find the index of a concept context given the concept and a handler delegate on that context.
    */
    indexOfConceptContext(handler: ConceptHandler): number {
        for (var i = 0, n = this._ConceptContexts.length; i < n; ++i)
            if (this._ConceptContexts[i].Handler == handler)
                return i;
        return -1;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
        Returns true if this entry matches an entry reference with the same context properties.
        WARNING: If compared with a string of text only, this will not take parts of speech into account (nouns, verbs, etc.).
    */
    equals(obj: DictionaryItem | TextPart | string): boolean {
        if (obj == this) return true;
        if (typeof obj == 'string' && this.textPart.equals(obj)) return true;
        if (!(obj instanceof DictionaryItem)) return false;
        return this.key == obj.key && (this.pos?.equals(obj.pos) ?? false)
            && this.tenseType == obj.tenseType
            && this.plurality == obj.plurality;
    }

    toString(): string { return this.#_textPart?.text + ": " + this.pos + ", " + this.tenseType + ", " + this.plurality; }
    //public override int GetHashCode() => ToString().GetHashCode();

    // --------------------------------------------------------------------------------------------------------------------
}

// ========================================================================================================================
