/** Compares two values and returns -1 if 'x' is before 'y', 0 if equal, and 1 if 'x' is after 'y'. */
export interface Comparer<T> {
    (x: T, y: T): number;
}