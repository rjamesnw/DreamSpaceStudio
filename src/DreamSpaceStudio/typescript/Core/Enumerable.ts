import { Exception } from "./System/Exception";

/**
 * Supports Iteration for ES5/ES3. To use, create a new type derived from this one, or implement the IEnumerable<T> interface.
 */
export abstract class Enumerable<T> implements Iterator<T>
{
    next(value?: any): IteratorResult<T> {
        throw Exception.notImplemented('next', this);
    }

    return(value?: any): IteratorResult<T> {
        throw Exception.notImplemented('return', this);
    }

    throw(e?: any): IteratorResult<T> {
        throw Exception.notImplemented('throw', this);
    }
}

/**
* Supports Iteration for ES5/ES3. To use, implement this interface, or create a new type derived from Enumerable<T>.
*/
export interface IEnumerable<T> extends Enumerable<T> { }

