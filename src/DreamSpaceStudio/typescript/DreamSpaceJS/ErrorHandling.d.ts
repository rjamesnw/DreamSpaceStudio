/** Returns the call stack for a given error object. */
export declare function getErrorCallStack(errorSource: {
    stack?: string;
}): string[];
/** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
  * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
  */
export declare function getErrorMessage(errorSource: any): string;
