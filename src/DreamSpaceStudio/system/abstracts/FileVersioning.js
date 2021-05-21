var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var DS;
(function (DS) {
    var __version;
    class FileVersion extends DS.TrackableObject {
        constructor(versionManager, originalFile) {
            super();
            this.versionManager = versionManager;
            this.originalFile = originalFile;
            __version.set(this, void 0);
        }
        get filename() { var file = DS.VirtualFileSystem.FileManager.getFileByID(this._originalFileID); return file && file.name || ''; }
        /** Returns true if this version is the current version.  Current versions remain in their proper locations and do not
         * exist in the 'versions' repository.
         */
        get isCurrent() { return !this._originalFileID; }
        /** The version of this persistable instance. If a version number is set, then it will be added to the file name.
         * If not set (the default), then versioning will not be used. Any value set that is less than 1 will be push up to 1 as the
         * starting value during the save process.
         */
        get version() { return typeof this._version == 'number' ? this._version : void 0; }
        set version(v) { this._version = typeof v != 'number' ? 1 : v < 1 ? 1 : v; }
        /* Returns the file name with the version appended, or just the file name if no version exists.
         * This name updates according to the '_originalFilename', 'replacedOn', and 'version' values. It is NOT the current
         * name of the file version. Changing those properties will not change the current name originally saved under, which
         * is stored in the '_filename' property.
         */
        get versionedFileName() {
            return this._originalFileID + (this.replacedOn && this.replacedOn.toISOString ? '_' + this.replacedOn.toISOString() : "") + (this.version > 0 ? "_" + this.version : "");
        }
        /** Saves the versioning details to an object. If no object is specified, then a new empty object is created and returned. */
        saveConfigToObject(target) {
            target = super.saveConfigToObject(target);
            target.version = (this._version || 0) + 1 || 1; // (increment version before saving)
            return target;
        }
        /** Loads data from a given object.
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incomming config file.
         */
        loadConfigFromObject(source, replace = false) {
            if (source) {
                super.loadConfigFromObject(source, replace);
                __classPrivateFieldSet(this, __version, typeof source.version == 'number' ? (source.version > 0 ? source.version : 1) : void 0);
            }
            return this;
        }
        /** The given file will replace the current file, sending the current file into the 'versions' repository.
         * Note that you can only version a non-versioned file ('isCurrent==true'), otherwise an error will be thrown.
         */
        async replaceWith(newfile) {
            if (!newfile)
                return;
            if (!(newfile instanceof DS.VirtualFileSystem.Abstracts.File))
                throw `Failed to replace file '${this._filename}' with a non-VirtualFileSystem.Abstract.File object. The value given was: ${JSON.stringify(newfile)}`;
            if (!this.isCurrent)
                throw `You cannot re-version a versioned file. You attempted to replace file '${this._filename}' with file '${newfile.absolutePath}'.`;
            // ... make sure file has a version entry first ...
            var newFileVersion = this.versionManager.add(newfile);
            throw DS.Exception.notImplemented("DS.FileVersion.replaceWith()");
            // TODO: Implement replace code to replace this current version with the givne file.
        }
    }
    __version = new WeakMap();
    DS.FileVersion = FileVersion;
    /** Manages lists of file versions.
     * This object acts like a trash bin by assigning a version counter and date/time to a file in the virtual file system.
     */
    class VersionManager extends DS.PersistableObject {
        constructor(fs) {
            super();
            this.versions = [];
            this._fileToVersionMap = {}; // (maps a file GUID to a file version for quick lookup)
            this._fs = fs;
        }
        /** Gets a file version given either a file object reference or GUID.
         * If no version exists then 'undefined' is returned.
         */
        getVersion(file) {
            var id = file && file.$id || file;
            return this._fileToVersionMap[id];
        }
        /** Adds a file to the version control system, if not already added.
         * If the file is already versioned then the version entry is returned.
         * The file is not moved from its current location.
         */
        add(file) {
            var v = this.getVersion(file);
            if (!v)
                this.versions.push(v = new FileVersion(this, file));
            return v;
        }
        /** Adds two files to the version control system, if not already added, then replaces the current file with the new file.
         * The file is replaced by moving the file into the versions repository under a special version name, and moving the new
         * file into the place of the current file.
         */
        async replace(currentfile, newfile) {
            var cFileVersion = this.add(currentfile);
            var newVersion = await cFileVersion.replaceWith(newfile);
            return newVersion;
        }
    }
    VersionManager.current = new VersionManager();
    /* The base path where all the replaced files end up. The versioning system will simply swap files as requested from
     * this base directory and the source target directory.
     */
    VersionManager.versionsBasePath = "versions";
    DS.VersionManager = VersionManager;
})(DS || (DS = {}));
//# sourceMappingURL=FileVersioning.js.map