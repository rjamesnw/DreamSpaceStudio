"use strict";
// #######################################################################################
// Types for error management.
// #######################################################################################
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
const Types_1 = require("../Types");
eval(Types_1.extendDSNS(() => DreamSpaceCore));
var DreamSpaceCore;
(function (DreamSpaceCore) {
    var System;
    (function (System) {
        // =============================================================================================
        /**
         * The Exception object is used to record information about errors that occur in an application.
         * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
         */
        class Exception extends FactoryBase() {
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
                    else if (global["opera"] && e.message) { //Opera
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
                while (caller && (caller == System.Exception.error || caller == System.Exception.notImplemented || caller == DreamSpace.log || caller == DreamSpace.error
                    || typeof caller.$__fullname == 'string' && caller.$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
                    caller = caller.caller; // (skip the proxy functions that call this function)
                if (caller) {
                    message += "\r\n\r\nStack:\r\n\r\n";
                    var stackMsg = "";
                    while (caller) {
                        var callerName = getFullTypeName(caller) || "/*anonymous*/";
                        var args = caller.arguments;
                        var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
                        if (stackMsg)
                            stackMsg += "called from ";
                        stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                        caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                    }
                    message += stackMsg;
                }
                return System.Exception.new(message, source, createLog);
            }
            /**
             * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
             * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
             */
            static error(title, message, source) {
                if (System.Diagnostics && System.Diagnostics.log) {
                    var logItem = System.Diagnostics.log(title, message, LogTypes.Error);
                    return Exception.from(logItem, source);
                }
                else
                    return Exception.from(error(title, message, source, false, false), source);
            }
            /**
             * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
             * The source of the exception object will be associated with the 'LogItem' object.
             * This function is typically used with non-implemented functions in abstract types.
             */
            static notImplemented(functionNameOrTitle, source, message) {
                var msg = "The function is not implemented." + (message ? " " + message : "");
                if (System.Diagnostics && System.Diagnostics.log) {
                    var logItem = System.Diagnostics.log(functionNameOrTitle, msg, LogTypes.Error);
                    return Exception.from(logItem, source);
                }
                else
                    return Exception.from(error(functionNameOrTitle, msg, source, false, false), source);
            }
        }
        System.Exception = Exception;
        (function (Exception) {
            class $__type extends DisposableFromBase(Error) {
                /** Returns the error message for this exception instance. */
                toString() { return this.message; }
                valueOf() { return this.message; }
                static [constructor](factory) {
                    factory.init = (o, isnew, message, source, log) => {
                        o.message = message;
                        o.source = source;
                        o.stack = (new Error()).stack;
                        if (log || log === void 0)
                            Diagnostics.log("Exception", message, LogTypes.Error);
                    };
                }
            }
            Exception.$__type = $__type;
            Exception.$__register(System);
        })(Exception = System.Exception || (System.Exception = {}));
        // =============================================================================================
    })(System = DreamSpaceCore.System || (DreamSpaceCore.System = {}));
})(DreamSpaceCore || (DreamSpaceCore = {}));
var DreamSpace = System_1.DreamSpace;
exports.default = DreamSpace;
//# sourceMappingURL=System.Exception.js.map