// ========================================================================================================================

import { Comparer, IEquality } from "./Comparer";

export interface IMatch<T> { item: T; score: number; }

/**
 * Used for match lists to associate a score value with a given reference.
 * @type T The item type of the reference that the matches represent.
 */
export default class Match<T> implements IMatch<T>, IEquality {
    readonly item: T;

    get score(): number { return this.#_score; }
    set score(value: number) { if (this.#_score != value) { this.#_score = value; this.changed = true; } }
    #_score: number;

    /**
     *  Set to 'True' if the score has changed.
    */
    public changed: boolean;

    constructor(item: T, score: number) { this.item = item; this.#_score = score; }

    equals(obj: object): boolean {
        return (obj instanceof Match) && obj.item == this.item && obj.#_score == this.#_score;
    }

    /**
     * Plug in this comparer function to sort matches in descending order.
     * This is the default comparer, which puts high scores first.
     */
    static Comparer: Comparer<Match<any>> = function (x: Match<any>, y: Match<any>) {
        var comp = (y.#_score ?? -1) - (x.#_score ?? -1);
        // (x and y are reversed so that the highest scores are at the top; null/undefined [unknown] scores are the lowest at -1, though are considered "pending")
        return comp < 0 ? -1 : comp > 0 ? 1 : 0;
    };

    /**
     * Plug in this comparer function to sort matches in ascending order.
     * This puts low scores first.
     */
    static ReverseComparer: Comparer<Match<any>> = function (x: Match<any>, y: Match<any>) {
        var comp = (x.#_score ?? -1) - (y.#_score ?? -1);
        return comp < 0 ? -1 : comp > 0 ? 1 : 0;
    }
}

// ========================================================================================================================
