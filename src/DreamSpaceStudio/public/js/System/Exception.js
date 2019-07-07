// ############################################################################################################################
define(["require", "exports", "./DreamSpace", "./Logging", "./Diagnostics", "./Utilities"], function (require, exports, DreamSpace_1, Logging_1, Diagnostics_1, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ############################################################################################################################
    // Types for error management.
    // ############################################################################################################################
    /**
     * The Exception object is used to record information about errors that occur in an application.
     * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
     */
    class Exception extends Error {
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        /** Records information about errors that occur in the application.
        * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
        * @param {string} message The error message.
        * @param {object} source An object that is associated with the message, or null.
        * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
        */
        constructor(message, source, log) {
            super();
            this.message = message;
            this.source = source;
            this.stack = (new Error()).stack;
            if (log || log === void 0)
                Diagnostics_1.Diagnostics.log("Exception", message, Logging_1.LogTypes.Error);
        }
        /** Returns the current call stack. */
        static printStackTrace() {
            var callstack = [];
            var isCallstackPopulated = false;
            try {
                throw "";
            }
            catch (e) {
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
                else if (DreamSpace_1.DreamSpace.global["opera"] && e.message) { //Opera
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
        static from(message, source = null) {
            // (support LogItem objects natively as the exception message source)
            var createLog = true;
            if (typeof message == 'object' && (message.title || message.message)) {
                createLog = false; // (this is from a log item, so don't log a second time)
                if (source != void 0)
                    message.source = source;
                source = message;
                message = "";
                if (source.title)
                    message += source.title;
                if (source.message) {
                    if (message)
                        message += ": ";
                    message += source.message;
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
            while (caller && (caller == Exception.error || caller == Exception.notImplemented || caller == Logging_1.log || caller == Logging_1.error
                || typeof caller.$__fullname == 'string' && caller.$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
                caller = caller.caller; // (skip the proxy functions that call this function)
            if (caller) {
                message += "\r\n\r\nStack:\r\n\r\n";
                var stackMsg = "";
                while (caller) {
                    var callerName = Utilities_1.getFullTypeName(caller) || "/*anonymous*/";
                    var args = caller.arguments;
                    var _args = args && args.length > 0 ? DreamSpace_1.DreamSpace.global.Array.prototype.join.call(args, ', ') : "";
                    if (stackMsg)
                        stackMsg += "called from ";
                    stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                    caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                }
                message += stackMsg;
            }
            return new Exception(message, source, createLog);
        }
        /**
         * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
         */
        static error(title, message, source) {
            if (Diagnostics_1.Diagnostics && Diagnostics_1.Diagnostics.log) {
                var logItem = Diagnostics_1.Diagnostics.log(title, message, Logging_1.LogTypes.Error);
                return Exception.from(logItem, source);
            }
            else
                return Exception.from(Logging_1.error(title, message, source, false, false), source);
        }
        /**
         * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static notImplemented(functionNameOrTitle, source, message) {
            var msg = "The function is not implemented." + (message ? " " + message : "");
            if (Diagnostics_1.Diagnostics && Diagnostics_1.Diagnostics.log) {
                var logItem = Diagnostics_1.Diagnostics.log(functionNameOrTitle, msg, Logging_1.LogTypes.Error);
                return Exception.from(logItem, source);
            }
            else
                return Exception.from(Logging_1.error(functionNameOrTitle, msg, source, false, false), source);
        }
        /** Returns the error message for this exception instance. */
        toString() { return this.message; }
        valueOf() { return this.message; }
    }
    exports.Exception = Exception;
});
// ############################################################################################################################
//# sourceMappingURL=Exception.js.map