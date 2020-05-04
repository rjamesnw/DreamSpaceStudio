// ============================================================================================================================

namespace DS {
    // ------------------------------------------------------------------------------------------------------------------------

    /** Used with 'DreamSpace.log(...)' to write to the host console, if available.
      */
    export enum LogTypes { //{ Message, Info, Warning, Error, Debug, Trace }
        /** An important or critical action was a success. */
        Success = -1,
        /** General logging information - nothing of great importance (such as writing messages to developers in the console, or perhaps noting the entry/exit of a section of code), but could be good to know during support investigations. */
        Normal,
        /** An important action has started, or important information must be noted (usually not debugging related, but could be good to know during support investigations). */
        Info,
        /** A warning or non critical error has occurred. */
        Warning,
        /** A error has occurred (usually critical). */
        Error,
        /** Debugging details only. In a live system debugging related log writes are ignored. */
        Debug,
        /** Usually used with more verbose logging to trace execution. In a live system debugging related log writes are ignored. */
        Trace
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
    export function log(title: string, message: string, type: LogTypes = LogTypes.Normal, source?: any, throwOnError = true, useLogger = true): string {
        if (title === null && message === null) return null;
        if (title !== null) title = ('' + title).trim();
        if (message !== null) message = ('' + message).trim();
        if (title === "" && message === "") return null;

        if (title && typeof title == 'string') {
            var _title = title; // (modify a copy so we can continue to pass along the unaltered title text)
            if (_title.charAt(title.length - 1) != ":")
                _title += ":";
            var compositeMessage = _title + " " + message;
        }
        else var compositeMessage = message;

        if (console)
            switch (type) {
                case LogTypes.Success:
                    console.log(compositeMessage);
                    break;
                case LogTypes.Normal:
                    console.log(compositeMessage);
                    break;
                case LogTypes.Info:
                    (console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Warning:
                    (console.warn || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Error:
                    (console.error || console.warn || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Debug:
                    (console.debug || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Trace:
                    (console.trace || console.info || console.log).call(console, compositeMessage);
                    break;
            }

        if (useLogger && Diagnostics) {
            if (type == LogTypes.Error) {
                if (throwOnError)
                    if (Exception) {
                        throw Exception.error(title, message, source); // (logs automatically)
                    }
                    else
                        throw new Error(compositeMessage); // (fallback, then try the diagnostics debugger)
            }
            if (Diagnostics && Diagnostics.log)
                Diagnostics.log(title, message, type, false); // (if 'System.Exception' is thrown it will also auto log and this line is never reached)
        }
        else
            if (throwOnError && type == LogTypes.Error)
                throw new Error(compositeMessage);

        return compositeMessage;
    }

    /** Logs the error message to the console (if available) and throws the error.
      *  By default errors are thrown instead of being returned.  Set 'throwException' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {boolean} throwException If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    export function error(title: string, message: string, source?: any, throwException = true, useLogger = true): string {
        return log(title, message, LogTypes.Error, source, throwException, useLogger);
    }

    // ------------------------------------------------------------------------------------------------------------------------

    /**
     * Logs and rejects a promise upon error.
     * @param rej The Promise rejection callback.
     * @param reason The reason for the rejection.  This is also logged if 'logmsg' is undefined/null/empty.
     * @param logmsg The message to log (using console.error()). This defaults to 'reason' if undefined/null/empty.
     */
    export function reject(rej: (reason?: any) => void, reason: any, logmsg?: string): string {
        if (logmsg === void 0 || logmsg === null || logmsg === "")
            logmsg = JSON.stringify(reason);
        error('Promise rejected', logmsg);
        rej && rej(reason);
        return logmsg; // (returning this is not important; it is here mainly to allow using 'return' to allowing exiting more cleanly)
    }

    /**
     * Logs and rejects a promise upon error.
     * @param res The Promise resolve callback.
     * @param value The value for the resolution.  This is also logged if 'logmsg' is undefined/null/empty.
     * @param logmsg The message to log (using console.error()). This defaults to 'reason' if undefined/null/empty.
     */
    export function resolve(res: (value?: any) => void, value: any, logmsg?: string): string {
        if (logmsg === void 0 || logmsg === null || logmsg === "")
            logmsg = JSON.stringify(value);
        log('Promise resolved', logmsg);
        res && res(value);
        return logmsg; // (returning this is not important; it is here mainly to allow using 'return' to allowing exiting more cleanly)
    }

    // ------------------------------------------------------------------------------------------------------------------------
}

// ============================================================================================================================
