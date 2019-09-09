// ############################################################################################################################
// Types for error management.
// ############################################################################################################################

namespace DS {
    /** 
     * The Exception object is used to record information about errors that occur in an application.
     * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
     */
    export class Exception extends Error {
        /** Stores nested exceptions in cases where multiple exceptions are thrown. */
        innerException?: Exception;

        /** An optional user defined value related to the error. */
        source?: any;

        /** The call trace, which may include arguments. */
        callTrace?: string;

        /** The stack split up into an array of lines. */
        stackLines?: string[];

        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        /** Records information about errors that occur in the application.
        * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
        * @param {string | Error | Exception | Diagnostics.ILogItem} message The error message, or another supported object type to copy a message from.
        * @param {any} source An object that is associated with the message, or null.
        * @param {Exception} innerException An optional exception that is the cause of the current new exception.
        * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
        */
        constructor(message: string | Error | Exception | Diagnostics.LogItem, source?: any, innerException?: Exception, log?: boolean) {
            super();

            // ... support LogItem objects natively as the exception message source ...

            if (message instanceof Diagnostics.LogItem) {
                if (log === void 0) log = false; // (this is from a log item, so don't log a second time)
                if (source != void 0)
                    (<Diagnostics.ILogItem>message).source = source;
                source = message; // (set source to the given error object)
                message = "";
                if ((<Diagnostics.ILogItem>source).title)
                    message += (<Diagnostics.ILogItem>source).title;
                if ((<Diagnostics.ILogItem>source).message) {
                    if (message) message += ": ";
                    message += (<Diagnostics.ILogItem>source).message;
                }
            }

            this.message = message && (typeof message == 'string' ? message : message.message);
            this.source = source || (message instanceof Exception ? message.source : void 0);
            this.innerException = innerException && ((innerException instanceof Exception ? innerException : new Exception(innerException)));
            this.stack = message instanceof Error ? message.stack : (new Error()).stack;
            this.callTrace = message instanceof Exception ? message.callTrace : Exception.getCallTrace();
            this.stackLines = message instanceof Exception ? message.stackLines : Exception.parseStack();

            if (log || log === void 0) Diagnostics.log("Exception", message, LogTypes.Error);
        }

        /** Returns the current call trace, which may include arguments, for debugging purposes. */
        static getCallTrace() {
            //var callerFunction = System.Exception.from.caller;
            //var callerFunctionInfo = <ITypeInfo><any>callerFunction;
            //var callerName = getFullTypeName(callerFunctionInfo) || "/*anonymous*/";
            ////var srcName = callerFunction.substring(callerFunction.indexOf("function"), callerFunction.indexOf("("));
            //var args = callerFunction.arguments;
            //var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
            //var callerSignature = (callerName ? "[" + callerName + "(" + _args + ")]" : "");
            //message += (callerSignature ? callerSignature + ": " : "") + message + "\r\n\r\n";

            try {
                var trace = "", caller = this.getCallTrace.caller;

                while (caller && (caller == Exception || caller == Exception.error || caller == Exception.notImplemented || caller == log || caller == error)) // TODO: Create "inheritsFrom()" or similar methods.
                    caller = caller.caller; // (skip any proxy functions that may have called this function)

                if (caller) {
                    while (caller) {
                        var callerName = Utilities.getFullTypeName(caller) || "/*anonymous*/";
                        var args = caller.arguments;
                        var _args = args && args.length > 0 ? DS.global.Array.prototype.join.call(args, ', ') : "";
                        if (trace) trace += "called from ";
                        trace += callerName + "(" + _args + ")\r\n\r\n";
                        caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                    }
                }
            } catch (ex) { trace = 'Not supported: ' + getErrorMessage(ex); }

            return trace;
        }

