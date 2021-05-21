var DS;
(function (DS) {
    // =======================================================================================================================
    ///** Returns the call stack for a given error object. */
    //x export function getErrorCallStack(errorSource: { stack?: string }): string[] {
    //    if (!errorSource || !errorSource.stack) return [];
    //    var _e: _IError = <any>errorSource;
    //    if (_e.stacktrace && _e.stack) return _e.stacktrace.split(/\n/g); // (opera provides one already good to go) [note: can also check for 'global["opera"]']
    //    var callstack: string[] = [];
    //    var isCallstackPopulated = false;
    //    var stack = _e.stack || _e.message;
    //    if (stack) {
    //        var lines = stack.split(/\n/g);
    //        if (lines.length) {
    //            // ... try to extract stack details only (some browsers include other info) ...
    //            for (var i = 0, len = lines.length; i < len; ++i)
    //                if (/.*?:\d+:\d+/.test(lines[i]))
    //                    callstack.push(lines[i]);
    //            // ... if there are lines, but nothing was added, then assume this is a special unknown stack format and just dump it as is ...
    //            if (lines.length && !callstack.length)
    //                callstack.push.apply(callstack, lines);
    //            isCallstackPopulated = true;
    //        }
    //    }
    //    if (!isCallstackPopulated && arguments.callee) { //(old IE and Safari - fall back to traversing the call stack by caller reference [note: this may become depreciated])
    //        var currentFunction = arguments.callee.caller;
    //        while (currentFunction) {
    //            var fn = currentFunction.toString();
    //            var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
    //            callstack.push(fname);
    //            currentFunction = currentFunction.caller;
    //        }
    //    }
    //    return callstack;
    //}
    /** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
      * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
      */
    function getErrorMessage(errorSource, includeStack = true) {
        // (note: while 'errorSource' is 'any', the other types are listed for informational purposes only; this function must be executable on both the server and client so not all types can be listed)
        if (typeof errorSource == 'string')
            return errorSource;
        else if (typeof errorSource == 'object') {
            if (DS.Diagnostics && DS.Diagnostics.LogItem && errorSource instanceof DS.Diagnostics.LogItem) {
                return errorSource.toString();
            }
            else if ('message' in errorSource) { // (this should support both 'Exception' AND 'Error' objects)
                var margin = "", msg = "";
                do {
                    var errorInfo = errorSource;
                    var error = errorSource instanceof Error ? errorSource : typeof ErrorEvent == 'object' && errorSource instanceof ErrorEvent ? errorSource.error : null;
                    var fname = errorInfo instanceof Function ? DS.Utilities.getTypeName(errorInfo, false) : errorInfo.functionName;
                    msg += margin ? "\r\n" + margin + "**** Inner Exception ***\r\n" : "";
                    msg += margin + (fname ? "(" + fname + ") " : "") + (errorInfo.message || errorInfo.reason || errorInfo.type);
                    var sourceLocation = errorInfo.fileName || errorInfo.filename || errorInfo.url;
                    var lineno = errorInfo.lineno !== void 0 ? errorInfo.lineno : errorInfo.lineNumber;
                    var colno = errorInfo.colno !== void 0 ? errorInfo.colno : errorInfo.columnNumber;
                    if (lineno !== void 0) {
                        msg += "\r\n" + margin + "on line " + lineno + ", column " + colno;
                        if (sourceLocation !== void 0)
                            msg += ", of file '" + sourceLocation + "'";
                    }
                    else if (sourceLocation !== void 0)
                        msg += "\r\n" + margin + "in file '" + sourceLocation + "'";
                    if (includeStack) {
                        var stack = DS.Exception.parseStack(error);
                        if (stack && stack.length)
                            msg += "\r\n" + margin + "Stack trace:\r\n" + margin + "" + stack.join("\r\n" + margin);
                    }
                    margin += "  ";
                } while (errorSource = errorSource.innerException);
                return msg;
            }
            else
                return '' + DS.nud(errorSource, '');
        }
        else
            return '' + DS.nud(errorSource, '');
    }
    DS.getErrorMessage = getErrorMessage;
    // ========================================================================================================================================
})(DS || (DS = {}));
//# sourceMappingURL=ErrorHandling.js.map