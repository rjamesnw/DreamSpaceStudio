var DS;
(function (DS) {
    // ############################################################################################################################
    // FileManager
    let VirtualFileSystem;
    (function (VirtualFileSystem) {
        // ========================================================================================================================
        let SyncStatus;
        (function (SyncStatus) {
            /** Not synchronizing. */
            SyncStatus[SyncStatus["None"] = 0] = "None";
            /** The content is being uploaded. */
            SyncStatus[SyncStatus["Uploading"] = 1] = "Uploading";
            /** Upload error. */
            SyncStatus[SyncStatus["Error"] = 2] = "Error";
            /** File now exists on the remote endpoint. */
            SyncStatus[SyncStatus["Completed"] = 3] = "Completed";
        })(SyncStatus = VirtualFileSystem.SyncStatus || (VirtualFileSystem.SyncStatus = {}));
        var reviewTimerHandle;
        function _syncFileSystem() {
            reviewTimerHandle = void 0;
        }
        class DirectoryItem extends DS.TrackableObject {
            // --------------------------------------------------------------------------------------------------------------------
            constructor(fileManager, parent) {
                super();
                /** The sync status of this item.
                 * Note: Each directory item node syncs in sequence parent-to-child; thus, the child only syncs when the parent succeeds.  That said,
                 * to be efficient, the parent will send itself AND all child directories (not files) as one JSON request.
                 */
                this.syncStatus = 0;
                this._fileManager = fileManager;
                this.parent = parent;
            }
            /** Returns true if this item tracks a server side item. Items stored server side will always have the `storedRemotely` date and time set.
             * The main use for this flag is to refresh local child items for directories that exist server side, in case of any manual changes.
             */
            get isServerItem() { return !!this.storedRemotely; }
            /** The last time this item as touched.
             * @see touch()
             */
            get lastAccessed() { return this._lastAccessed; }
            /** Updates the 'lastAccessed' date+time value to the current value. Touching this directory item also refreshes the dates of all parent items.
             * When the date of an item changes after a touch, it starts the process of reviewing and synchronizing with the back-end.
             */
            touch() {
                this._lastAccessed = new Date();
                if (this._parent)
                    this._parent.touch();
                else {
                    if (typeof reviewTimerHandle == 'number')
                        clearTimeout(reviewTimerHandle);
                    reviewTimerHandle = setTimeout(_syncFileSystem, 500);
                }
            }
            get name() { return this._name; }
            //get type(): string { return this._type; }
            //private _type: string;
            /** Returns a reference to the parent item.  If there is no parent, then 'null' is returned.
             */
            get parent() { return this._parent; }
            /** Sets a new parent type for this.  The current item will be removed from its parent (if any), and added to the given parent. */
            set parent(parent) {
                if (this._parent)
                    this._parent.remove(this);
                if (parent)
                    parent.add(this);
            }
            /** The full path + item name. */
            get absolutePath() { return this._parent && this._parent.absolutePath + '/' + this._name || this._name; }
            toString() { return this.absolutePath; }
            exists(nameOrItem, ignore) {
                if (nameOrItem === void 0 || nameOrItem === null || !this.hasChildren)
                    return false;
                if (typeof nameOrItem === 'object' && nameOrItem instanceof DirectoryItem) {
                    var item = this._childItemsByName[nameOrItem._name];
                    return !!item && item != ignore;
                }
                var t = this.resolve(nameOrItem);
                return !!t && t != ignore;
            }
            /** Resolves a namespace path under this item.  You can provide a nested path if desired.
              * For example, if the current item is 'A/B' within the 'A/B/C/D' path, then you could pass in 'C/D'.
              * If not found, then null is returned.
              * @param {function} typeFilter The type that the returned item must be a derivative of.
              */
            resolve(itemPath, typeFilter) {
                if (itemPath === void 0 || itemPath === null || !this.hasChildren)
                    return null;
                var parts = DS.Path.getPathNames(itemPath), t = this;
                for (var i = (parts[0] ? 0 : 1), n = parts.length; i < n; ++i) {
                    // (note: 'parts[0]?0:1' is testing if the first entry is empty, which then starts at the next one [to support '/X/Y'])
                    var item = t._childItemsByName[parts[i]];
                    if (!item)
                        return null;
                    else
                        t = item;
                }
                return (typeFilter ? (t instanceof typeFilter ? t : null) : t);
            }
            getJSONStructure(typeFilter) {
                JSON.stringify(this, (k, v) => {
                    if (!k || k == '_childItems' || k == 'name') // ('k' is empty for the root object)
                        if (!typeFilter || !v || v instanceof typeFilter)
                            return v;
                }, 2);
                //var body = this._getJSONStructure(typeFilter, "  ");
                //return "{" + (body ? "\r\n" + body : "") + "}\r\n";
            }
        }
        VirtualFileSystem.DirectoryItem = DirectoryItem;
        let Abstracts;
        (function (Abstracts) {
            class Directory extends DirectoryItem {
                constructor(fileManager, parent) {
                    super(fileManager, parent);
                    this._childItems = [];
                    this._childItemsByName = {};
                }
                /** The function used to create directory instances.
                 * Host programs can overwrite this event property with a handler to create and return derived types instead.
                 */
                static get onCreateDirectory() { return this._onCreateDirectory || Abstracts._defaultCreateDirHandler; }
                static set onCreateDirectory(value) { if (typeof value != 'function')
                    throw "Directory.onCreateDirectory: Set failed - value is not a function."; this._onCreateDirectory = value; }
                get hasChildren() { return !!(this._childItems && this._childItems.length); }
                /**
                 * Get a file relative to this one.
                 * @param path A file path. Can be relative or absolute.
                 */
                getFile(filePath) {
                    var item = this.resolve(filePath);
                    if (!(item instanceof File))
                        return null;
                    return item;
                }
                /**
                 * Get a directory relative to this one.
                 * @param path A directory path. Can be relative or absolute.
                 */
                getDirectory(path) {
                    var item = this.resolve(path);
                    if (!(item instanceof Directory))
                        return null;
                    return item;
                }
                /**
                 * Gets all files in this directory.
                 * @param path A file path. Can be relative or absolute.
                 */
                getFiles() {
                    var files = [];
                    for (var item of this._childItems)
                        if (item instanceof File)
                            files.push(item);
                    return files;
                }
                /**
                 * Gets all directories under this one.
                 */
                getDirectories() {
                    var directories = [];
                    for (var item of this._childItems)
                        if (item instanceof Directory)
                            directories.push(item);
                    return directories;
                }
                /** Creates a directory under the user root endpoint. */
                createDirectory(path) {
                    if (path === void 0 || path === null || !this.hasChildren)
                        return null;
                    var parts = DS.Path.getPathNames(path), item = this; // (if path is empty it should default to this directory)
                    for (var i = (parts[0] ? 0 : 1), n = parts.length; i < n; ++i) {
                        // (note: 'parts[0]?0:1' is testing if the first entry is empty, which then starts at the next one [to support '/X/Y'])
                        var childItem = item._childItemsByName[parts[i]];
                        if (!childItem)
                            item = Directory.onCreateDirectory(this._fileManager, this); // (create new directory names along the route)
                        else if (childItem instanceof Directory)
                            item = childItem; // (directory found, go in and continue)
                        else
                            throw "Cannot create path '" + path + "' under '" + this + "': '" + item + "' is not a directory.";
                    }
                    return item;
                }
                createFile(filePath, contents) {
                    var filename = DS.Path.getName(filePath);
                    var directoryPath = DS.Path.getPath(filePath);
                    if (!filename)
                        throw "A file name is required.";
                    var dir = this.createDirectory(directoryPath);
                    return File.onCreateFile(this._fileManager, dir, contents);
                }
                /** Adds the given item under this item.
                  */
                add(item) {
                    if (item === void 0 || item === null)
                        throw "Cannot add an empty item name/path to '" + this.absolutePath + "'.";
                    if (this.exists(item))
                        throw "The item '" + item + "' already exists in the namespace '" + this.absolutePath + "'.";
                    if (typeof item !== 'object' || !(item instanceof DirectoryItem))
                        throw "The item '" + item + "' is not a valid 'DirectoryItem' object.";
                    if (this._fileManager)
                        this._fileManager['onItemAdding'](this);
                    if (item.parent)
                        if (item.parent == this)
                            return item;
                        else
                            item.parent.remove(item);
                    item['_parent'] = this;
                    if (!this._childItems)
                        this._childItems = [];
                    if (!this._childItemsByName)
                        this._childItemsByName = {};
                    this._childItems.push(item);
                    this._childItemsByName[item.name] = item;
                    if (this._fileManager)
                        this._fileManager['onItemAdded'](this);
                    return item;
                }
                remove(itemOrName) {
                    if (itemOrName === void 0 || itemOrName === null)
                        throw "Cannot remove an empty name/path from directory '" + this.absolutePath + "'.";
                    if (!this.hasChildren)
                        return null;
                    if (this._fileManager)
                        this._fileManager['onItemRemoving'](this);
                    var parent; // (since types can be added as roots to other types [i.e. no parent references], need to remove item objects as immediate children, not via 'resolve()')
                    if (typeof itemOrName == 'object' && itemOrName instanceof DirectoryItem) {
                        var t = itemOrName;
                        if (!this._childItemsByName[t.name])
                            throw "Cannot remove item: There is no child item '" + itemOrName + "' under '" + this.absolutePath + "'.";
                        parent = this;
                    }
                    else {
                        var t = this.resolve(itemOrName);
                        if (t)
                            parent = t.parent;
                    }
                    if (t && parent) {
                        delete parent._childItemsByName[t.name];
                        var i = parent._childItems.indexOf(t);
                        if (i >= 0)
                            parent._childItems.splice(i, 1);
                        t['_parent'] = null;
                    }
                    if (this._fileManager)
                        this._fileManager['onItemRemoved'](this);
                    return t;
                }
                /** Triggered when a directory item (i.e. directory or file) is about to be added to the system.
                 * To abort you can:
                 *   1. throw an exception - the error message (reason) will be displayed to the user.
                 *   2. return an explicit 'false' value, which will prevent the item from adding without a reason.
                 *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being added.
                 */
                onItemAdding(item) {
                }
                /** Triggered when a directory item (i.e. directory or file) gets added to the system. */
                onItemAdded(item) {
                }
                /** Triggered when a directory item (i.e. directory or file) id about to be removed from the system.
                 * To abort you can:
                 *   1. throw an exception - the error message (reason) will be displayed to the user.
                 *   2. return an explicit 'false' value, which will prevent the item from getting removed without a reason.
                 *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being removed.
                 */
                onItemRemoving(item) {
                }
                /** Triggered when a directory item (i.e. directory or file) gets removed from the system. */
                onItemRemoved(item) {
                }
                getJSONStructure() {
                }
            }
            Abstracts.Directory = Directory;
            class File extends DirectoryItem {
                constructor(fileManager, parent, content) {
                    super(fileManager, parent);
                    if (content !== void 0)
                        this._contents = content instanceof Uint8Array ? content : DS.StringUtils.stringToByteArray(content);
                }
                /** The function used to create file instances.
                 * Host programs can overwrite this event property with a handler to create and return derived types instead.
                 */
                static get onCreateFile() { return this._onCreateFile || Abstracts._defaultCreateFileHandler; }
                static set onCreateFile(value) { if (typeof value != 'function')
                    throw "File.onCreateFile: Set failed - value is not a function."; this._onCreateFile = value; }
                get content() { return this._contents; }
                set content(value) { this._contents = value; this.touch(); }
                get text() { return DS.StringUtils.byteArrayToString(this._contents); }
                set text(value) { this._contents = DS.StringUtils.stringToByteArray(value); this.touch(); }
                /** Converts the contents to text and returns it base-64 encoded. */
                toBase64() { return DS.Encoding.base64Encode(this.text); }
                /** Decodes the base-64 content and updates the current file contents with the result. */
                fromBase64(contentB64) { this.text = DS.Encoding.base64Decode(contentB64); }
                async onSave() {
                    await DS.IO.write(this.absolutePath, this.content);
                    return this; // (returning reference to the file object instead of string as it is copied by reference and thus faster)
                }
                async onLoad() {
                    this.contents = await DS.IO.read(this.absolutePath);
                    return this;
                }
                onAfterSuccessfulSave(result) { }
                onAfterSuccessfulLoad(result) { }
                /** Returns the resource value for this trackable object, which is just the config file contents. */
                async getResourceValue() {
                    try {
                        if (!this.lastAccessed) // ('lastAccessed' is undefined until the first save/load operation)
                            return (await this.read()).text;
                        return this.text;
                    }
                    catch (err) {
                        throw new DS.Exception(`Failed to load contents for project '${this.name}'.`, this, err);
                    }
                }
                getResourceType() {
                    return DS.ResourceTypes.Application_JSON;
                }
            }
            Abstracts.File = File;
            /** Manages files in a virtual file system. This allows project files to be stored locally and synchronized with the server when a connection is available.
             * For off-line storage to work, the browser must support local storage.
             * Note: The 'FlowScript.currentUser' object determines the user-specific root directory for projects.
             */
            class FileManager {
                // --------------------------------------------------------------------------------------------------------------------
                constructor() {
                    this.root = Abstracts.Directory.onCreateDirectory(this);
                }
                static getFileByID(id) { return this._filesByGUID[id]; }
                // --------------------------------------------------------------------------------------------------------------------
                /** Just a local property that checks for and returns 'FlowScript.currentUser'. */
                static get currentUser() { if (DS.User.current)
                    return DS.User.current; throw "'There is no current user! User.changeCurrentUser()' must be called first."; } // (added for convenience, and to make sure TS knows it needs to be defined before this class)
                /** Triggered when a directory item (i.e. directory or file) is about to be added to the system.
                 * To abort you can:
                 *   1. throw an exception - the error message (reason) will be displayed to the user.
                 *   2. return an explicit 'false' value, which will prevent the item from adding without a reason.
                 *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being added.
                 */
                onItemAdding(item) {
                    if (item._id in FileManager._filesByGUID)
                        throw `A directory item with this GUID '${item._id}' (name: '${FileManager._filesByGUID[item._id].name}') already exists.  Please remove the file first before adding it again.`;
                }
                /** Triggered when a directory item (i.e. directory or file) gets added to the system. */
                onItemAdded(item) {
                    FileManager._filesByGUID[item._id] = item;
                }
                /** Triggered when a directory item (i.e. directory or file) id about to be removed from the system.
                 * To abort you can:
                 *   1. throw an exception - the error message (reason) will be displayed to the user.
                 *   2. return an explicit 'false' value, which will prevent the item from getting removed without a reason.
                 *   2. return an explicit string value as a reason (to be displayed to the user), which will prevent the item from being removed.
                 */
                onItemRemoving(item) {
                    if (!(item._id in FileManager._filesByGUID))
                        throw `Cannot remove directory item: No entry with GUID '${item._id}' (name: '${item.name}') was previously added.  This error is thrown to maintain the integrity of the virtual file system, as only existing items should ever be removed.`;
                }
                /** Triggered when a directory item (i.e. directory or file) gets removed from the system. */
                onItemRemoved(item) {
                    if (item._id in FileManager._filesByGUID)
                        delete FileManager._filesByGUID[item._id]; // (speed is not a huge importance here, otherwise we can just set it to 'void 0')
                }
                /** Gets a directory under the current user root endpoint.
                 * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
                 */
                getDirectory(path, userId) {
                    return this.root.getDirectory(combine(userId || FileManager.currentUser._id, path));
                }
                /** Creates a directory under the current user root endpoint.
                 * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
                 */
                createDirectory(path, userId) {
                    return this.root.createDirectory(combine(userId || FileManager.currentUser._id, path));
                }
                /** Gets a file under the current user root endpoint.
                 * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
                 */
                getFile(filePath, userId) {
                    return this.root.getFile(combine(userId || FileManager.currentUser._id, filePath));
                }
                /** Creates a file under the current user root endpoint.
                 * @param userId This is optional, and exists only to reference files imported from other users. When undefined/null, the current user is assumed.
                 */
                createFile(filePath, contents, userId) {
                    return this.root.createFile(combine(userId || FileManager.currentUser._id, filePath), contents);
                }
            }
            FileManager._filesByGUID = {}; // (references files by GUID for faster lookup)
            Abstracts.FileManager = FileManager;
        })(Abstracts = VirtualFileSystem.Abstracts || (VirtualFileSystem.Abstracts = {}));
        // ========================================================================================================================
        /** Combine two paths into one. */
        function combine(path1, path2) {
            return DS.Path.combine(path1 instanceof Abstracts.Directory ? path1.absolutePath : path1, path2 instanceof Abstracts.Directory ? path2.absolutePath : path2);
        }
        VirtualFileSystem.combine = combine;
        // ========================================================================================================================
    })(VirtualFileSystem = DS.VirtualFileSystem || (DS.VirtualFileSystem = {}));
    // ############################################################################################################################
})(DS || (DS = {}));
//# sourceMappingURL=VirtualFileSystem.js.map