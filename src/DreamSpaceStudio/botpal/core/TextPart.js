"use strict";
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
var __text, __textParts, __key;
Object.defineProperty(exports, "__esModule", { value: true });
const TimeReferencedObject_1 = require("./TimeReferencedObject");
/**
 Represents simple text entered by the user.  Text elements also contain a 'Key' property that is based on a lowercase
 representation of the text for quick and unique likeness comparison.
 
 The text in this instance is the ONLY place the text should exist in memory.  All other object instances usually reference this object, or
 a dictionary word that references this object. The text is NOT stored per context, and in fact a single string of characters may span may referenced contexts.
*/
class TextPart extends TimeReferencedObject_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    /**
     Creates a new text part class that wraps part of text parsed from user input.
    */
    /// <param name="parent">The memory object to associate with.</param>
    /// <param name="text">The text to wrap.  Note that this text will be trimmed if any whitespace exists on either end.</param>
    /// <param name="hadPrecedingWhitespace">True if the text had preceding whitespace when parsed.  If false, and the given text
    /// has preceding whitespace, then the text will be trimmed and true will be assumed.</param>
    constructor(parent, text, hadPrecedingWhitespace = false) {
        super();
        __text.set(this, void 0);
        __textParts.set(this, void 0);
        __key.set(this, void 0);
        if (!parent || !(parent.memory))
            throw DS.Exception.invalidArgument('TextPart.constructor()', 'parent', parent);
        this.parent = parent;
        if (DS.StringUtils.isEmptyOrWhitespace(text))
            throw DS.Exception.argumentRequired('TextPart.constructor()', 'text', text, "'text' cannot be null or empty.");
        if (!hadPrecedingWhitespace)
            hadPrecedingWhitespace = text[0] == ' ';
        __classPrivateFieldSet(this, __text, text.trim());
        this.hadPrecedingWhitespace = hadPrecedingWhitespace;
    }
    get memory() { var _a; return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.memory; }
    /**
     The raw text for this text part.
    */
    get text() { return __classPrivateFieldGet(this, __text); }
    ;
    set _Text(value) { if (__classPrivateFieldGet(this, __text) != value) {
        __classPrivateFieldSet(this, __text, value);
        __classPrivateFieldSet(this, __textParts, null);
        __classPrivateFieldSet(this, __key, null);
    } }
    get textParts() { var _a; return (_a = __classPrivateFieldGet(this, __textParts)) !== null && _a !== void 0 ? _a : (__classPrivateFieldSet(this, __textParts, this.parent.memory.brain.parse(__classPrivateFieldGet(this, __text)))); }
    /**
     A case sensitive key used to identify the precise text entered by the user, without the whitespace.
    */
    get key() { var _a; return (_a = __classPrivateFieldGet(this, __key)) !== null && _a !== void 0 ? _a : (__classPrivateFieldSet(this, __key, this.parent.memory.brain.getKeyFromTextParts(this.textParts))); }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     A grouping key to identify all similar texts without considering case sensitivity.
     This can be used to group text that is different only based on case sensitivity, or that of characters which "look" similar.
    */
    get groupKey() { return this.memory.brain.keyToGroupKey(this.key); }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     * Returns true if the given text part or string is an exact match to the underlying text for this text part.
     * @param {TextPart | string} value
     * @returns
     */
    equals(value) {
        if (value == this)
            return true;
        if (value instanceof TextPart)
            return value.key == this.key;
        if (!this && value == null)
            return true;
        if (!this || value == null)
            return false; // (if any is null, then the other isn't, so this fails also)
        if (typeof value !== 'string')
            return false;
        var tp = new TextPart(this.memory, value);
        return this.key == tp.key;
    }
    /**
     * Returns true if the given text part or string is a close match to the underlying text for this text part.
     * This comparison uses the group key, which is used for grouping texts that are different only by letter case.
     * @param {TextPart | string} value
     * @returns
     */
    similar(value) {
        if (value == this)
            return true;
        if (value instanceof TextPart)
            return value.groupKey == this.groupKey;
        if (!this && value == null)
            return true;
        if (!this || value == null)
            return false; // (if any is null, then the other isn't, so this fails also)
        if (typeof value !== 'string')
            return false;
        var tp = new TextPart(this.memory, value);
        return this.groupKey == tp.groupKey;
    }
    //public override int GetHashCode() {
    //    return GroupKey.GetHashCode();
    //}
    toString() {
        return this.text + " [" + this.groupKey + "]";
    }
}
exports.default = TextPart;
__text = new WeakMap(), __textParts = new WeakMap(), __key = new WeakMap();
//# sourceMappingURL=TextPart.js.map