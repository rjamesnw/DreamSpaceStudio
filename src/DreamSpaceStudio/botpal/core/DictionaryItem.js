"use strict";
// ========================================================================================================================
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __textPart, __usages;
Object.defineProperty(exports, "__esModule", { value: true });
const TimeReferencedObject_1 = require("./TimeReferencedObject");
const TextPart_1 = require("./TextPart");
const Dictionary_1 = require("./Dictionary");
const Enums_1 = require("./Enums");
/**
 * A dictionary item is a map of text to its use in some context.
 */
class DictionaryItem extends TimeReferencedObject_1.default {
    constructor(a, ...args) {
        var _a, _b, _c;
        super();
        __textPart.set(this, void 0);
        this._ConceptContexts = [];
        /**
         Holds a reference to all contexts where this entry is associated with.
         This is only relevant for contexts committed to memory and not during processing.
        */
        __usages.set(this, []);
        if (typeof a != 'object' || !(a instanceof Dictionary_1.default || a instanceof TextPart_1.default || a instanceof String))
            throw DS.Exception.argumentRequired('DictionaryItem.create()', "'Dictionary' or 'TextPart' instance expected as the first parameter.");
        var i = a instanceof Dictionary_1.default ? 1 : 0;
        this.dictionary = i == 1 ? a : null; // (note: this can be null for temp items not yet added)
        __classPrivateFieldSet(// (note: this can be null for temp items not yet added)
        this, __textPart, arguments[i] instanceof TextPart_1.default ? arguments[i] : new TextPart_1.default(this, DS.StringUtils.toString(arguments[i]))); // (note: this can be null due to wildcards in concept patterns)
        this.pos = (_a = arguments[i + 1]) !== null && _a !== void 0 ? _a : null;
        this.tenseType = (_b = arguments[i + 2]) !== null && _b !== void 0 ? _b : Enums_1.TenseTypes.Unspecified;
        this.plurality = (_c = arguments[i + 3]) !== null && _c !== void 0 ? _c : Enums_1.Plurality.Unspecified;
    }
    get memory() { var _a; return (_a = this.dictionary) === null || _a === void 0 ? void 0 : _a.memory; }
    /**
     * A text part instance that relates to this dictionary item.
     */
    get textPart() { return __classPrivateFieldGet(this, __textPart); }
    get key() { var _a; return DictionaryItem.createKey((_a = __classPrivateFieldGet(this, __textPart)) === null || _a === void 0 ? void 0 : _a.groupKey, this.pos, this.tenseType, this.plurality); }
    static createKey(groupkey, pos, tense, plurality) {
        var key = groupkey !== null && groupkey !== void 0 ? groupkey : "";
        if (pos != null)
            key += pos;
        if (tense != Enums_1.TenseTypes.Unspecified)
            key += tense;
        if (plurality != Enums_1.Plurality.Unspecified)
            key += plurality;
        return key;
    }
    /**
     * Enumerates over all concepts associated with this dictionary item.
     */
    conceptContexts() { return this._ConceptContexts; }
    get usageCount() { var _a; return ((_a = __classPrivateFieldGet(this, __usages)) === null || _a === void 0 ? void 0 : _a.length) || 0; }
    /**
     * A list of entries that mean the same or similar thing as this entry.
     */
    get synonyms() { return this._synonyms && [...this._synonyms.values()] || []; }
    get usageFactor() { return this._usageFactor; }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Returns true if the part of speech (POS) associated with this dictionary item is a sub-class (relation) of the given POS.
     */
    classOf(pos) { var _a, _b; return (_b = (_a = this.pos) === null || _a === void 0 ? void 0 : _a.classOf(pos)) !== null && _b !== void 0 ? _b : (pos == null); }
    // --------------------------------------------------------------------------------------------------------------------
    get Definitions() { return this._definitions; }
    /**
     * Triggers loading definitions for this dictionary entry.
     */
    async getDefinitions() {
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
    addSynonymReference(entry) {
        if (!entry)
            throw DS.Exception.invalidArgument("DictionaryItem.addSynonymReference()", "entry");
        if (this._synonyms == null) {
            this._synonyms = new Map();
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
    removeSynonymReference(entry) {
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
    isSynonym(textPartOrEntry) {
        var _a, _b, _c;
        if (textPartOrEntry instanceof DictionaryItem)
            return (_b = (_a = this._synonyms) === null || _a === void 0 ? void 0 : _a.has(textPartOrEntry === null || textPartOrEntry === void 0 ? void 0 : textPartOrEntry.key)) !== null && _b !== void 0 ? _b : false;
        if (this._synonyms != null)
            for (var s of this._synonyms.values())
                if (DS.StringUtils.compare((_c = __classPrivateFieldGet(s, __textPart)) === null || _c === void 0 ? void 0 : _c.text, textPartOrEntry) == 0)
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
    addConceptHandler(handler) {
        throw DS.Exception.notImplemented("addConceptHandler");
        //var i = this.indexOfConceptContext(handler);
        //var cctx: ConceptContext;
        //if (i == -1) {
        //    cctx = new ConceptContext(this, handler);
        //    this._ConceptContexts.Add(cctx);
        //}
        //else cctx = this._ConceptContexts[i];
        //return cctx;
    }
    /**
     *  Find the index of a concept context given the concept and a handler delegate on that context.
    */
    indexOfConceptContext(handler) {
        throw DS.Exception.notImplemented("indexOfConceptContext");
        //for (var i = 0, n = this._ConceptContexts.length; i < n; ++i)
        //    if (this._ConceptContexts[i].Handler == handler)
        //        return i;
        //return -1;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
        Returns true if this entry matches an entry reference with the same context properties.
        WARNING: If compared with a string of text only, this will not take parts of speech into account (nouns, verbs, etc.).
    */
    equals(obj) {
        var _a, _b;
        if (obj == this)
            return true;
        if (typeof obj == 'string' && this.textPart.equals(obj))
            return true;
        if (!(obj instanceof DictionaryItem))
            return false;
        return this.key == obj.key && ((_b = (_a = this.pos) === null || _a === void 0 ? void 0 : _a.equals(obj.pos)) !== null && _b !== void 0 ? _b : false)
            && this.tenseType == obj.tenseType
            && this.plurality == obj.plurality;
    }
    toString() { var _a; return ((_a = __classPrivateFieldGet(this, __textPart)) === null || _a === void 0 ? void 0 : _a.text) + ": " + this.pos + ", " + this.tenseType + ", " + this.plurality; }
}
exports.default = DictionaryItem;
__textPart = new WeakMap(), __usages = new WeakMap();
// ========================================================================================================================
//# sourceMappingURL=DictionaryItem.js.map