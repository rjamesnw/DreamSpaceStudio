import { ILogItem } from "./Diagnostics";
declare const Exception_base: {
    new (): {
        dispose(release?: boolean): void;
    } & Error;
    super: {
        new (...args: any[]): {
            dispose(release?: boolean): void;
        };
    } & ErrorConstructor & import("../PrimitiveTypes").IObject & import("../Globals").IFactory<{
        new (...args: any[]): {
            dispose(release?: boolean): void;
        };
    } & ErrorConstructor & import("../PrimitiveTypes").IObject, import("../Globals").NewDelegate<{
        dispose(release?: boolean): void;
    } & Error>, import("../Globals").InitDelegate<{
        dispose(release?: boolean): void;
    } & Error>>;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    [x: string]: any;
    [x: number]: any;
};
/**
 * The Exception object is used to record information about errors that occur in an application.
 * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
 */
export declare class Exception extends Exception_base {
    /** Records information about errors that occur in the application.
       * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
       * @param {string} message The error message.
       * @param {object} source An object that is associated with the message, or null.
       * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
       */
    static 'new': (message: string, source: object, log?: boolean) => IException;
    /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
    static init(o: IException, isnew: boolean, message: string, source: object, log?: boolean): void;
    /** Returns the current call stack. */
    static printStackTrace(): string[];
    /** Generates an exception object from a log item. This allows logging errors separately, then building exceptions from them after.
   * Usage example: "throw System.Exception.from(logItem, this);" (see also: 'System.Diagnostics.log()')
   * @param {Diagnostics.LogItem} logItem A log item entry to use as the error source.
   * @param {object} source The object that is the source of the error, or related to it.
   */
    static from(logItem: ILogItem, source?: object): Exception;
    /** Generates an exception object from a simple string message.
        * Note: This is different from 'error()' in that logging is more implicit (there is no 'title' parameter, and the log title defaults to "Exception").
        * Usage example: "throw System.Exception.from("Error message.", this);"
        * @param {string} message The error message.
        * @param {object} source The object that is the source of the error, or related to it.
        */
    static from(message: string, source?: object): Exception;
    /**
     * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
     * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
     */
    static error(title: string, message: string, source?: object): Exception;
    /**
     * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
     * The source of the exception object will be associated with the 'LogItem' object.
     * This function is typically used with non-implemented functions in abstract types.
     */
    static notImplemented(functionNameOrTitle: string, source?: object, message?: string): Exception;
    source: object;
    /** Returns the error message for this exception instance. */
    toString(): string;
    valueOf(): string;
}
export interface IException extends Exception {
}
export {};
