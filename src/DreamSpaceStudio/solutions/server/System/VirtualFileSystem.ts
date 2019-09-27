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
        }

        // ========================================================================================================================
    }

    // ############################################################################################################################
}