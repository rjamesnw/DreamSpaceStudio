namespace DS {

    // ############################################################################################################################
    // FileManager

    export namespace VirtualFileSystem {
        // ========================================================================================================================

        Abstracts._defaultCreateDirHandler = function (fileManager: FileManager, parent?: DirectoryItem) {
            return new Directory(fileManager, parent);
        };

        export class Directory extends Abstracts.Directory {
        }

        Abstracts._defaultCreateFileHandler = function (fileManager: FileManager, parent?: DirectoryItem, content?: string) {
            return new File(fileManager, parent, content);
        };

        export class File extends Abstracts.File {
            constructor(fileManager: FileManager, parent?: DirectoryItem, content?: string) {
                super(fileManager, parent, content);
            }

            //async saveToLocal() {
            //    var store = Store.getStorage(Store.StorageType.Local);
            //    store.setItem(this.absolutePath, this.content);
            ////}

            //async loadFromLocal() {
            //    var store = Store.getStorage(Store.StorageType.Local);
            //    this.content = store.getItem(this.absolutePath);
            // or
            //    var content = Store.get(Store.StorageType.Local, path, "DSFS");
            //    return StringUtils.stringToByteArray(content);
            //}

            async read(): Promise<Uint8Array> {
                return null;
            }
        }

        export class FileManager extends Abstracts.FileManager {
            /** The API endpoint to the directory for the current user. */
            static get currentUserEndpoint() { return combine(DS.IO.apiEndpoint, FileManager.currentUser._id); }

            /** Manages the global file system for FlowScript by utilizing local storage space and remote server space.
             * The file manager tries to keep recently accessed files local (while backed up to remove), and off-loads
             * less-accessed files to save space.
             */
            static get current() { return this._current || (this._current = new FileManager()); }
            private static _current: FileManager;
        }

        // ========================================================================================================================
    }

    // ############################################################################################################################
}