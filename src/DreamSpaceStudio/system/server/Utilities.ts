namespace ds {
    export namespace Utilities {
        var _promisify: typeof import('util').promisify = require('util').promisify;
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisifyR<TResult>(fn: (callback: (err: Error | null, result: TResult) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify(fn: (callback: (err?: Error | null) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify1R<T1, TResult>(fn: (arg1: T1, callback: (err: Error | null, result: TResult) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify1<T1>(fn: (arg1: T1, callback: (err?: Error | null) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify2R<T1, T2, TResult>(fn: (arg1: T1, arg2: T2, callback: (err: Error | null, result: TResult) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify2<T1, T2>(fn: (arg1: T1, arg2: T2, callback: (err?: Error | null) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify3R<T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, callback: (err: Error | null, result: TResult) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify3<T1, T2, T3>(fn: (arg1: T1, arg2: T2, arg3: T3, callback: (err?: Error | null) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify4R<T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: (err: Error | null, result: TResult) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify4<T1, T2, T3, T4>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: (err?: Error | null) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify5R<T1, T2, T3, T4, T5, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: (err: Error | null, result: TResult) => void) => void) { return _promisify(fn); }
        /** Converts a function, that accepts a callback as the last parameter in the form "(err: Error | null, result: TResult) => void",
         *  into a function that returns a promise. The NodeJS TypeScript defines don't work well with overloaded functions,
         *  so this provides a way to explicitly specify the number of expected arguments, and/or if a return type is expected. */
        export function promisify5<T1, T2, T3, T4, T5>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: (err?: Error | null) => void) => void) { return _promisify(fn); }
    }
}