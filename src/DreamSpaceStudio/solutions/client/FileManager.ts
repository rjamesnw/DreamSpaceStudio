namespace DS {

    // ############################################################################################################################
    // FileManager

    export namespace VirtualFileSystem {
        // ========================================================================================================================

        export class ClientFile extends File {

            constructor(fileManager: FileManager, parent?: DirectoryItem, content?: string) {
                super(fileManager, parent, content);
            }

            saveToLocal() {
                var store = Store.getStorage(Store.StorageType.Local);
                store.setItem(this.absolutePath, this.contents);
            }

            loadFromLocal() {
                var store = Store.getStorage(Store.StorageType.Local);
                this.contents = store.getItem(this.absolutePath);
            }
        }

        // ========================================================================================================================
    }

    // ############################################################################################################################
}