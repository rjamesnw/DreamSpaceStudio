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
        }

        // ========================================================================================================================
    }

    // ############################################################################################################################
}