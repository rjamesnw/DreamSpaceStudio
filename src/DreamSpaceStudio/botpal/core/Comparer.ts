/** Compares two values and returns -1 if 'x' is before 'y', 0 if equal, and 1 if 'x' is after 'y'. */
export interface Comparer<T = any> {
    (x: T, y: T): number;
}

export interface IEquality {
    equals(value: any): boolean;
}

//export interface IComparer<T = any> {
//    compare: Comparer<T>;
//}