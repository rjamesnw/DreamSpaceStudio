// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction for the client side only.
var DS;
(function (DS) {
    // ========================================================================================================================
    let IO;
    (function (IO) {
        // --------------------------------------------------------------------------------------------------------------------
        /** This even is triggered when the user should wait for an action to complete. */
        IO.onBeginWait = new DS.EventDispatcher(IO, "onBeginWait", true);
        /** This even is triggered when the user no longer needs to wait for an action to complete. */
        IO.onEndWait = new DS.EventDispatcher(IO, "onEndWait", true);
        var __waitRequestCounter = 0; // (allows stacking calls to 'wait()')
        /**
         * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
         * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
         * @param msg An optional message to display (default is 'Please wait...').
         */
        function wait(msg = "Please wait ...") {
            if (__waitRequestCounter == 0) // (fire only one time)
                IO.onBeginWait.dispatch(msg);
            __waitRequestCounter++;
        }
        IO.wait = wait;
        /**
         * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
         * Plugins can hook into the 'onEndWait' event to be notified.
         * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
         */
        function closeWait(force = false) {
            if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
                __waitRequestCounter = 0;
                IO.onEndWait.dispatch();
            }
        }
        IO.closeWait = closeWait;
        // --------------------------------------------------------------------------------------------------------------------
        /** The URL endpoint for the system API. */
        IO.apiEndpoint = "/api/system/filesystem";
        async function getAPISession(username, password) {
        }
        IO.getAPISession = getAPISession;
        /**
         * Determines if local storage is supported on the device.  For example, it may not be available when browsing in private mode on a mobile device.
         * @param funcName The name of the function that is calling this function (for the error message).
         * @param path The path in question (for error reporting).
         * @param reject Although true/false is returned, you can use this to conveniently reject a promise.
         */
        function hasStorageSupport(funcName, path, reject) {
            if (!DS.Store.hasLocalStorage) {
                typeof reject == 'function' && reject(new DS.Exception(funcName + ": This host does not support local storage, or local storage is disabled.", path));
                return false;
            }
            else
                return true;
        }
        /** Loads a file and returns the contents as text. */
        IO.read = async function (path) {
            var sid = await getAPISession();
        };
        IO.write = async function (path, content) {
            return new Promise((resolve, reject) => {
                if (!hasStorageSupport("IO.write()", path, reject))
                    return;
                DS.Store.set(DS.Store.StorageType.Local, path, DS.StringUtils.byteArrayToString(content), "DSFS");
            });
        };
        async function _getDir(funcName, path) {
            var fm = DS.VirtualFileSystem.FileManager.current;
            var dir = await fm.getDirectory(path); // (resolve the path to a directory first)
            if (!dir)
                throw DS.Exception.error(`IO.${funcName}()`, `There is no directory with the path '${path}'.`, path);
            return dir;
        }
        /** Lists the files in a directory. */
        IO.getFiles = async function (path) {
            var dir = await _getDir('getFiles', path); // (resolve the path to a directory first)
            return dir.getFiles();
        };
        /** Lists the sub-directories in a directory. */
        IO.getDirectories = async function (path) {
            var dir = await _getDir('getFiles', path); // (resolve the path to a directory first)
            return dir.getDirectories();
        };
        /**
         * Checks if a directory or file exists.
         * @param path
         * @param readAccess
         * @param writeAccess
         */
        IO.exists = async function (path, readAccess = false, writeAccess = false) {
            var fm = DS.VirtualFileSystem.FileManager.current;
            return fm.root.exists(path);
        };
        // --------------------------------------------------------------------------------------------------------------------
    })(IO = DS.IO || (DS.IO = {}));
    // ========================================================================================================================
})(DS || (DS = {}));
//# sourceMappingURL=io.js.map