/** Used with 'DreamSpace.log(...)' to write to the host console, if available.
  */
export declare enum LogTypes {
    /** An important or critical action was a success. */
    Success = -1,
    /** General logging information - nothing of great importance (such as writing messages to developers in the console, or perhaps noting the entry/exit of a section of code), but could be good to know during support investigations. */
    Normal = 0,
    /** An important action has started, or important information must be noted (usually not debugging related, but could be good to know during support investigations). */
    Info = 1,
    /** A warning or non critical error has occurred. */
    Warning = 2,
    /** A error has occurred (usually critical). */
    Error = 3,
    /** Debugging details only. In a live system debugging related log writes are ignored. */
    Debug = 4,
    /** Usually used with more verbose logging to trace execution. In a live system debugging related log writes are ignored. */
    Trace = 5
}
/** Logs the message to the console (if available) and returns the message.
  *  By default errors are thrown instead of being returned.  Set 'throwOnError' to false to return logged error messages.
  * @param {string} title A title for this log message.
  * @param {string} message The message to log.
  * @param {object} source An optional object to associate with log.
  * @param {LogTypes} type The type of message to log.
  * @param {boolean} throwOnError If true (the default) then an exception with the message is thrown.
  * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
  */
export declare function log(title: string, message: string, type?: LogTypes, source?: object, throwOnError?: boolean, useLogger?: boolean): string;
/** Logs the error message to the console (if available) and throws the error.
  *  By default errors are thrown instead of being returned.  Set 'throwException' to false to return logged error messages.
  * @param {string} title A title for this log message.
  * @param {string} message The message to log.
  * @param {object} source An optional object to associate with log.
  * @param {boolean} throwException If true (the default) then an exception with the message is thrown.
  * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
  */
export declare function error(title: string, message: string, source?: object, throwException?: boolean, useLogger?: boolean): string;
