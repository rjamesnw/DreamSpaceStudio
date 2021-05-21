namespace DS {
    export namespace Utilities {
        //x var _promisify: typeof import('util').promisify = require('util').promisify;
        //x type Callback = (err: Error | null) => void;
        //x type CallbackR<R> = (err: Error | null, result: R) => void;
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisifyR<R>(fn: (callback: (err: Error | null, result: R) => void) => void): () => Promise<R> {
            return () => new Promise<R>((res, rej) => fn((er, r) => er ? rej(er) : res(r)));
        }
        //x export function promisifyR<TResult>(fn: (callback: CallbackR<TResult>) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify(fn: (callback: (err: Error | null) => void) => void): () => Promise<void> {
            return () => new Promise<void>((res, rej) => fn((er) => er ? rej(er) : res(void 0)));
        }
        //x export function promisify(fn: (callback: Callback) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify1R<A, R>(fn: (a: A, callback: (err: Error | null, result: R) => void) => void): (a: A) => Promise<R> {
            return (a: A) => new Promise<R>((res, rej) => fn(a, (er, r) => er ? rej(er) : res(r)));
        }
        //x export function promisify1R<T1, TResult>(fn: (arg1: T1, callback: CallbackR<TResult>) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify1<A>(fn: (a: A, callback: (err: Error | null) => void) => void): (a: A) => Promise<void> {
            return (a: A) => new Promise<void>((res, rej) => fn(a, er => er ? rej(er) : res(void 0)));
        }
        //x export function promisify1<T1>(fn: (arg1: T1, callback: Callback) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify2R<A, B, R>(fn: (a: A, b: B, callback: (err: Error | null, result: R) => void) => void): (a: A, b: B) => Promise<R> {
            return (a: A, b: B) => new Promise<R>((res, rej) => fn(a, b, (er, r) => er ? rej(er) : res(r)));
        }
        //x export function promisify2R<T1, T2, TResult>(fn: (arg1: T1, arg2: T2, callback: CallbackR<TResult>) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify2<A, B>(fn: (a: A, b: B, callback: (err: Error | null) => void) => void): (a: A, b: B) => Promise<void> {
            return (a: A, b: B) => new Promise<void>((res, rej) => fn(a, b, (er) => er ? rej(er) : res(void 0)));
        }
        //x export function promisify2<T1, T2>(fn: (arg1: T1, arg2: T2, callback: Callback) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify3R<A, B, C, R>(fn: (a: A, b: B, c: C, callback: (err: Error | null, result: R) => void) => void):  (a: A, b: B, c: C) => Promise<R> {
            return  (a: A, b: B, c: C) => new Promise<R>((res, rej) => fn(a, b, c, (er, r) => er ? rej(er) : res(r)));
        }
        //x export function promisify3R<T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, callback: CallbackR<TResult>) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify3<A, B, C>(fn: (a: A, b: B, c: C, callback: (err: Error | null) => void) => void): (a: A, b: B, c: C) =>  Promise<void> {
            return (a: A, b: B, c: C) =>  new Promise<void>((res, rej) => fn(a, b, c, (er) => er ? rej(er) : res(void 0)));
        }
        //x export function promisify3<T1, T2, T3>(fn: (arg1: T1, arg2: T2, arg3: T3, callback: Callback) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify4R<A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D, callback: (err: Error | null, result: R) => void) => void): (a: A, b: B, c: C, d: D) => Promise<R> {
            return (a: A, b: B, c: C, d: D) => new Promise<R>((res, rej) => fn(a, b, c, d, (er, r) => er ? rej(er) : res(r)));
        }
        //x export function promisify4R<T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: CallbackR<TResult>) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify4<A, B, C, D>(fn: (a: A, b: B, c: C, d: D, callback: (err: Error | null) => void) => void): (a: A, b: B, c: C, d: D) => Promise<void> {
            return (a: A, b: B, c: C, d: D) => new Promise<void>((res, rej) => fn(a, b, c, d, (er) => er ? rej(er) : res(void 0)));
        }
        //x export function promisify4<T1, T2, T3, T4>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: Callback) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify5R<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E, callback: (err: Error | null, result: R) => void) => void): (a: A, b: B, c: C, d: D, e: E) => Promise<R> {
            return (a: A, b: B, c: C, d: D, e: E) => new Promise<R>((res, rej) => fn(a, b, c, d, e, (er, r) => er ? rej(er) : res(r)));
        }
        //x export function promisify5R<T1, T2, T3, T4, T5, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: CallbackR<TResult>) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify5<A, B, C, D, E>(fn: (a: A, b: B, c: C, d: D, e: E, callback: (err: Error | null) => void) => void): (a: A, b: B, c: C, d: D, e: E) => Promise<void> {
            return (a: A, b: B, c: C, d: D, e: E) => new Promise<void>((res, rej) => fn(a, b, c, d, e, (er) => er ? rej(er) : res(void 0)));
        }
        //x export function promisify5<T1, T2, T3, T4, T5>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: Callback) => void) { return _promisify(fn); }
    }
}