namespace DS {
    export interface ISavedFileVersion extends ISavedTrackableObject {
        "filename": string;
        "originalFilename": string;
        "file": string; // (GUID)
        "originalFile": string; // (GUID)
        "version": number;
        "replacedOn": string; // (ISO UTC)
    }

    export class FileVersion extends TrackableObject {
        readonly file: VirtualFileSystem.Abstracts.File;
        readonly replacedOn: Date; // (if this is undefined then the entry is the latest active version)

        /** The absolute file name under which the associated file is saved under. If not specified, then a GUID value will be generated
         * and used automatically. 
         */
        readonly _fileID: string;

        /** The original file name if changed, since replaced files may have the ISO UTC date-time stamp appended. */
        readonly _originalFileID: string;

        get filename() { var file = VirtualFileSystem.FileManager.getFileByID(this._originalFileID); return file && file.name || ''; }

        /** Returns true if this version is the current version.  Current versions remain in their proper locations and do not
         * exist in the 'versions' repository.
         */
        get isCurrent() { return !this._originalFileID; }

        /** The version of this persistable instance. If a version number is set, then it will be added to the file name.
         * If not set (the default), then versioning will not be used. Any value set that is less than 1 will be push up to 1 as the
         * starting value during the save process.
         */
        get version(): number { return typeof this._version == 'number' ? this._version : void 0; }
        set version(v: number) { this._version = typeof v != 'number' ? 1 : v < 1 ? 1 : v; }
        private _version?: number;

        /** An optional description for this version. */
        _versionDescription?: string;

        /* Returns the file name with the version appended, or just the file name if no version exists. 
         * This name updates according to the '_originalFilename', 'replacedOn', and 'version' values. It is NOT the current
         * name of the file version. Changing those properties will not change the current name originally saved under, which
         * is stored in the '_filename' property.
         */
        get versionedFileName() {
            return this._originalFileID + (this.replacedOn && this.replacedOn.toISOString ? '_' + this.replacedOn.toISOString() : "") + (this.version > 0 ? "_" + this.version : "");
        }

        constructor(public readonly versionManager: VersionManager, public readonly originalFile: VirtualFileSystem.Abstracts.File) {
            super();

        }

        /** Saves the versioning details to an object. If no object is specified, then a new empty object is created and returned. */
        saveConfigToObject<T extends ISavedPersistableObject>(target?: T & ISavedFileVersion) {
            target = super.saveConfigToObject(target);

            target.version = (this._version || 0) + 1 || 1; // (increment version before saving)

            return target;
        }

        /** Loads data from a given object. 
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incomming config file.
         */
        loadConfigFromObject(source?: ISavedFileVersion, replace = false): this {
            if (source) {
                super.loadConfigFromObject(source, replace);

                var _this = <Writeable<this>>this;

                _this._version = typeof source.version == 'number' ? (source.version > 0 ? source.version : 1) : void 0;
            }
            return this;
        }

        /** The given file will replace the current file, sending the current file into the 'versions' repository.
         * Note that you can only version a non-versioned file ('isCurrent==true'), otherwise an error will be thrown.
         */
        async replaceWith(newfile: VirtualFileSystem.Abstracts.File): Promise<FileVersion> {
            if (!newfile) return;
            if (!(newfile instanceof VirtualFileSystem.Abstracts.File)) throw `Failed to replace file '${this._filename}' with a non-VirtualFileSystem.Abstract.File object. The value given was: ${JSON.stringify(newfile)}`;
            if (!this.isCurrent)
                throw `You cannot re-version a versioned file. You attempted to replace file '${this._filename}' with file '${newfile.absolutePath}'.`;

            // ... make sure file has a version entry first ...

            var newFileVersion = this.versionManager.add(newfile);

            throw Exception.notImplemented("DS.FileVersion.replaceWith()");
            // TODO: Implement replace code to replace this current version with the givne file.
        }
    }

    /** Manages lists of file versions. 
     * This object acts like a trash bin by assigning a version counter and date/time to a file in the virtual file system.
     */
    export class VersionManager extends PersistableObject {
        static current = new VersionManager();

        /* The base path where all the replaced files end up. The versioning system will simply swap files as requested from
         * this base directory and the source target directory.
         */
        static versionsBasePath: string = "versions";
        readonly versions: FileVersion[] = [];

        readonly _fs: VirtualFileSystem.FileManager;

        private _fileToVersionMap = <{ [fileGuid: string]: FileVersion }>{}; // (maps a file GUID to a file version for quick lookup)

        constructor(fs?: VirtualFileSystem.FileManager) {
            super();
            this._fs = fs;
        }

        /** Gets a file version given either a file object reference or GUID. 
         * If no version exists then 'undefined' is returned.
         */
        getVersion(file: VirtualFileSystem.Abstracts.File | string) {
            var id = file && (<VirtualFileSystem.Abstracts.File>file).$id || <string>file;
            return this._fileToVersionMap[id];
        }

        /** Adds a file to the version control system, if not already added. 
         * If the file is already versioned then the version entry is returned.
         * The file is not moved from its current location.
         */
        add(file: VirtualFileSystem.Abstracts.File) {
            var v = this.getVersion(file);
            if (!v)
                this.versions.push(v = new FileVersion(this, file));
            return v;
        }

        /** Adds two files to the version control system, if not already added, then replaces the current file with the new file.
         * The file is replaced by moving the file into the versions repository under a special version name, and moving the new
         * file into the place of the current file.
         */
        async replace(currentfile: VirtualFileSystem.Abstracts.File, newfile: VirtualFileSystem.Abstracts.File): FileVersion {
            var cFileVersion = this.add(currentfile);
            var newVersion = await cFileVersion.replaceWith(newfile);
            return newVersion;
        }
    }
}