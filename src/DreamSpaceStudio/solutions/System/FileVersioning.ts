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
        readonly file: VirtualFileSystem.Abstract.File;
        readonly replacedOn: Date; // (if this is undefined then the entry is the latest active version)

        /** The file name to save the underlying data as. If not specified, then a GUID value will be generated and used automatically. */
        readonly _filename: string;

        /** The original file name if changed, since replaced files may have the ISO UTC date-time stamp appended. */
        readonly _originalFilename: string;

        /** The version of this persistable instance. If a version number is set, then it will be added to the file name.
         * If not set (the default), then versioning will not be used. Any value set that is less than 1 will be push up to 1 as the
         * starting value during the save process.
         */
        get version(): number { return typeof this._version == 'number' ? this._version : void 0; }
        set version(v: number) { this._version = typeof v != 'number' ? 1 : v < 1 ? 1 : v; }
        private _version?: number;

        /** An optional description for this version. */
        _versionDescription?: string;

        /* Returns the file name with the version appended, or just the file name if no version exists. */
        get versionedFileName() {
            return this._filename + (this.replacedOn && this.replacedOn.toISOString ? '_' + this.replacedOn.toISOString() : "") + (this.version > 0 ? "_" + this.version : "");
        }

        constructor(public readonly versionManager: VersionManager, public readonly originalFile: VirtualFileSystem.Abstract.File) {
            super();

        }

        /** Saves the versioning details to an object. If no object is specified, then a new empty object is created and returned. */
        saveToObject<T extends ISavedPersistableObject>(target?: T & ISavedFileVersion) {
            target = super.saveToObject(target);

            target.version = (this._version || 0) + 1 || 1; // (increment version before saving)

            return target;
        }

        /** Loads data from a given object. 
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incomming config file.
         */
        loadFromObject(source?: ISavedFileVersion, replace = false): this {
            if (source) {
                super.loadFromObject(source, replace);

                var _this = <Writeable<this>>this;

                _this._version = typeof source.version == 'number' ? (source.version > 0 ? source.version : 1) : void 0;
            }
            return this;
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
        getVersion(file: VirtualFileSystem.Abstract.File | string) {
            var id = file && (<VirtualFileSystem.Abstract.File>file).$id || <string>file;
            return this._fileToVersionMap[id];
        }

        /** Adds a file to the version control system, if not already added. */
        add(file: VirtualFileSystem.Abstract.File) {
            var v = this.getVersion(file);
            if (!v)
                this.versions.push(v = new FileVersion(this, file));
            return v;
        }
    }
}