        /** Returns the current stack parsed into an array of lines.
         * Call 'getCallTrace()' to get more details, such as arguments past in, but without line and column numbers.
         */
        // TODO: Review: http://www.eriwen.com/javascript/stacktrace-update/
        // TODO: Look into merging the parsed stack with the call arguments and remove the need for getCallTrace().
        static parseStack(err?: Error): string[] {
            var callstack: string[] = [];
            var isCallstackPopulated = false;

            if (!err) {
                err = new Error();

                if (!err.stack)
                    try {
                        throw "";
                    } catch (ex) {
                        err = ex;
                    }
            }

            if (err.stack) { //Firefox
                var lines = err.stack.split('\n');
                for (var i = 0, len = lines.length; i < len; ++i) {
                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                        callstack.push(lines[i]);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }
            else if (DS.global["opera"] && err.message) { //Opera
                var lines = err.message.split('\n');
                for (var i = 0, len = lines.length; i < len; ++i) {
                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                        var entry = lines[i];
                        //Append next line also since it has the file info
                        if (lines[i + 1]) {
                            entry += ' at ' + lines[i + 1];
                            i++;
                        }
                        callstack.push(entry);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }

            if (!isCallstackPopulated) { //IE and Safari
                var currentFunction = arguments.callee.caller;
                while (currentFunction) {
                    var fn = currentFunction.toString();
                    var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                    callstack.push(fname);
                    currentFunction = currentFunction.caller;
                }
            }

            return callstack;
        }

        // /** Generates an exception object from a log item. This allows logging errors separately, then building exceptions from them after.
        //* Usage example: "throw System.Exception.from(logItem, this);" (see also: 'System.Diagnostics.log()')
        //* @param {Diagnostics.LogItem} logItem A log item entry to use as the error source.
        //* @param {object} source The object that is the source of the error, or related to it.
        //*/
        //? static from(logItem: Diagnostics.ILogItem, source?: object, innerException?: Exception): Exception;
        // /** Generates an exception object from a simple string message.
        // * Note: This is different from 'error()' in that logging is more implicit (there is no 'title' parameter, and the log title defaults to "Exception").
        // * Usage example: "throw System.Exception.from("Error message.", this);"
        // * @param {string} message The error message.
        // * @param {object} source The object that is the source of the error, or related to it.
        // */
        //? static from(message: string, source?: object, innerException?: Exception): Exception;
        // /** Generates an exception object from an 'Error' instance. The details are copied into a new exception object.
        // * Note: This is different from 'error()' in that logging is more implicit (there is no 'title' parameter, and the log title defaults to "Exception").
        // * Usage example: "throw System.Exception.from("Error message.", this);"
        // * @param {string} message The error message.
        // * @param {object} source The object that is the source of the error, or related to it.
        // */
        //? static from(error: Error, source?: object, innerException?: Exception): Exception;
        //x static from(message: Diagnostics.ILogItem | string | Error, source: object = null, innerException?: Exception): Exception {
        //     var createLog = true;
        //     return new Exception(<string | Error>message, source, innerException, createLog);
        // }

        /** 
         * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
         */
        static error(title: string, message: string, source?: object): Exception {
            if (Diagnostics && Diagnostics.log) {
                var logItem = Diagnostics.log(title, message, LogTypes.Error);
                return new Exception(logItem, source);
            }
            else return new Exception(error(title, message, source, false, false), source);
        }

        /** 
         * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static notImplemented(functionNameOrTitle: string, source?: object, message?: string): Exception {
            var msg = "The function is not implemented." + (message ? " " + message : "");
            if (Diagnostics && Diagnostics.log) {
                var logItem = Diagnostics.log(functionNameOrTitle, msg, LogTypes.Error);
                return new Exception(logItem, source);
            }
            else return new Exception(error(functionNameOrTitle, msg, source, false, false), source);
        }

        /** Returns this exception and any inner exceptions formatted for display (simply calls DS.getErrorMessage(this, true)). */
        toString() { return getErrorMessage(this, true); }
        valueOf() { return this.toString(); }
    }

    export interface IException extends Exception { }
}

// ############################################################################################################################
