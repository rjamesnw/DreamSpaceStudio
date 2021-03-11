// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction for the client side only.

namespace DS {
    // ========================================================================================================================

    export namespace IO {
        // --------------------------------------------------------------------------------------------------------------------

        /** This even is triggered when the user should wait for an action to complete. */
        export var onBeginWait = new EventDispatcher<typeof IO, { (msg: string): void }>(IO, "onBeginWait", true);

        /** This even is triggered when the user no longer needs to wait for an action to complete. */
        export var onEndWait = new EventDispatcher<typeof IO, { (): void }>(IO, "onEndWait", true);

        var __waitRequestCounter = 0; // (allows stacking calls to 'wait()')

        /**
         * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
         * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
         * @param msg An optional message to display (default is 'Please wait...').
         */
        export function wait(msg = "Please wait ...") {
            if (__waitRequestCounter == 0) // (fire only one time)
                onBeginWait.dispatch(msg);
            __waitRequestCounter++;
        }

        /**
         * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
         * Plugins can hook into the 'onEndWait' event to be notified.
         * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
         */
        export function closeWait(force = false) {
            if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
                __waitRequestCounter = 0;
                onEndWait.dispatch();
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** The URL endpoint for the system API. */
        export var apiEndpoint = "/api/system/filesystem";

        /** The key for communication with the back-end. If missing, the user will have to login first. */
        export var sessionId: string;
        /** How long the session is valid for. Each API call extends this.  */
        export var sessionTimeout: DS.TimeSpan;

        /** A callback hook used when the system needs to prompt the user for a login or password. */
        export var onLogin: { (): Promise<{ username: string, password: string }> };

        export async function getAPISession(username: string, password: string) {

        }

        /**
         * Determines if local storage is supported on the device.  For example, it may not be available when browsing in private mode on a mobile device.
         * @param funcName The name of the function that is calling this function (for the error message).
         * @param path The path in question (for error reporting).
         * @param reject Although true/false is returned, you can use this to conveniently reject a promise.
         */
        function hasStorageSupport(funcName: string, path?: string, reject?: (reason?: any) => void) {
            if (!Store.hasLocalStorage) {
                typeof reject == 'function' && reject(new Exception(funcName + ": This host does not support local storage, or local storage is disabled.", path));
                return false;
            }
            else return true;
        }

        /** Loads a file and returns the contents as text. */
        IO.read = async function (path: string): Promise<Uint8Array> {
            var sid = await getAPISession();
        }

        IO.write = async function (path: string, content: Uint8Array): Promise<void> {
            return new Promise<any>((resolve, reject) => {
                if (!hasStorageSupport("IO.write()", path, reject)) return;
                Store.set(Store.StorageType.Local, path, StringUtils.byteArrayToString(content), "DSFS");
            });
        }

        async function _getDir(funcName: string, path: string) {
            var fm = DS.VirtualFileSystem.FileManager.current;
            var dir = await fm.getDirectory(path); // (resolve the path to a directory first)
            if (!dir) throw DS.Exception.error(`IO.${funcName}()`, `There is no directory with the path '${path}'.`, path);
            return dir;
        }

        /** Lists the files in a directory. */
        IO.getFiles = async function (path: string): Promise<VirtualFileSystem.Abstracts.File[]> {
            var dir = await _getDir('getFiles', path); // (resolve the path to a directory first)
            return dir.getFiles();
        }

        /** Lists the sub-directories in a directory. */
        IO.getDirectories = async function (path: string): Promise<VirtualFileSystem.Abstracts.Directory[]> {
            var dir = await _getDir('getFiles', path); // (resolve the path to a directory first)
            return dir.getDirectories();
        }

        /**
         * Checks if a directory or file exists.
         * @param path
         * @param readAccess
         * @param writeAccess
         */
        IO.exists = async function (path: string, readAccess = false, writeAccess = false): Promise<boolean> {
            var fm = DS.VirtualFileSystem.FileManager.current;
            return fm.root.exists(path);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}