define(["require", "exports", "../Factories", "../PrimitiveTypes", "../Globals", "../Types", "../Logging", "./Diagnostics"], function (require, exports, Factories_1, PrimitiveTypes_1, Globals_1, Types_1, Logging_1, Diagnostics_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Exception_1;
    // ############################################################################################################################
    // Types for error management.
    // ############################################################################################################################
    /**
     * The Exception object is used to record information about errors that occur in an application.
     * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
     */
    let Exception = Exception_1 = class Exception extends Factories_1.Factory(Factories_1.makeFactory(PrimitiveTypes_1.makeDisposable(Error))) {
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        static init(o, isnew, message, source, log) {
            o.message = message;
            o.source = source;
            o.stack = (new Error()).stack;
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
                else if (Globals_1.DreamSpace.global["opera"] && e.message) { //Opera
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
            while (caller && (caller == Exception_1.error || caller == Exception_1.notImplemented || caller == Logging_1.log || caller == Logging_1.error
                || typeof caller.$__fullname == 'string' && caller.$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
                caller = caller.caller; // (skip the proxy functions that call this function)
            if (caller) {
                message += "\r\n\r\nStack:\r\n\r\n";
                var stackMsg = "";
                while (caller) {
                    var callerName = Types_1.getFullTypeName(caller) || "/*anonymous*/";
                    var args = caller.arguments;
                    var _args = args && args.length > 0 ? Globals_1.DreamSpace.global.Array.prototype.join.call(args, ', ') : "";
                    if (stackMsg)
                        stackMsg += "called from ";
                    stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                    caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                }
                message += stackMsg;
            }
            return Exception_1.new(message, source, createLog);
        }
        /**
         * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
         */
        static error(title, message, source) {
            if (Diagnostics_1.Diagnostics && Diagnostics_1.Diagnostics.log) {
                var logItem = Diagnostics_1.Diagnostics.log(title, message, Logging_1.LogTypes.Error);
                return Exception_1.from(logItem, source);
            }
            else
                return Exception_1.from(Logging_1.error(title, message, source, false, false), source);
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
                return Exception_1.from(logItem, source);
            }
            else
                return Exception_1.from(Logging_1.error(functionNameOrTitle, msg, source, false, false), source);
        }
        /** Returns the error message for this exception instance. */
        toString() { return this.message; }
        valueOf() { return this.message; }
    };
    Exception = Exception_1 = __decorate([
        Factories_1.factory(this)
    ], Exception);
    exports.Exception = Exception;
});
// ############################################################################################################################
//# sourceMappingURL=Exception.js.map