var DS;
(function (DS) {
    // ############################################################################################################################
    // FileManager
    let VirtualFileSystem;
    (function (VirtualFileSystem) {
        // ========================================================================================================================
        VirtualFileSystem.Abstracts._defaultCreateDirHandler = function (fileManager, parent) {
            return new Directory(fileManager, parent);
        };
        class Directory extends VirtualFileSystem.Abstracts.Directory {
        }
        VirtualFileSystem.Directory = Directory;
        VirtualFileSystem.Abstracts._defaultCreateFileHandler = function (fileManager, parent, content) {
            return new File(fileManager, parent, content);
        };
        class File extends VirtualFileSystem.Abstracts.File {
            constructor(fileManager, parent, content) {
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
            async read() {
                return null;
            }
        }
        VirtualFileSystem.File = File;
        class FileManager extends VirtualFileSystem.Abstracts.FileManager {
            /** The API endpoint to the directory for the current user. */
            static get currentUserEndpoint() { return VirtualFileSystem.combine(DS.IO.apiEndpoint, FileManager.currentUser._id); }
            /** Manages the global file system for FlowScript by utilizing local storage space and remote server space.
             * The file manager tries to keep recently accessed files local (while backed up to remove), and off-loads
             * less-accessed files to save space.
             */
            static get current() { return this._current || (this._current = new FileManager()); }
        }
        VirtualFileSystem.FileManager = FileManager;
        // ========================================================================================================================
    })(VirtualFileSystem = DS.VirtualFileSystem || (DS.VirtualFileSystem = {}));
    // ############################################################################################################################
})(DS || (DS = {}));
//# sourceMappingURL=VirtualFileSystem.js.map