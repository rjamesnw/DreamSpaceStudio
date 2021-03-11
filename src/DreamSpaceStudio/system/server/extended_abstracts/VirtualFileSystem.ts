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

            async read(): Promise<Uint8Array> {
                var fs: typeof import("fs") = require("fs");
                var util: typeof import("util") = require("util");
                var readFile = util.promisify(fs.readFile);
                var contents = await readFile(this.absolutePath);
                return contents;
            }
        }

        export class FileManager extends Abstracts.FileManager {
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