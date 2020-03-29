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

        // ========================================================================================================================
    }

    // ############################################################################################################################
}