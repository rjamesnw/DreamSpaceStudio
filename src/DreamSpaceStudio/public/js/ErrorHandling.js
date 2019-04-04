"use strict";
// =======================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
/** Returns the call stack for a given error object. */
function getErrorCallStack(errorSource) {
    if (!errorSource || !errorSource.stack)
        return [];
    var _e = errorSource;
    if (_e.stacktrace && _e.stack)
        return _e.stacktrace.split(/\n/g); // (opera provides one already good to go) [note: can also check for 'global["opera"]']
    var callstack = [];
    var isCallstackPopulated = false;
    var stack = _e.stack || _e.message;
    if (stack) {
        var lines = stack.split(/\n/g);
        if (lines.length) {
            // ... try to extract stack details only (some browsers include other info) ...
            for (var i = 0, len = lines.length; i < len; ++i)
                if (/.*?:\d+:\d+/.test(lines[i]))
                    callstack.push(lines[i]);
            // ... if there are lines, but nothing was added, then assume this is a special unknown stack format and just dump it as is ...
            if (lines.length && !callstack.length)
                callstack.push.apply(callstack, lines);
            isCallstackPopulated = true;
        }
    }
    if (!isCallstackPopulated && arguments.callee) { //(old IE and Safari - fall back to traversing the call stack by caller reference [note: this may become depreciated])
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
exports.getErrorCallStack = getErrorCallStack;
/** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
  * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
  */
function getErrorMessage(errorSource) {
    if (typeof errorSource == 'string')
        return errorSource;
    else if (typeof errorSource == 'object') {
        if (System && System.Diagnostics && System.Diagnostics.LogItem && errorSource instanceof System.Diagnostics.LogItem.$__type) {
            return errorSource.toString();
        }
        else if ('message' in errorSource) { // (this should support both 'Exception' AND 'Error' objects)
            var errorInfo = errorSource;
            var error = errorSource instanceof Error ? errorSource : errorSource instanceof ErrorEvent ? errorSource.error : null;
            var msg = '' + (Scripts && Scripts.ScriptError && (errorSource instanceof Scripts.ScriptError)
                ? errorSource.error && errorSource.error.message || errorSource.error && errorInfo.error : (errorInfo.message || errorInfo.reason || errorInfo.type));
            var fname = errorInfo instanceof Function ? getTypeName(errorInfo, false) : errorInfo.functionName;
            var sourceLocation = errorInfo.fileName || errorInfo.filename || errorInfo.url;
            if (fname)
                msg = "(" + fname + ") " + msg;
            var lineno = errorInfo.lineno !== void 0 ? errorInfo.lineno : errorInfo.lineNumber;
            var colno = errorInfo.colno !== void 0 ? errorInfo.colno : errorInfo.columnNumber;
            if (lineno !== void 0) {
                msg += "\r\non line " + lineno + ", column " + colno;
                if (sourceLocation !== void 0)
                    msg += ", of file '" + sourceLocation + "'";
            }
            else if (sourceLocation !== void 0)
                msg += "\r\nin file '" + sourceLocation + "'";
            var stack = getErrorCallStack(error);
            if (stack && stack.length)
                msg += "\r\nStack trace:\r\n" + stack.join("\r\n") + "\r\n";
            return msg;
        }
        else
            return '' + errorSource;
    }
    else
        return '' + errorSource;
}
exports.getErrorMessage = getErrorMessage;
// ========================================================================================================================================
//# sourceMappingURL=ErrorHandling.js.map