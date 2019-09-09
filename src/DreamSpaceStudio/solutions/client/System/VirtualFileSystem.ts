namespace DS {

    // ############################################################################################################################
    // FileManager

    export namespace VirtualFileSystem {
        // ========================================================================================================================

        Abstract._defaultCreateDirHandler = function (fileManager: FileManager, parent?: DirectoryItem) {
            return new Directory(fileManager, parent);
        };

        export class Directory extends Abstract.Directory {
        }

        Abstract._defaultCreateFileHandler = function (fileManager: FileManager, parent?: DirectoryItem, content?: string) {
            return new File(fileManager, parent, content);
        };

        export class File extends Abstract.File {
            constructor(fileManager: FileManager, parent?: DirectoryItem, content?: string) {
                super(fileManager, parent, content);
            }

            async saveToLocal() {
                var store = Store.getStorage(Store.StorageType.Local);
                store.setItem(this.absolutePath, this.contents);
            }

            async loadFromLocal() {
                var store = Store.getStorage(Store.StorageType.Local);
                this.contents = store.getItem(this.absolutePath);
            }

            async read(): Promise<Uint8Array> {
                var fs: typeof import("fs") = require("fs");
                var util: typeof import("util") = require("util");
                var readFile = util.promisify(fs.readFile);
                var contents = await readFile(this.absolutePath);
                return contents;
            }
        }

        // ========================================================================================================================
    }

    // ############################################################################################################################
}