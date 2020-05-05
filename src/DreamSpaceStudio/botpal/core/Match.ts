// ========================================================================================================================

export interface IMatch<T> { item: T; score: number; }

/**
 * Used for match lists to associate a score value with a given reference.
 * @type T The item type of the reference that the matches represent.
 */
export default class Match<T> implements IMatch<T> {
    readonly item: T;

    get score(): number { return this.#_score; }
    set score(value: number) { if (this.#_score != value) { this.#_score = value; this.changed = true; } }
    #_score: number;

    /**
     *  Set to 'True' if the score has changed.
    */
    public changed: boolean;

    constructor(item: T, score: number) { this.item = item; this.#_score = score; }

    ///**
     * // The default match comparer, which sorts scores in descending order so higher scores are first.
    //*/
    // static readonly Comparer DefaultComparer = new Comparer();
}

//export class Comparer : Comparer < Match < T >>
//{
//    public override int Compare(Match<T> x, Match < T > y)
//{
//    var comp = (y._Score ?? -1) - (x._Score ?? -1); // (x and y are reversed so that the highest scores are at the top; null [unknown] scores are the lowest at -1, though are considered "pending")
//    return comp < 0 ? -1 : comp > 0 ? 1 : 0;
//}
//}


// ========================================================================================================================
