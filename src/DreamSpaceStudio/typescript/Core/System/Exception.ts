import { DreamSpace as DS, ITypeInfo } from "../Globals";
import { Factory, factory, makeFactory } from "../Factories";
import { getFullTypeName } from "../Types";
import { LogTypes, log, error as log_error } from "../Logging"; // ("log_error" is just to prevent confusion with the "error" function in Exception)
import { makeDisposable } from "../PrimitiveTypes";

// ############################################################################################################################
// Types for error management.
// ############################################################################################################################

/** 
 * The Exception object is used to record information about errors that occur in an application.
 * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
 */
@factory(this)
export class Exception extends Factory(makeFactory(makeDisposable(Error))) {
    /** Records information about errors that occur in the application.
       * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
       * @param {string} message The error message.
       * @param {object} source An object that is associated with the message, or null.
       * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
       */
    static 'new': (message: string, source: object, log?: boolean) => IException;

    /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
    static init(o: IException, isnew: boolean, message: string, source: object, log?: boolean): void {
        o.message = message;
        o.source = source;
        o.stack = (new Error()).stack;
        if (log || log === void 0) Diagnostics.log("Exception", message, LogTypes.Error);
    }

    /** Returns the current call stack. */
    static printStackTrace(): string[] { // TODO: Review: http://www.eriwen.com/javascript/stacktrace-update/
        var callstack: string[] = [];
        var isCallstackPopulated = false;
        try {
            throw "";
        } catch (e) {
            if (e.stack) { //Firefox
                var lines = e.stack.split('\n');
                for (var i = 0, len = lines.length; i < len; ++i) {
                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                        callstack.push(lines[i]);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }
            else if (DS.global["opera"] && e.message) { //Opera
                var lines = e.message.split('\n');
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
    static from(message: any, source: object = null): Exception {
        // (support LogItem objects natively as the exception message source)
        var createLog = true;
        if (typeof message == 'object' && ((<ILogItem>message).title || (<ILogItem>message).message)) {
            createLog = false; // (this is from a log item, so don't log a second time)
            if (source != void 0)
                (<ILogItem>message).source = source;
            source = message;
            message = "";
            if ((<ILogItem>source).title)
                message += (<ILogItem>source).title;
            if ((<ILogItem>source).message) {
                if (message) message += ": ";
                message += (<ILogItem>source).message;
            }
        }
        //var callerFunction = System.Exception.from.caller;
        //var callerFunctionInfo = <ITypeInfo><any>callerFunction;
        //var callerName = getFullTypeName(callerFunctionInfo) || "/*anonymous*/";
        ////var srcName = callerFunction.substring(callerFunction.indexOf("function"), callerFunction.indexOf("("));
        //var args = callerFunction.arguments;
        //var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
        //var callerSignature = (callerName ? "[" + callerName + "(" + _args + ")]" : "");
        //message += (callerSignature ? callerSignature + ": " : "") + message + "\r\n\r\n";
        var caller = this.from.caller;
        while (caller && (caller == Exception.error || caller == Exception.notImplemented || caller == log || caller == log_error
            || typeof (<ITypeInfo>caller).$__fullname == 'string' && (<ITypeInfo>caller).$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
            caller = caller.caller; // (skip the proxy functions that call this function)
        if (caller) {
            message += "\r\n\r\nStack:\r\n\r\n";
            var stackMsg = "";
            while (caller) {
                var callerName = getFullTypeName(caller) || "/*anonymous*/";
                var args = caller.arguments;
                var _args = args && args.length > 0 ? DS.global.Array.prototype.join.call(args, ', ') : "";
                if (stackMsg) stackMsg += "called from ";
                stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
            }
            message += stackMsg;
        }
        return Exception.new(message, source, createLog);
    }

    /** 
     * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
     * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
     */
    static error(title: string, message: string, source?: object): Exception {
        if (Diagnostics && Diagnostics.log) {
            var logItem = Diagnostics.log(title, message, LogTypes.Error);
            return Exception.from(logItem, source);
        }
        else return Exception.from(log_error(title, message, source, false, false), source);
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
            return Exception.from(logItem, source);
        }
        else return Exception.from(log_error(functionNameOrTitle, msg, source, false, false), source);
    }

    source: object;
    /** Returns the error message for this exception instance. */
    toString() { return this.message; }
    valueOf() { return this.message; }
}

export interface IException extends Exception { }

// ############################################################################################################################

import { Diagnostics, ILogItem } from "./Diagnostics";

// ############################################################################################################################
