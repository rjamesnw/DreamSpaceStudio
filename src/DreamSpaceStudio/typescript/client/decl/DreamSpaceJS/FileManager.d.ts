import { User } from "./System/User";
declare abstract class FileSystem {
}
declare namespace FileSystem {
    enum SyncStatus {
        /** Not synchronizing. */
        None = 0,
        /** The content is being uploaded. */
        Uploading = 1,
        /** Upload error. */
        Error = 2,
        /** File now exists on the remote endpoint. */
        Completed = 3
    }
    /** Returns slits and returns the path parts, validating each one and throwing an exception if any are invalid. */
    function getPathParts(path: string): string[];
    class DirectoryItem {
        protected _fileManager: FileManager;
        /** Holds the UTC time the item was stored locally. If this is undefined then the item is in memory only, which might result in data loss if not stored on the server. */
        storedLocally: Date;
        /** Holds the UTC time the item was stored remotely. If this is undefined and the item is not stored locally then the item is only in memory and that could lead to data loss. */
        storedRemotely: Date;
        /** The last time this*/
        readonly lastAccessed: Date;
        /** Updates the 'lastAccessed' date+time value to the current value. Touching this directory item also refreshes the dates of all parent items.
         * When the date of an item changes after a touch, it starts the process of reviewing and synchronizing with the back-end.
         */
        touch(): void;
        private _lastAccessed;
        /** The sync status of this item.
         * Note: Each directory item node syncs in sequence parent-to-child; thus, the child only syncs when the parent succeeds.  That said,
         * to be efficient, the parent will send itself AND all child directories (not files) as one JSON request.
         */
        syncStatus: SyncStatus;
        lastSynced: Date;
        syncError: string;
        /** Returns a reference to the parent item.  If there is no parent, then 'null' is returned.
         */
        /** Sets a new parent type for this.  The current item will be removed from its parent (if any), and added to the given parent. */
        parent: DirectoryItem;
        private _parent;
        readonly name: string;
        private _name;
        protected _childItems: DirectoryItem[];
        protected _childItemsByName: {
            [index: string]: DirectoryItem;
        };
        readonly hasChildren: boolean;
        /** The full path + item name. */
        readonly absolutePath: string;
        constructor(fileManager: FileManager, parent?: DirectoryItem);
        toString(): string;
        /** Checks if a namespace item exists.  You can also provide a nested item path.
          * For example, if the current item is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        exists(name: string, ignore?: DirectoryItem): boolean;
        /** Checks if the given namespace item exists under this item.
          */
        exists(item: DirectoryItem, ignore?: DirectoryItem): boolean;
        /** Resolves a namespace path under this item.  You can provide a nested path if desired.
          * For example, if the current item is 'A/B' within the 'A/B/C/D' path, then you could pass in 'C/D'.
          * If not found, then null is returned.
          * @param {function} typeFilter The type that the returned item must be a derivative of.
          */
        resolve<T extends DirectoryItem>(itemPath: string, typeFilter?: new (...args: any[]) => T): T;
        /** Adds the given item under this item.
          */
        add<T extends DirectoryItem>(item: T): T;
        /** Removes an item under this item. If nothing was removed, then null is returned, otherwise the removed item is returned (not the item passed in). */
        remove<T extends DirectoryItem>(item: T): T;
        /** Removes an item under this item.  If nothing was removed, then null is returned, otherwise the removed item is returned.
         *  You can provide a nested item path if desired. For example, if the current item is 'A/B' within the 'A/B/C/D' namespace,
         *  then you could pass in 'C/D'.
          */
        remove(name: string): DirectoryItem;
        getJSONStructure<T extends typeof DirectoryItem>(typeFilter?: T): void;
    }
    class Directory extends DirectoryItem {
        constructor(fileManager: FileManager, parent?: DirectoryItem);
        /** Returns the directory path minus the filename (up to the last name that is followed by a directory separator,).
         * Since the file API does not support special character such as '.' or '..', these are ignored as directory characters (but not removed).
         * Examples:
         * - "/A/B/C/" => "/A/B/C"
         * - "A/B/C" => "A/B"
         * - "//A/B/C//" => "/A/B/C"
         * - "/" => "/"
         * - "" => ""
         */
        static getPath(filepath: string): string;
        getFile(filePath: string): File;
        getDirectory(path: string): Directory;
        /** Creates a directory under the user root endpoint. */
        createDirectory(path: string): Directory;
        createFile(filePath: string, contents?: string): File;
        getJSONStructure(): void;
    }
    class File extends DirectoryItem {
        contents: string;
        private _contents;
        constructor(fileManager: FileManager, parent?: DirectoryItem, content?: string);
        /** Returns the directory path minus the filename (up to the last name that is followed by a directory separator,).
        * Since the file API does not support special character such as '.' or '..', these are ignored as directory characters (but not removed).
        * Examples:
        * - "/A/B/C/" => ""
        * - "A/B/C" => "C"
        * - "/" => ""
        * - "" => ""
        */
        static getName(filepath: string): string;
        toBase64(): string;
        fromBase64(contentsB64: string): void;
        saveToLocal(): void;
        loadFromLocal(): void;
    }
    /** Manages files in a virtual file system. This allows project files to be stored locally and synchronized with the server when a connection is available.
     * For off-line storage to work, the browser must support local storage.
     * Note: The 'FlowScript.currentUser' object determines the user-specific root directory for projects.
     */
    class FileManager {
        /** The URL endpoint for the FlowScript project files API. Defaults to 'FileManager.apiEndpoint'. */
        apiEndpoint: string;
        /** The URL endpoint for the FlowScript project files API. */
        static apiEndpoint: string;
        /** Just a local property that checks for and returns 'FlowScript.currentUser'. */
        static readonly currentUser: User;
        /** The API endpoint to the directory for the current user. */
        static readonly currentUserEndpoint: string;
        /** The root directory represents the API endpoint at 'FileManager.apiEndpoint'. */
        readonly root: Directory;
        constructor(
        /** The URL endpoint for the FlowScript project files API. Defaults to 'FileManager.apiEndpoint'. */
        apiEndpoint?: string);
        /** Gets a directory under the current user root endpoint.
         * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
         */
        getDirectory(path?: string, userId?: string): Directory;
        /** Creates a directory under the current user root endpoint.
         * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
         */
        createDirectory(path: string, userId?: string): Directory;
        /** Gets a file under the current user root endpoint.
         * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
         */
        getFile(filePath: string, userId?: string): File;
        /** Creates a file under the current user root endpoint.
         * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
         */
        createFile(filePath: string, contents?: string, userId?: string): File;
    }
    var restrictedFilenameRegex: RegExp;
    /** Returns true if a given filename contains invalid characters. */
    function isValidFileName(name: string): boolean;
    /** Combine two paths into one. */
    function combine(path1: string, path2: string): string;
    /** Manages the global file system for FlowScript by utilizing local storage space and remote server space.
     * The file manager tries to keep recently accessed files local (while backed up to remove), and off-loads
     * less-accessed files to save space.
     */
    var fileManager: FileManager;
}
export { FileSystem };
