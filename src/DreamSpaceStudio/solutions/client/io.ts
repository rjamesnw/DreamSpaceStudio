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


        function hasStorageSupport(funcName: string, path: string, reject: (reason?: any) => void) {
            if (!Store.hasLocalStorage) {
                reject(new Exception("IO.read(): This host does not support local storage, or local storage is disabled.", path));
                return false;
            }
            else return true;
        }

        /** Loads a file and returns the contents as text. */
        IO.read = async function (path: string): Promise<Uint8Array> {
            return new Promise<any>((resolve, reject) => {
                if (!hasStorageSupport("IO.read()", path, reject)) return;
                var content = Store.get(Store.StorageType.Local, path, "DSFS");
                return StringUtils.stringToByteArray(content);
            });
        }

        IO.write = async function (path: string, content: Uint8Array): Promise<void> {
            return new Promise<any>((resolve, reject) => {
                if (!hasStorageSupport("IO.write()", path, reject)) return;
                Store.set(Store.StorageType.Local, path, StringUtils.byteArrayToString(content), "DSFS");
            });
        }

        /** Lists the contents of a directory. */
        IO.getFiles = async function (path: string): Promise<string[]> {
            return new Promise<any>((resolve, reject) => {
                if (!hasStorageSupport("IO.getFiles()", path, reject)) return;
            });
        }

        /** Lists the contents of a directory. */
        IO.getDirectories = async function (path: string): Promise<string[]> {
            return new Promise<any>((resolve, reject) => {
                if (!hasStorageSupport("IO.getDirectories()", path, reject)) return;
            });
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}