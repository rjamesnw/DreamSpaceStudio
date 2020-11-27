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
var __score;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Used for match lists to associate a score value with a given reference.
 * @type T The item type of the reference that the matches represent.
 */
class Match {
    constructor(item, score) {
        __score.set(this, void 0);
        this.item = item;
        __classPrivateFieldSet(this, __score, score);
    }
    get score() { return __classPrivateFieldGet(this, __score); }
    set score(value) { if (__classPrivateFieldGet(this, __score) != value) {
        __classPrivateFieldSet(this, __score, value);
        this.changed = true;
    } }
    equals(obj) {
        return (obj instanceof Match) && obj.item == this.item && __classPrivateFieldGet(obj, __score) == __classPrivateFieldGet(this, __score);
    }
}
exports.default = Match;
__score = new WeakMap();
/**
 * Plug in this comparer function to sort matches in descending order.
 * This is the default comparer, which puts high scores first.
 */
Match.Comparer = function (x, y) {
    var _a, _b;
    var comp = ((_a = __classPrivateFieldGet(y, __score)) !== null && _a !== void 0 ? _a : -1) - ((_b = __classPrivateFieldGet(x, __score)) !== null && _b !== void 0 ? _b : -1);
    // (x and y are reversed so that the highest scores are at the top; null/undefined [unknown] scores are the lowest at -1, though are considered "pending")
    return comp < 0 ? -1 : comp > 0 ? 1 : 0;
};
/**
 * Plug in this comparer function to sort matches in ascending order.
 * This puts low scores first.
 */
Match.ReverseComparer = function (x, y) {
    var _a, _b;
    var comp = ((_a = __classPrivateFieldGet(x, __score)) !== null && _a !== void 0 ? _a : -1) - ((_b = __classPrivateFieldGet(y, __score)) !== null && _b !== void 0 ? _b : -1);
    return comp < 0 ? -1 : comp > 0 ? 1 : 0;
};
// ========================================================================================================================
//# sourceMappingURL=Match.js.map