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
}
exports.default = Match;
__score = new WeakMap();
//export class Comparer : Comparer < Match < T >>
//{
//    public override int Compare(Match<T> x, Match < T > y)
//{
//    var comp = (y._Score ?? -1) - (x._Score ?? -1); // (x and y are reversed so that the highest scores are at the top; null [unknown] scores are the lowest at -1, though are considered "pending")
//    return comp < 0 ? -1 : comp > 0 ? 1 : 0;
//}
//}
// ========================================================================================================================
//# sourceMappingURL=Match.js.map